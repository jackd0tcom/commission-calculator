import { useNavigate } from "react-router";
import axios from "axios";
import { useState, useEffect } from "react";
import ProfilePic from "../components/UI/ProfilePic";
import { formatDateNoTime } from "../helpers";
import OrderStatusBadge from "../components/Orders/OrderStatusBadge";
import Loader from "../components/UI/Loader";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      await axios.get("/api/getOrders").then((res) => {
        if (res.status === 200) {
          setOrders(res.data);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const submittedOrders: any = [];
  const progressOrders: any = [];
  const partialOrders: any = [];
  let deliveredOrders: any = [];

  orders.forEach((order: any) => {
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
                    <p>User</p>
                    <p>Order #</p>
                    <p>Client</p>
                    <p>Status</p>
                    <p># Items</p>
                    <p>Date</p>
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
                            <ProfilePic src={order.user?.profilePic} />
                            <p>Order #{order.orderId}</p>
                            <p>{order.client?.clientName}</p>
                            <OrderStatusBadge status={"submitted"} />
                            <p>
                              {deliveredItems.length} /{" "}
                              {order.order_items.length}
                            </p>
                            <p>{formatDateNoTime(order.createdAt)}</p>
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
              <div className="orders-list-wrapper">
                <h3>Orders In Progress</h3>
                <div className="orders-list">
                  {progressOrders?.length > 0 ? (
                    progressOrders.map((order: any) => {
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
                          <ProfilePic src={order.user?.profilePic} />
                          <p>Order #{order.orderId}</p>
                          <p>{order.client?.clientName}</p>
                          <OrderStatusBadge status={"in progress"} />
                          <p>
                            {deliveredItems.length} / {order.order_items.length}
                          </p>
                          <p>{formatDateNoTime(order.createdAt)}</p>
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
                          <ProfilePic src={order.user.profilePic} />
                          <p>Order #{order.orderId}</p>
                          <p>{order.client?.clientName}</p>
                          <OrderStatusBadge status={"partial"} />
                          <p>
                            {deliveredItems.length} / {order.order_items.length}
                          </p>
                          <p>{formatDateNoTime(order.createdAt)}</p>
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
                          <ProfilePic src={order.user.profilePic} />
                          <p>Order #{order.orderId}</p>
                          <p>{order.client?.clientName}</p>
                          <OrderStatusBadge status={"delivered"} />
                          <p>
                            {deliveredItems.length} / {order.order_items.length}
                          </p>
                          <p>{formatDateNoTime(order.createdAt)}</p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default Orders;
