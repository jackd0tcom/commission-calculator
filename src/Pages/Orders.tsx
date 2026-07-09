import { useNavigate } from "react-router";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import ProfilePic from "../components/UI/ProfilePic";
import { formatDateNoTime } from "../helpers";
import OrderStatusBadge from "../components/Orders/OrderStatusBadge";
import Loader from "../components/UI/Loader";
import FilterDropdown from "../components/UI/FilterDropdown";
import OrderSort from "../components/Orders/OrderSort";
import { usePersistedFilter } from "../hooks/usePersistedFilter";
import { useSelector } from "react-redux";
import M2MIcon from "../components/UI/M2MIcon";

type FilterOption = {
  title: string;
  id?: number;
  profilePic?: string;
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = useSelector((state: any) => state.user.userId);
  const [filter, setFilter] = usePersistedFilter("orders", userId, {
    user: 0,
    client: [],
    status: [],
    sort: "",
    direction: "up",
  });
  const [salesPeople, setSalesPeople] = useState<FilterOption[]>([]);
  const [clients, setClients] = useState<FilterOption[]>([]);
  const [statuses, setStatuses] = useState<FilterOption[]>([]);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      await axios.get("/api/getOrders").then((res) => {
        if (res.status === 200) {
          setOrders(res.data);
          setIsLoading(false);
          let salesArray: FilterOption[] = [];
          let clientsArray: FilterOption[] = [];
          let statusArray: FilterOption[] = [];

          res.data.forEach((order: any) => {
            if (
              !salesArray.some(
                (user: any) => user.id === order.salesPerson.userId,
              )
            ) {
              salesArray.push({
                title: `${order.salesPerson.firstName} ${order.salesPerson.lastName}`,
                profilePic: order.salesPerson.profilePic,
                id: order.salesPerson.userId,
              });
            }
            if (
              !clientsArray.some((client: any) => client.id === order.clientId)
            ) {
              clientsArray.push({
                title: order.client.clientName,
                id: order.client.clientId,
              });
            }
            if (
              !statusArray.some(
                (status: any) => status.title === order.orderStatus,
              )
            ) {
              statusArray.push({
                title: order.orderStatus,
                id: order.client.clientId,
              });
            }
          });
          setSalesPeople(
            salesArray.sort((a, b) => a.title.localeCompare(b.title)),
          );
          setClients(
            clientsArray.sort((a, b) => a.title.localeCompare(b.title)),
          );
          const statusSort = ["in progress", "partial", "delivered"];
          setStatuses(
            statusArray.sort(
              (a: any, b: any) =>
                statusSort.indexOf(a.orderStatus) -
                statusSort.indexOf(b.orderStatus),
            ),
          );
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Order filter handler
  const { allOrders } = useMemo(() => {
    let data: any;

    // Search
    if (search.trim() === "") {
      data = orders;
    } else {
      data = orders;
      const searchTerm = search.toLowerCase();
      data = data.filter((order: any) => {
        const salesPersonName = `${order.user.firstName} ${order.user.lastName}`;
        const date = new Date(order.createdAt).toDateString();
        const numericDate = new Date(order.createdAt).toLocaleDateString();

        // Return true since searchTerm only has to match with one of the items, not match all criteria

        // Search in clients
        if (order.client?.clientName?.toLowerCase().includes(searchTerm))
          return true;

        // Search in order id
        if (order.orderId?.toString().includes(searchTerm)) return true;

        // Search in order title
        if (order.orderTitle?.toLowerCase().includes(searchTerm)) return true;

        // Search in salesperson
        if (salesPersonName?.toLowerCase().includes(searchTerm)) return true;

        // Search date
        if (date?.toLowerCase().includes(searchTerm)) return true;

        // Search numeric date
        if (numericDate?.toLowerCase().includes(searchTerm)) return true;

        // Search status date
        if (order.orderStatus?.toLowerCase().includes(searchTerm)) return true;
      });
    }

    // Filters
    data = data.filter((order: any) => {
      if (!order) {
        return false;
      }
      if (filter.client.length > 0)
        if (!filter.client.some((client: any) => client.id === order.clientId))
          return false;

      if (filter.user !== 0)
        if (order.salesPerson?.userId !== filter.user) return false;

      if (filter.sort === "m2m") if (!order.isM2M) return false;

      if (filter.status.length > 0)
        if (
          !filter.status.some(
            (status: any) => status.title === order.orderStatus,
          )
        )
          return false;

      return true;
    });

    // Sorting
    data = data.sort((a: any, b: any) => {
      const statusOrder = ["in progress", "partial", "delivered"];
      switch (filter.sort) {
        case "dateCreated":
          return filter.direction !== "up"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        case "client":
          return filter.direction === "up"
            ? a.client?.clientName.localeCompare(b.client?.clientName)
            : b.client?.clientName.localeCompare(a.client?.clientName);

        case "status":
          return filter.direction === "up"
            ? statusOrder.indexOf(a.orderStatus) -
                statusOrder.indexOf(b.orderStatus)
            : statusOrder.indexOf(b.orderStatus) -
                statusOrder.indexOf(a.orderStatus);

        case "number":
          return filter.direction === "up"
            ? a.orderId - b.orderId
            : b.orderId - a.orderId;

        default:
          break;
      }
    });

    const allOrders = data;
    return {
      allOrders,
    };
  }, [orders, filter, search]);

  return (
    <div className="commissions-page-wrapper">
      <div className="page-header-wrapper order-page-header">
        <h2>Orders</h2>
        <button
          onClick={() => {
            navigate("/order/0/false");
          }}
          className="new-sheet-button"
        >
          New Order
        </button>
      </div>
      <div className="orders-page-body">
        <div className="orders-filter-box-wrapper">
          <div className="orders-search-wrapper">
            <input
              type="text"
              className="orders-search-input"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
            />
          </div>
          <OrderSort filter={filter} setFilter={setFilter} />
        </div>
        <div className="orders-lists">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <div className="orders-list-wrapper">
                <div className="orders-list">
                  <div className="orders-list-item orders-list-head">
                    <FilterDropdown
                      heading={"User"}
                      options={salesPeople}
                      array={false}
                      filter={filter}
                      setFilter={setFilter}
                    />
                    <div className="orders-list-heading">Order #</div>
                    <FilterDropdown
                      heading={"Client"}
                      options={clients}
                      array={true}
                      filter={filter}
                      setFilter={setFilter}
                    />
                    <FilterDropdown
                      heading={"Status"}
                      options={statuses}
                      array={true}
                      filter={filter}
                      setFilter={setFilter}
                    />
                    <div className="orders-list-heading"># Items</div>
                    <div className="orders-list-heading">Date</div>
                  </div>
                </div>
              </div>
              <div className="orders-list-wrapper">
                <div className="orders-list">
                  {allOrders?.length > 0 ? (
                    allOrders.map((order: any) => {
                      const deliveredItems = order.order_items.filter(
                        (item: any) => item.itemStatus === "complete",
                      );
                      return (
                        <div
                          className="orders-list-item"
                          key={`order-${order.orderId}`}
                          onClick={() =>
                            navigate(`/order/${order.orderId}/false`)
                          }
                        >
                          <div className="user-width">
                            <ProfilePic src={order.salesPerson?.profilePic} />
                          </div>
                          <div className="order-title-wrapper">
                            <div>
                              #{order.orderId}{" "}
                              {order.orderTitle && `${order.orderTitle}`}
                            </div>
                            {order.isM2M && (
                              <M2MIcon wasM2M={false} M2MId={order.M2MId} />
                            )}
                            {order.wasM2M && (
                              <M2MIcon wasM2M={true} M2MId={order.M2MId} />
                            )}
                          </div>
                          <div>{order.client?.clientName}</div>
                          <div>
                            <OrderStatusBadge status={order.orderStatus} />
                          </div>
                          <div>
                            {deliveredItems.length} / {order.order_items.length}
                          </div>
                          <div>{formatDateNoTime(order.createdAt)}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="orders-list-item no-orders">
                      <p></p>
                      <p>No orders</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default Orders;
