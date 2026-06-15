import { useNavigate } from "react-router";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import ProfilePic from "../components/UI/ProfilePic";
import { formatDateNoTime } from "../helpers";
import OrderStatusBadge from "../components/Orders/OrderStatusBadge";
import Loader from "../components/UI/Loader";
import OrderFilterDropdown from "../components/Orders/OrderFilterDropdown";

type FilterOption = {
  title: string;
  id?: number;
  profilePic?: string;
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    user: 0,
    client: [],
    status: [],
  });
  const [salesPeople, setSalesPeople] = useState<FilterOption[]>([]);
  const [clients, setClients] = useState<FilterOption[]>([]);
  const [statuses, setStatuses] = useState<FilterOption[]>([]);

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
              !salesPeople.some((user: any) => user.id === order.salesPerson)
            ) {
              salesArray.push({
                title: `${order.user.firstName} ${order.user.lastName}`,
                profilePic: order.user.profilePic,
                id: order.user.userId,
              });
            }
            if (!clients.some((client: any) => client.id === order.clientId)) {
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
          setStatuses(statusArray);
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
  const { submittedOrders, progressOrders, partialOrders, deliveredOrders } =
    useMemo(() => {
      const submittedOrders: any = [];
      const progressOrders: any = [];
      const partialOrders: any = [];
      let deliveredOrders: any = [];

      let data: any = orders;
      // console.log(filter);

      data = data.filter((order: any) => {
        if (!order) {
          return false;
        }
        if (filter.client.length > 0)
          if (
            !filter.client.some((client: any) => client.id === order.clientId)
          )
            return false;

        if (filter.user !== 0)
          if (order.salesPerson !== filter.user) return false;

        if (filter.status.length > 0)
          if (
            !filter.status.some(
              (status: any) => status.title === order.orderStatus,
            )
          )
            return false;

        return true;
      });

      data.forEach((order: any) => {
        if (order.order_items?.length > 0) {
          if (order.orderStatus === "submitted") {
            submittedOrders.push(order);
            return;
          }
          const undeliveredItems = order.order_items.filter(
            (item: any) => item.itemStatus !== "complete",
          );
          if (undeliveredItems.length > 0) {
            const deliveredItems = order.order_items.filter(
              (item: any) => item.itemStatus === "complete",
            );
            if (deliveredItems.length > 0) {
              partialOrders.push(order);
            } else progressOrders.push(order);
          } else deliveredOrders.push(order);
        } else progressOrders.push(order);
      });

      return {
        submittedOrders,
        progressOrders,
        partialOrders,
        deliveredOrders,
      };
    }, [orders, filter]);

  return (
    <div className="commissions-page-wrapper">
      <div className="page-header-wrapper">
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
        <div className="orders-lists">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <div className="orders-list-wrapper">
                <div className="orders-list">
                  <div className="orders-list-item orders-list-head">
                    <OrderFilterDropdown
                      heading={"User"}
                      options={salesPeople}
                      array={false}
                      filter={filter}
                      setFilter={setFilter}
                    />
                    <div className="orders-list-heading">Order #</div>
                    <OrderFilterDropdown
                      heading={"Client"}
                      options={clients}
                      array={true}
                      filter={filter}
                      setFilter={setFilter}
                    />
                    <OrderFilterDropdown
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
              {submittedOrders.length > 0 && (
                <div className="orders-list-wrapper">
                  <h3>Submitted Orders</h3>
                  <div className="orders-list">
                    {submittedOrders?.length > 0 ? (
                      submittedOrders.map((order: any) => {
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
                              <ProfilePic src={order.user?.profilePic} />
                            </div>
                            <div>Order #{order.orderId}</div>
                            <div>{order.client?.clientName}</div>
                            <div>
                              <OrderStatusBadge status={"submitted"} />
                            </div>
                            <div>
                              {deliveredItems.length} /{" "}
                              {order.order_items.length}
                            </div>
                            <div>{formatDateNoTime(order.createdAt)}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="orders-list-item">
                        <p></p>
                        <p>No orders</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {progressOrders.length > 0 && (
                <div className="orders-list-wrapper">
                  <h3>Orders In Progress</h3>
                  <div className="orders-list">
                    {progressOrders?.length > 0 ? (
                      progressOrders.map((order: any) => {
                        const deliveredItems = order.order_items?.filter(
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
                              <ProfilePic src={order.user?.profilePic} />
                            </div>
                            <div>Order #{order.orderId}</div>
                            <div>{order.client?.clientName}</div>
                            <div>
                              <OrderStatusBadge status={"in progress"} />
                            </div>
                            <div>
                              {deliveredItems?.length} /{" "}
                              {order.order_items?.length}
                            </div>
                            <div>{formatDateNoTime(order.createdAt)}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="orders-list-item">
                        <p></p>
                        <p>No orders</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {partialOrders.length > 0 && (
                <div className="orders-list-wrapper">
                  <h3>Partially Delivered Orders</h3>
                  <div className="orders-list">
                    {partialOrders?.length > 0 ? (
                      partialOrders.map((order: any) => {
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
                              <ProfilePic src={order.user?.profilePic} />
                            </div>
                            <div>Order #{order.orderId}</div>
                            <div>{order.client?.clientName}</div>
                            <div>
                              <OrderStatusBadge status={"partial"} />
                            </div>
                            <div>
                              {deliveredItems.length} /{" "}
                              {order.order_items.length}
                            </div>
                            <div>{formatDateNoTime(order.createdAt)}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="orders-list-item">
                        <p></p>
                        <p>No orders</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {deliveredOrders.length > 0 && (
                <div className="orders-list-wrapper">
                  <h3>Completed Orders</h3>
                  <div className="orders-list">
                    {deliveredOrders?.length > 0 ? (
                      deliveredOrders.map((order: any) => {
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
                              <ProfilePic src={order.user?.profilePic} />
                            </div>
                            <div>Order #{order.orderId}</div>
                            <div>{order.client?.clientName}</div>
                            <div>
                              <OrderStatusBadge status={"delivered"} />
                            </div>
                            <div>
                              {deliveredItems.length} /{" "}
                              {order.order_items.length}
                            </div>
                            <div>{formatDateNoTime(order.createdAt)}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="orders-list-item">
                        <p></p>
                        <p>No orders</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default Orders;
