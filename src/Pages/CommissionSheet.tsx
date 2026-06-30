import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import axios from "axios";
import CommissionSheetFooter from "../components/CommissionSheet/CommissionSheetFooter";
import SheetOrderItem from "../components/CommissionSheet/SheetOrderItem";
import StatusPicker from "../components/CommissionSheet/StatusPicker";
import { useNavigate } from "react-router";
import { formatDateWithDay, getGP, getCommission } from "../helpers";
import Loader from "../components/UI/Loader";
import ProfilePic from "../components/UI/ProfilePic";
import FilterDropdown from "../components/UI/FilterDropdown";
import Sorter from "../components/Clients/Sorter";

type FilterOption = {
  title: string;
  id?: number;
  profilePic?: string;
};

const CommissionSheet = () => {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user);
  const [productList, setProductList] = useState([{}]);
  const [orderList, setOrderList] = useState([{}]);
  const [unauthorized, setUnauthorized] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const creatingSheetRef = useRef<boolean>(false);
  const [profilePic, setProfilePic] = useState("");
  const [clientList, setClientList] = useState<FilterOption[]>([]);
  const [deliveryList, setDeliveryList] = useState([]);
  const [sheetData, setSheetData] = useState({
    sheetId: sheetId ? sheetId : 0,
    userId: user?.userId || 0,
    sheetTitle: "",
    sheetDescription: "",
    sheetStatus: "draft",
    createdAt: null,
    updatedAt: null,
    isArchived: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    direction: "up",
    sort: "",
    clients: [],
  });
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const promises = [];

      if (sheetId) {
        promises.push(
          axios.get(`/api/getSheet/${sheetId}`).then((res) => {
            if (res.status === 200) {
              setProfilePic(res.data.user?.profilePic);
              setSheetData((prev) => ({
                ...prev,
                sheetTitle: res.data.sheetTitle,
                sheetDescription: res.data.sheetDescription,
                userId: res.data.userId,
                sheetStatus: res.data.sheetStatus,
                createdAt: res.data.createdAt,
                updatedAt: res.data.updatedAt,
                isArchived: res.data.isArchived,
              }));
              setOrderList(res.data.orders);

              console.log(res.data);

              const deliveries =
                res.data.orders?.length > 0 &&
                res.data.orders
                  .map((order: any) => order.order_items ?? null)
                  ?.flat();

              setDeliveryList(deliveries);

              const clients: FilterOption[] = [];
              res.data.orders.forEach((order: any) => {
                if (
                  !clients.some(
                    (client: any) => client.id === order.client.clientId,
                  )
                )
                  clients.push({
                    id: order.client.clientId,
                    title: order.client.clientName,
                  });
              });
              setClientList(clients);
            }
          }),
        );
      }

      promises.push(
        axios.get(`/api/getProducts/${sheetData.userId}`).then((res) => {
          if (res.status === 200) setProductList(res.data.products);
        }),
      );

      await Promise.all(promises);
    } catch (error: any) {
      console.log(error);
      if (error.status === 401) {
        setUnauthorized(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Number(sheetId) === 0) {
      return;
    }
    if (!user.userId) {
      return;
    }
    fetchData();
  }, [user?.userId, sheetId]);

  const filteredData = useMemo(() => {
    let data: any = orderList;

    const query = search.toLowerCase();
    if (query.trim() !== "") {
      data = data.filter((order: any) => {
        if (order.client.clientName?.toLowerCase().includes(query)) return true;
        const items = order.order_items;
        const filteredItems = items.filter((item: any) => {
          if (item.productNameSnapshot?.toLowerCase().includes(query))
            return true;
        });

        const orderCopy = order;

        if (filteredItems.length > 0) {
          orderCopy.order_items = filteredItems;
          return orderCopy;
        } else return;
      });
    } else data = orderList;

    // Filter
    if (filter.clients.length > 0) {
      data = data.filter((order: any) =>
        filter.clients.some(
          (client: any) => client.id === order.client.clientId,
        ),
      );
    }

    // Sorting
    if (filter.sort !== "") {
      if (filter.sort === "gp" || filter.sort === "commission") {
        data = deliveryList;
        data = data.sort((a: any, b: any) => {
          switch (filter.sort) {
            case "gp":
              return filter.direction !== "up"
                ? getGP(a, productList) - getGP(b, productList)
                : getGP(b, productList) - getGP(a, productList);
              break;
            case "commission":
              return filter.direction !== "up"
                ? getCommission(a, productList) - getCommission(b, productList)
                : getCommission(b, productList) - getCommission(a, productList);
              break;

            default:
              break;
          }
        });
      } else
        data = data.sort((a: any, b: any) => {
          switch (filter.sort) {
            case "order":
              return filter.direction === "up"
                ? a.orderId - b.orderId
                : b.orderId - a.orderId;
              break;

            case "date":
              return filter.direction === "up"
                ? new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                : new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime();
              break;

            default:
              break;
          }
        });
    }

    return data;
  }, [filter, sheetData, search]);

  const updateSheet = async (fieldName: string, value: any) => {
    if (Number(sheetId) === 0) {
      if (creatingSheetRef.current) return;
      if (fieldName !== "sheetTitle") return;
      creatingSheetRef.current = true;
      try {
        await axios.post("/api/newSheet", { sheetTitle: value }).then((res) => {
          if (res.status === 200) {
            navigate(`/sheet/${res.data.sheetId}`);
          }
        });
      } catch (error) {
        creatingSheetRef.current = false;
        console.log(error);
      }
    } else
      try {
        await axios
          .post("/api/updateSheet", { sheetId, fieldName, value })
          .then((res) => {
            if (res.status === 200) {
              console.log(res.data);
              if (fieldName === "isArchived") {
                setSheetData({ ...sheetData, isArchived: res.data.isArchived });
              }
            }
          });
      } catch (error) {
        console.log(error);
      }
  };

  return (
    <div className="commission-sheet-page-wrapper">
      <>
        <div className="page-header-wrapper">
          <div className="commission-sheet-profile-wrapper">
            <ProfilePic src={profilePic} />
            <h2>{sheetData.sheetTitle}</h2>
          </div>
          <div className="sheet-header-container">
            <p className="sheet-date">
              {formatDateWithDay(sheetData?.createdAt)}
            </p>
            <StatusPicker
              status={sheetData.sheetStatus}
              sheetData={sheetData}
              setSheetData={setSheetData}
              sheetId={Number(sheetId)}
              isAdmin={user.isAdmin}
            />
          </div>
        </div>
        <div className="commission-sheet-top-bar">
          <FilterDropdown
            heading={"Clients"}
            options={clientList}
            array={true}
            filter={filter}
            setFilter={setFilter}
          />
          <div className="commission-sheet-top-bar-container">
            <input
              type="text"
              placeholder="Search"
              className="orders-search-input"
              onChange={(e) => setSearch(e.target.value)}
            />
            <Sorter
              filter={filter}
              setFilter={setFilter}
              direction="direction"
              position="right"
              options={[
                {
                  heading: "Order #",
                  sortHeading: "sort",
                  sortValue: "order",
                },
                {
                  heading: "GP",
                  sortHeading: "sort",
                  sortValue: "gp",
                },
                {
                  heading: "Commission",
                  sortHeading: "sort",
                  sortValue: "commission",
                },
                {
                  heading: "Date Created",
                  sortHeading: "sort",
                  sortValue: "date",
                },
              ]}
            />
          </div>
        </div>
        <div className="sheet-page-body">
          <div className="sheet-items-list">
            <div className="sheet-item sheet-items-list-head">
              <p>Product</p>
              <p>Quantity</p>
              <p>Price</p>
              <p>Cost</p>
              <p>GP</p>
              <p>Commission</p>
              <p>Bonus</p>
              <p>Total</p>
            </div>
            {isLoading ? (
              <Loader />
            ) : unauthorized ? (
              <div className="unauthorized">
                <p>You do not have permission to see this sheet!</p>
              </div>
            ) : (
              <>
                <div className="sheet-list-container">
                  {filter.sort === "gp" || filter.sort === "commission"
                    ? filteredData?.length > 0 &&
                      filteredData.map((delivery: any) => {
                        return (
                          <SheetOrderItem
                            item={delivery}
                            productList={productList}
                          />
                        );
                      })
                    : filteredData?.map((order: any) => {
                        return (
                          <div className="sheet-list-order-wrapper">
                            <div className="sheet-list-order">
                              <span
                                className="commission-sheet-order-title"
                                onClick={() =>
                                  navigate(`/order/${order.orderId}/false`)
                                }
                              >
                                <p>Order #{order.orderId}</p>
                                <p>{order.client?.clientName}</p>
                              </span>
                            </div>
                            {order?.order_items?.length > 0 &&
                              order.order_items.map((item: any) => (
                                <SheetOrderItem
                                  item={item}
                                  productList={productList}
                                />
                              ))}
                          </div>
                        );
                      })}
                </div>
                {!isLoading && (
                  <CommissionSheetFooter
                    items={filteredData}
                    products={productList}
                    filter={filter}
                  />
                )}
              </>
            )}
          </div>
        </div>
        <div className="commission-sheet-bottom-wrapper">
          <textarea
            className="commission-sheet-notes"
            placeholder="Add a note"
            ref={descriptionRef}
            name="notes"
            id="notes"
            disabled={sheetData?.sheetStatus !== "draft"}
            onChange={(e) =>
              setSheetData({ ...sheetData, sheetDescription: e.target.value })
            }
            onBlur={() =>
              updateSheet("sheetDescription", sheetData.sheetDescription)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateSheet("sheetDescription", sheetData.sheetDescription);
                descriptionRef.current?.blur();
              }
            }}
            value={sheetData.sheetDescription}
          ></textarea>
          <div>
            <button
              className={
                sheetData.isArchived
                  ? "archive-button archived"
                  : "archive-button"
              }
              onClick={() => {
                updateSheet("isArchived", !sheetData.isArchived);
                navigate("/commission-sheets");
              }}
            >
              {!sheetData.isArchived ? "Archive" : "Archived"}
            </button>
          </div>
        </div>
      </>
    </div>
  );
};
export default CommissionSheet;
