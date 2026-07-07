import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import ProfilePic from "../components/UI/ProfilePic";
import axios from "axios";
import ClientPicker from "../components/Orders/ClientPicker";
import OrderItem from "../components/Orders/OrderItem";
import OrderFooter from "../components/Orders/OrderFooter";
import Loader from "../components/UI/Loader";
import { FaMagnifyingGlass, FaTrashCan } from "react-icons/fa6";
import UserSelector from "../components/UI/UserSelector";
import { capitalize } from "../helpers";
import BulkStatusPicker from "../components/Orders/BulkStatusPicker";
import BulkSelector from "../components/Orders/BulkSelector";
import FilterDropdown from "../components/UI/FilterDropdown";
import Sorter from "../components/Clients/Sorter";
import DuplicateOrder from "../components/Orders/DuplicateOrder";
import { usePersistedFilter } from "../hooks/usePersistedFilter";
import { saveOrderNotesKeepAlive } from "../helpers";
import Notes from "../components/UI/Notes";
import ProductPicker from "../components/Orders/ProductPicker";

type FilterOption = {
  title: string;
  id?: number;
  profilePic?: string;
};

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
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkSelects, setBulkSelects] = useState([]);
  const [orderTitle, setOrderTitle] = useState("");
  const [currentUserId, setCurrentUserId] = useState(1);
  const [users, setUsers] = useState([{}]);
  const [orderStatus, setOrderStatus] = useState("");
  const [showDuplicateOrder, setShowDuplicateOrder] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);
  const isCalculatorOrder = calculatorOrder === "true";
  const [orderNotes, setOrderNotes] = useState("");
  const [originalOrderTitle, setOriginalOrderTitle] = useState("");
  const listWrapperRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = usePersistedFilter(
    `order/${orderId}/${calculatorOrder}`,
    user.userId,
    {
      due: [],
      product: [],
      vendor: [],
      status: [],
      sort: "",
      direction: "up",
    },
  );
  const [dueDates, setDueDates] = useState<FilterOption[]>([]);
  const [products, setProducts] = useState<FilterOption[]>([]);
  const [vendors, setVendors] = useState<FilterOption[]>([]);
  const [statuses, setStatuses] = useState<FilterOption[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const statusOrder = [
    "staged",
    "ordered",
    "in progress",
    "complete",
    "cancelled",
    "support needed",
  ];

  const createFilters = (items: any) => {
    // Create arrays for filters
    let dueDatesArray: FilterOption[] = [];
    let productsArray: FilterOption[] = [];
    let vendorsArray: FilterOption[] = [];
    let statusesArray: FilterOption[] = [];

    items.forEach((item: any) => {
      if (
        !dueDatesArray.some(
          (date: any) => item.dueDate?.slice(0, 7) === date.id,
        )
      ) {
        if (item.dueDate) {
          const dateArray = item.dueDate?.split("-");
          dueDatesArray.push({
            title: `${dateArray[1]}/${dateArray[0]}`,
            id: item.dueDate,
          });
        }
      }
      if (
        item.product &&
        !productsArray.some(
          (product: any) => product.id === item.product?.productId,
        )
      ) {
        productsArray.push({
          title: item.product.productName,
          id: item.product.productId,
        });
      }
      if (
        item.vendor &&
        !vendorsArray.some((vendor: any) => vendor.id === item.vendor?.vendorId)
      ) {
        vendorsArray.push({
          title: item.vendor.vendorName,
          id: item.vendor.vendorId,
        });
      }
      if (!statusesArray.some((status: any) => status.id === item.itemStatus)) {
        if (item.itemStatus) {
          statusesArray.push({
            title: item.itemStatus,
            id: item.itemStatus,
          });
        }
      }
    });
    setVendors(
      vendorsArray.sort((a: any, b: any) => a.title.localeCompare(b.title)),
    );
    setProducts(
      productsArray.sort((a: any, b: any) => a.title.localeCompare(b.title)),
    );
    setStatuses(
      statusesArray.sort(
        (a: any, b: any) =>
          statusOrder.indexOf(a.id) - statusOrder.indexOf(b.id),
      ),
    );
    setDueDates(
      dueDatesArray.sort(
        (a: any, b: any) => new Date(a.id).getTime() - new Date(b.id).getTime(),
      ),
    );
  };

  const fetchData = async () => {
    try {
      const promises = [];

      if (Number(orderId) !== 0) {
        promises.push(
          axios.get(`/api/getOrder/${orderId}`).then((res) => {
            if (res.status === 200) {
              if (res.data.orderItems && res.data.orderItems.length > 0) {
                const orderItems = res.data.orderItems;
                createFilters(orderItems);
                // set orderItems to allItems
                setOrderItems(
                  orderItems.sort(
                    (a: any, b: any) => a.orderIndex - b.orderIndex,
                  ),
                );
              }
              setOrderStatus(res.data.orderStatus);
              setCurrentUserId(res.data.salesPerson ?? 1);
              setCurrentClient(res.data.client ?? {});
              setOrderTitle(res.data.orderTitle ?? "");
              setOriginalOrderTitle(res.data.orderTitle ?? "");
              setOrderNotes(res.data.orderNotes ?? "");
            }
          }),
        );

        promises.push(
          axios.get("/api/getVendors").then((res) => {
            if (res.status === 200) setVendorList(res.data);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orderId, isCalculatorOrder]);

  useMemo(() => {
    if (orderItems.length > 0) {
      createFilters(orderItems);
    }
  }, [orderItems]);

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
        setShowDuplicateOrder(false);
      }
    };

    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettings]);

  // Filtering / Sorting
  const filteredOrderItems = useMemo(() => {
    let data: any = orderItems;

    if (search.trim() !== "") {
      const searchTerm = search.toLowerCase();
      data = data.filter((item: any) => {
        // Return true since searchTerm only has to match with one of the items, not match all criteria

        // Search in products
        if (item.product?.productName.toLowerCase().includes(searchTerm))
          return true;

        // Search in vendors
        if (item.vendor?.vendorName.toLowerCase().includes(searchTerm))
          return true;

        // Search status date
        if (item.itemStatus?.toLowerCase().includes(searchTerm)) return true;
      });
    }

    // Filtering
    data = data.filter((item: any) => {
      if (!item) {
        return false;
      }
      if (filter.due.length > 0) {
        if (
          !filter.due.some((date: any) => item.dueDate?.slice(0, 7) === date.id)
        )
          return false;
      }
      if (filter.product.length > 0) {
        if (
          !filter.product.some(
            (product: any) => product.id === item.product?.productId,
          )
        )
          return false;
      }
      if (filter.vendor.length > 0) {
        if (
          !filter.vendor.some(
            (vendor: any) => vendor.id === item.vendor?.vendorId,
          )
        )
          return false;
      }
      if (filter.status.length > 0) {
        if (!filter.status.some((status: any) => status.id === item.itemStatus))
          return false;
      }

      return true;
    });

    // Sorting
    if (filter.sort !== "") {
      data = data.sort((a: any, b: any) => {
        const price = (item: any) => {
          const price =
            item.priceSnapshot ??
            item.price ??
            item.product?.defaultPrice ??
            item.link?.price ??
            0;
          return price;
        };

        const cost = (item: any) => {
          const cost =
            item.costSnapshot ??
            item.cost ??
            item.product?.defaultCost ??
            item.link?.cost;

          0;
          return cost;
        };
        switch (filter.sort) {
          case "due":
            return filter.direction === "up"
              ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
            break;

          case "status":
            return filter.direction === "up"
              ? statusOrder.indexOf(a.itemStatus) -
                  statusOrder.indexOf(b.itemStatus)
              : statusOrder.indexOf(b.itemStatus) -
                  statusOrder.indexOf(a.itemStatus);
            break;

          case "price":
            return filter.direction === "up"
              ? price(a) - price(b)
              : price(b) - price(a);
            break;

          case "cost":
            return filter.direction === "up"
              ? cost(a) - cost(b)
              : cost(b) - cost(a);
            break;

          default:
            break;
        }
      });
    }

    return data;
  }, [filter, orderItems, search]);

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

  const handleCostChange = (itemId: number, cost: number) => {
    setOrderItems((prev) =>
      prev.map((it: any) => (it.itemId === itemId ? { ...it, cost } : it)),
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
        it.itemId === itemId ? { ...it, [fieldName]: value } : it,
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

  const updateCalculatorOrder = async () => {
    try {
      await axios
        .post("/api/updateCalculatorOrder", {
          orderId,
          clientId: currentClient?.clientId,
          salesPerson: currentClient?.userId,
        })
        .then((res) => {
          if (res.status === 200) {
            navigate(`/order/${res.data.orderId}/false`);
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

  const handleBulkDelete = async () => {
    try {
      await axios
        .post("/api/bulkDeleteOrderItem", { items: bulkSelects })
        .then(() => {
          const itemsCopy = [...orderItems];
          const filteredItems = itemsCopy.filter(
            (item: any) =>
              !bulkSelects.some(
                (bulkItem: any) => bulkItem.itemId === item?.itemId,
              ),
          );
          console.log(filteredItems);
          setOrderItems(filteredItems);
          setBulkDeleting(false);
          setBulkSelects([]);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDuplicateOrder = async (quantity: number, monthly: boolean) => {
    if (quantity === 0) {
      setShowDuplicateOrder(false);
      setShowSettings(false);
    }
    try {
      await axios
        .post("/api/duplicateOrder", { orderId, quantity, monthly })
        .then(() => {
          setShowDuplicateOrder(false);
          navigate("/orders");
        });
    } catch (error) {
      console.log(error);
    }
  };

  const updateNotes = (notesToSave: any) => {
    if (!orderId) return;
    const valueToSave = notesToSave !== undefined ? notesToSave : orderNotes;
    try {
      axios
        .post("/api/updateOrder", {
          orderId,
          fieldName: "orderNotes",
          value: valueToSave,
        })
        .then(() => {
          setCount(0);
        });
    } catch (error) {}
  };

  const handleUpdateNotes = (notes: string) => {
    setOrderNotes(notes);
    if (count >= 75) {
      updateNotes(notes);
    }
  };

  const handleBulkProductChange = (newItems: any) => {
    setOrderItems((prev) =>
      prev.map((item: any) => {
        const updated = newItems.find((n: any) => n.itemId === item.itemId);
        if (!updated) return item;

        const defaults = updated.product ?? updated.link;

        return {
          ...item,
          ...updated,
          product: updated.product,
          link: updated.link ?? null,
          productType: updated.productType,
          price: defaults?.defaultPrice ?? item.price,
          cost: defaults?.defaultCost ?? item.cost,
          productNameSnapshot: null,
          priceSnapshot: null,
          costSnapshot: null,
        };
      }),
    );
    setBulkSelects([]);
  };

  return isLoading ? (
    <Loader />
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
                updateCalculatorOrder();
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
            <div className="order-client-header-wrapper">
              <ProfilePic src={user.profilePic} />
              <div className="order-profile-wrapper">
                <div className="order-client-wrapper">
                  <h4>Order #{orderId}</h4>
                  <input
                    type="text"
                    placeholder="Title"
                    className="order-title-input"
                    onChange={(e) => setOrderTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateOrder("orderTitle", orderTitle);
                      }
                    }}
                    value={orderTitle}
                    onBlur={(e) => {
                      if (e.target.value !== originalOrderTitle) {
                        updateOrder("orderTitle", orderTitle);
                      }
                    }}
                  />
                </div>
              </div>
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
                  {showConfirmDelete ? (
                    <div className="confirm-delete">
                      <p>Are you sure you want to delete this order?</p>
                      <div className="confirm-delete-buttons">
                        <button
                          className="delete-order"
                          onClick={() => deleteOrder()}
                        >
                          Delete
                        </button>
                        <button onClick={() => setShowConfirmDelete(false)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : !showDuplicateOrder ? (
                    <>
                      <div
                        onClick={() => setShowConfirmDelete(true)}
                        className="dropdown-item"
                      >
                        Delete Order
                      </div>
                      <div
                        className="dropdown-item"
                        onClick={() => setShowDuplicateOrder(true)}
                      >
                        Duplicate Order
                      </div>
                    </>
                  ) : (
                    <DuplicateOrder
                      setShowDuplicateOrder={setShowDuplicateOrder}
                      handleDuplicateOrder={handleDuplicateOrder}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="order-page-body">
            <div className="order-page-top-bar">
              <input
                type="text"
                placeholder="Search"
                className="orders-search-input"
                onChange={(e: any) => setSearch(e.target.value)}
              />
              <Sorter
                filter={filter}
                setFilter={setFilter}
                options={[
                  {
                    heading: "Due Date",
                    sortHeading: "sort",
                    sortValue: "due",
                  },
                  {
                    heading: "Status",
                    sortHeading: "sort",
                    sortValue: "status",
                  },
                  {
                    heading: "Price",
                    sortHeading: "sort",
                    sortValue: "price",
                  },
                  {
                    heading: "Cost",
                    sortHeading: "sort",
                    sortValue: "cost",
                  },
                ]}
                direction={"direction"}
                position="left"
              />
            </div>
            <div className="order-items-list" ref={listWrapperRef}>
              {bulkSelects.length <= 0 ? (
                <div className="order-items-list-item order-items-list-head">
                  <BulkSelector
                    bulkSelects={bulkSelects}
                    setBulkSelects={setBulkSelects}
                    orderItems={filteredOrderItems}
                  />
                  <FilterDropdown
                    heading={"Due"}
                    array={true}
                    options={dueDates}
                    filter={filter}
                    setFilter={setFilter}
                  />
                  <FilterDropdown
                    heading={"Product"}
                    array={true}
                    options={products}
                    filter={filter}
                    setFilter={setFilter}
                  />
                  <FilterDropdown
                    heading={"Vendor"}
                    array={true}
                    options={vendors}
                    filter={filter}
                    setFilter={setFilter}
                  />
                  <FilterDropdown
                    heading={"Status"}
                    array={true}
                    options={statuses}
                    filter={filter}
                    setFilter={setFilter}
                  />
                  <p>Cost</p>
                  <p>Price</p>
                  <p className="input-heading">Notes / Restrictions</p>
                  <p className="input-heading">Target URL</p>
                  <p className="input-heading">Anchor Text</p>
                  {/* <p>Linking From</p> */}
                </div>
              ) : (
                <div className="bulk-select-header-wrapper">
                  <div className="bulk-select-header">
                    <BulkSelector
                      bulkSelects={bulkSelects}
                      setBulkSelects={setBulkSelects}
                      orderItems={filteredOrderItems}
                    />
                    {bulkDeleting ? (
                      <div className="bulk-delete-buttons-wrapper">
                        <button
                          onClick={() => setBulkDeleting(false)}
                          className="cancel-bulk-delete"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleBulkDelete()}
                          className="bulk-delete"
                        >
                          Delete {bulkSelects.length}{" "}
                          {bulkSelects.length > 1 ? "Items" : "Item"}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="bulk-status-wrapper">
                          <ProductPicker
                            item={{}}
                            products={productList}
                            currentProduct={{}}
                            currentProductType={""}
                            linkList={linkList}
                            boundaryRef={listWrapperRef}
                            bulkItems={bulkSelects}
                            handleBulkProductChange={handleBulkProductChange}
                          />
                          Status:
                          <BulkStatusPicker
                            bulkSelects={bulkSelects}
                            setBulkSelects={setBulkSelects}
                            setOrderItems={setOrderItems}
                          />
                        </div>
                        <div className="bulk-delete-button-wrapper">
                          <button
                            className="bulk-delete-button"
                            onClick={() => setBulkDeleting(true)}
                          >
                            <FaTrashCan />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              <div className="order-items-list-wrapper">
                {filteredOrderItems?.length > 0 &&
                  filteredOrderItems?.map(
                    (item: any, index: number) =>
                      item.itemId && (
                        <OrderItem
                          isProduction={false}
                          boundaryRef={listWrapperRef}
                          bulkSelects={bulkSelects}
                          setBulkSelects={setBulkSelects}
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
                          handleCostChange={handleCostChange}
                        />
                      ),
                  )}
                <div className="new-item-row-wrapper">
                  <div
                    className="sheet-item new-item-row"
                    onClick={() => handleAddItem()}
                  >
                    <p>+</p>
                    <p>Add Product</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-sheet-footer">
              <div className="order-notes-wrapper">
                <Notes
                  value={orderNotes}
                  onChange={handleUpdateNotes}
                  updateNotes={updateNotes}
                  count={count}
                  setCount={setCount}
                  saveNotesKeepalive={saveOrderNotesKeepAlive}
                />
              </div>
              <OrderFooter items={filteredOrderItems} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default OrderPage;
