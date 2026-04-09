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
import { FaTrashCan } from "react-icons/fa6";

const OrderPage = () => {
  const { orderId } = useParams();
  const user = useSelector((state: any) => state.user);
  const navigate = useNavigate();
  const [newClient, setNewClient] = useState({ clientId: 0 });
  const [orderItems, setOrderItems] = useState([{}]);
  const [clientList, setClientList] = useState([{}]);
  const [vendorList, setVendorList] = useState([{}]);
  const [currentClient, setCurrentClient] = useState({ clientName: null });
  const [productList, setProductList] = useState([{}]);
  const [linkList, setLinkList] = useState([{}]);
  const [unauthorized, setUnauthorized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const promises = [];

      if (Number(orderId) !== 0) {
        promises.push(
          axios.get(`/api/getOrder/${orderId}`).then((res) => {
            if (res.status === 200) {
              if (res.data.orderItems && res.data.orderItems.length > 0) {
                setOrderItems(res.data.orderItems);
              }
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

  const totalQuantity = orderItems.reduce((acc: number, item: any) => {
    const quantity = item.quantity ?? 0;
    return acc + quantity;
  }, 0);

  const totalDeliveries = orderItems.reduce((acc: number, item: any) => {
    return acc + (item.deliveries?.length ?? 0);
  }, 0);

  const orderStatus =
    totalQuantity >= 0 && totalDeliveries === 0
      ? "In Progress"
      : totalDeliveries >= totalQuantity
        ? "Delivered"
        : "Partial";

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
            navigate(`/order/${res.data.orderId}`);
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

  return isLoading ? (
    <Loader />
  ) : unauthorized ? (
    <div className="unauthorized">
      <h2>You are not authorized to view this order</h2>
    </div>
  ) : (
    <div className="order-page-wrapper">
      {Number(orderId) === 0 ? (
        <div className="new-sheet-wrapper">
          <div className="order-profile-wrapper">
            <ProfilePic src={user.profilePic} />
            <h2>New Order</h2>
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
            onClick={() => updateOrder("clientId", newClient.clientId)}
            className="create-sheet-button"
          >
            Create New Order
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="cancel-order-button"
          >
            Cancel
          </button>
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
              {orderStatus !== "In Progress" ? (
                <p>{currentClient?.clientName}</p>
              ) : (
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
              )}
            </div>
            <p className="order-status-p">
              Order Status:{" "}
              <span
                className={
                  orderStatus === "In Progress"
                    ? "order-status in-progress"
                    : orderStatus === "Partial"
                      ? "order-status partial"
                      : "order-status delivered"
                }
              >
                {orderStatus}
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
