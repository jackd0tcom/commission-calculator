import { useNavigate } from "react-router";
import axios from "axios";
import { useState, useEffect } from "react";
import ProfilePic from "../components/UI/ProfilePic";
import { formatDateNoTime } from "../helpers";
import OrderStatusBadge from "../components/Orders/OrderStatusBadge";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([{}]);

  const fetchOrders = async () => {
    try {
      await axios.get("/api/getOrders").then((res) => {
        if (res.status === 200) {
          setOrders(res.data);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const deliveredOrders = orders.filter(
    (order: any) => order.orderStatus === "delivered",
  );

  const progressOrders = orders.filter(
    (order: any) => order.orderStatus === "in progress",
  );

  return (
    <div className="commissions-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Orders</h2>
        <button
          onClick={() => {
            navigate("/order/0");
          }}
          className="new-sheet-button"
        >
          New Order
        </button>
      </div>
      <div className="orders-page-body">
        <div className="orders-list-wrapper">
          <div className="orders-list">
            <div className="orders-list-item orders-list-head">
              <p>User</p>
              <p>Client</p>
              <p>Status</p>
              <p># Items</p>
              <p>Date</p>
            </div>
          </div>
        </div>
        <div className="orders-list-wrapper">
          <h3>Orders In Progress</h3>
          <div className="orders-list">
            {progressOrders?.length > 0 ? (
              progressOrders.map((order: any) => (
                <div
                  className="orders-list-item"
                  key={`order-${order.orderId}`}
                  onClick={() => navigate(`/order/${order.orderId}`)}
                >
                  <ProfilePic src={order.user.profilePic} />
                  <p>{order.client?.clientName}</p>
                  <OrderStatusBadge status={order.orderStatus} />
                  <p>{order.order_items.length}</p>
                  <p>{formatDateNoTime(order.createdAt)}</p>
                </div>
              ))
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="orders-list-wrapper">
          <h3>Completed Orders</h3>
          <div className="orders-list">
            {deliveredOrders?.length > 0 ? (
              deliveredOrders.map((order: any) => (
                <div
                  className="orders-list-item"
                  key={`order-${order.orderId}`}
                  onClick={() => navigate(`/order/${order.orderId}`)}
                >
                  <ProfilePic src={order.user.profilePic} />
                  <p>{order.client?.clientName}</p>
                  <OrderStatusBadge status={order.orderStatus} />
                  <p>{order.order_items.length}</p>
                  <p>{formatDateNoTime(order.createdAt)}</p>
                </div>
              ))
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Orders;
