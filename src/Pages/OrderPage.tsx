import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import ProfilePic from "../components/UI/ProfilePic";
import { useNavigate } from "react-router";
import axios from "axios";
import ClientPicker from "../components/Orders/ClientPicker";
import OrderItem from "../components/Orders/OrderItem";
import OrderFooter from "../components/Orders/OrderFooter";
import Loader from "../components/UI/Loader";
import { FaMagnifyingGlass } from "react-icons/fa6";
import UserSelector from "../components/UI/UserSelector";
import { capitalize } from "../helpers";

const OrderPage = () => {
  const { orderId, calculatorOrder } = useParams();
  const user = useSelector((state: any) => state.user);
  const navigate = useNavigate();
  const [newClient, setNewClient] = useState({ clientId: 0 });
  const [orderItems, setOrderItems] = useState([{}]);
  const [clientList, setClientList] = useState([{}]);
  const [vendorList, setVendorList] = useState([{}]);
  const [currentClient, setCurrentClient] = useState({
    clientName: null,
    clientId: null,
    userId: null,
  });
  const [productList, setProductList] = useState([{}]);
  const [linkList, setLinkList] = useState([{}]);
  const [unauthorized, setUnauthorized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(1);
  const [users, setUsers] = useState([{}]);
  const [orderStatus, setOrderStatus] = useState("");
  const dropdownRef = useRef<HTMLInputElement>(null);
  const isCalculatorOrder = calculatorOrder === "true";

  const fetchData = async () => {
    try {
      const promises = [];

      if (Number(orderId) !== 0) {
        promises.push(
          axios.get(`/api/getOrder/${orderId}`).then((res) => {
            if (res.status === 200) {
              if (res.data.orderItems && res.data.orderItems.length > 0) {
                const orderItems = res.data.orderItems;
                setOrderItems(
                  orderItems.sort(
                    (a: any, b: any) => a.orderIndex - b.orderIndex,
                  ),
                );
              }
              setOrderStatus(res.data.orderStatus);
              setCurrentUserId(res.data.salesPerson ?? 1);
              setCurrentClient(res.data.client ?? {});
            }
          }),
        );

        promises.push(
          axios.get(`/api/getProducts/${user?.userId}`).then((res) => {
            if (res.status === 200) {
              setProductList(res.data.products);
              setLinkList(res.data.links);
            }
          }),
        );
      }

      promises.push(
        axios.get("/api/getClients").then((res) => {
          if (res.status === 200) setClientList(res.data);
        }),
      );

      promises.push(
        axios.get("/api/getVendors").then((res) => {
          if (res.status === 200) setVendorList(res.data);
        }),
      );

      promises.push(
        axios.get("/api/getUsers").then((res) => {
          if (res.status === 200) setUsers(res.data);
        }),
      );

      await Promise.all(promises);
    } catch (error: any) {
      console.log(error);
      if (error?.response?.status === 404) {
        setNotFound(true);
      }
      if (error?.response?.status === 401) {
        setUnauthorized(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orderId]);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".order-settings-button");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isButtonClick
      ) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettings]);

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setOrderItems((prev) =>
      prev.map((it: any) => (it.itemId === itemId ? { ...it, quantity } : it)),
    );
  };

  const handlePriceChange = (itemId: number, price: number) => {
    setOrderItems((prev) =>
      prev.map((it: any) => (it.itemId === itemId ? { ...it, price } : it)),
    );
  };

  const handleDeliveriesChange = (itemId: number, deliveries: any[]) => {
    setOrderItems((prev) =>
      prev.map((it: any) =>
        it.itemId === itemId ? { ...it, deliveries } : it,
      ),
    );
  };

  const handleOrderItemUpdate = (
    fieldName: string,
    itemId: number,
    value: any,
  ) => {
    console.log(fieldName);
    setOrderItems((prev) =>
      prev.map((it: any) =>
        it.itemId === itemId ? { ...it, fieldName: value } : it,
      ),
    );
  };

  const handleAddItem = async () => {
    try {
      await axios.post("/api/newOrderItem", { orderId }).then((res) => {
        console.log(res.data);
        setOrderItems((prev) => [...prev, res.data]);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const updateOrder = async (fieldName: string, value: any) => {
    if (Number(orderId) === 0) {
      try {
        await axios.post("/api/newOrder", { clientId: value }).then((res) => {
          if (res.status === 200) {
            navigate(`/order/${res.data.orderId}/false`);
          }
        });
      } catch (error) {
        console.log(error);
      }
    } else
      try {
        await axios
          .post("/api/updateOrder", { orderId, fieldName, value })
          .then((res) => {
            if (res.status !== 200) {
              console.log(res);
            }
          });
      } catch (error) {
        console.log(error);
      }
  };

  const deleteOrder = async () => {
    try {
      await axios.post("/api/deleteOrder", { orderId }).then((res) => {
        if (res.status === 200) {
          navigate("/orders");
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleUserSelect = (userId: number) => {
    try {
      updateOrder("salesPerson", userId);
      setCurrentUserId(userId);
    } catch (error) {
      console.log(error);
    }
  };

  return isLoading ? (
    <Loader />
  ) : unauthorized ? (
    <div className="unauthorized">
      <h2>You are not authorized to view this order</h2>
    </div>
  ) : (
    <div className="order-page-wrapper">
      {Number(orderId) === 0 || isCalculatorOrder ? (
        <div className="new-sheet-wrapper">
          <div className="order-profile-wrapper">
            <ProfilePic src={user.profilePic} />
            <h2>{isCalculatorOrder ? `Order #${orderId}` : "New Order"}</h2>
          </div>
          <ClientPicker
            setClientList={setClientList}
            clientList={clientList}
            newClient={newClient}
            setNewClient={setNewClient}
            currentClient={currentClient}
            setCurrentClient={setCurrentClient}
            updateOrder={updateOrder}
            orderId={Number(orderId)}
          />
          <button
            onClick={() => {
              if (isCalculatorOrder) {
                updateOrder("clientId", currentClient?.clientId);
                updateOrder("salesPerson", currentClient?.userId);
                navigate(`/order/${orderId}/false`);
              } else updateOrder("clientId", newClient.clientId);
            }}
            className="create-sheet-button"
          >
            {isCalculatorOrder ? "Add Order To Client" : "Create New Order"}
          </button>
          {!isCalculatorOrder && (
            <button
              onClick={() => navigate("/orders")}
              className="cancel-order-button"
            >
              Cancel
            </button>
          )}
        </div>
      ) : notFound ? (
        <>
          <div className="page-header-wrapper">
            <div className="order-profile-wrapper">
              <ProfilePic src={user.profilePic} />
              <h2>Order #{orderId}</h2>
            </div>
          </div>
          <div className="order-page-body order-not-found">
            <FaMagnifyingGlass className="not-found-icon" />
            <div className="order-not-found-content">
              <h2>404</h2>
              <h3>Order Not Found</h3>
              <button onClick={() => navigate("/orders")}>View Orders</button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="page-header-wrapper">
            <div className="order-profile-wrapper">
              <ProfilePic src={user.profilePic} />
              <h2>Order #{orderId}</h2>
            </div>
            <div className="order-client-wrapper">
              Client:
              <p>{currentClient?.clientName}</p>
            </div>
            <div className="order-sales-wrapper">
              <p>Sales Person:</p>
              <UserSelector
                users={users}
                currentUserId={currentUserId}
                handleSelectUser={handleUserSelect}
              />
            </div>
            <p className="order-status-p">
              Order Status:{" "}
              <span
                className={
                  orderStatus === "in progress"
                    ? "order-status-badge in-progress-badge"
                    : orderStatus === "partial"
                      ? "order-status-badge partial-badge"
                      : "order-status-badge delivered-badge"
                }
              >
                {capitalize(orderStatus)}
              </span>
            </p>
            <div className="order-settings-wrapper">
              <button
                className="order-settings-button"
                onClick={() => setShowSettings(!showSettings)}
              >
                ...
              </button>
              {showSettings && (
                <div
                  className="order-settings-dropdown dropdown"
                  ref={dropdownRef}
                >
                  <div onClick={() => deleteOrder()} className="dropdown-item">
                    Delete Order
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="order-page-body">
            <div className="order-items-list">
              <div className="order-items-list-item order-items-list-head">
                <p>ID</p>
                <p>Date</p>
                <p className="picker-heading">Product</p>
                <p className="picker-heading">Vendor</p>
                <p>Price</p>
                <p className="input-heading">Notes / Restrictions</p>
                <p className="input-heading">Target URL</p>
                <p className="input-heading">Anchor Text</p>
                <p>Status</p>
                {/* <p>Linking From</p> */}
              </div>
              <div className="order-items-list-wrapper">
                {orderItems?.length > 0 &&
                  orderItems?.map(
                    (item: any, index) =>
                      item.itemId && (
                        <OrderItem
                          key={`order-item-${item.itemId}`}
                          item={item}
                          index={index}
                          setOrderItems={setOrderItems}
                          products={productList}
                          linkList={linkList}
                          onQuantityChange={handleQuantityChange}
                          onPriceChange={handlePriceChange}
                          onDeliveriesChange={handleDeliveriesChange}
                          vendorList={vendorList}
                          handleOrderItemUpdate={handleOrderItemUpdate}
                        />
                      ),
                  )}
                <div
                  className="sheet-item new-item-row"
                  onClick={() => handleAddItem()}
                >
                  <p>+</p>
                  <p>Add Product</p>
                </div>
              </div>
              <OrderFooter items={orderItems} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default OrderPage;
