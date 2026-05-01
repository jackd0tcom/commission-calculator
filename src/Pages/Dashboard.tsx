import axios from "axios";
import { useState, useEffect } from "react";
import Loader from "../components/UI/Loader";
import { formatDateNoTime, formatDollar } from "../helpers";
import ProfilePic from "../components/UI/ProfilePic";
import OrderStatusBadge from "../components/Orders/OrderStatusBadge";
import { useNavigate } from "react-router";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [yearRevenue, setYearRevenue] = useState(0);
  const navigate = useNavigate();

  const projectedMonthRevenue = (orders: any) => {
    return orders.reduce((acc: number, order: any) => {
      const orderTotal = order.order_items?.reduce((acc: number, item: any) => {
        const total =
          item.priceSnapshot ??
          item.price ??
          item.product.defaultPrice ??
          item.link.defaultPrice ??
          0;

        return acc + Number(total);
      }, 0);

      return acc + Number(orderTotal);
    }, 0);
  };

  const currentMonthRevenue = (deliveries: any) => {
    return deliveries.reduce((acc: number, delivery: any) => {
      const total = delivery.order_item.priceSnapshot ?? 0;

      return acc + Number(total);
    }, 0);
  };

  const inProgressOrders = (orders: any) => {
    return orders.reduce((acc: number, order: any) => {
      if (order.orderStatus === "in progress") {
        return acc + 1;
      } else return acc;
    }, 0);
  };
  const partialOrders = (orders: any) => {
    return orders.reduce((acc: number, order: any) => {
      if (order.orderStatus === "partial") {
        return acc + 1;
      } else return acc;
    }, 0);
  };
  const deliveredOrders = (orders: any) => {
    return orders.reduce((acc: number, order: any) => {
      if (order.orderStatus === "delivered") {
        return acc + 1;
      } else return acc;
    }, 0);
  };

  const latestOrders = (orders: any) => {
    if (orders.length > 5) {
      return orders.slice(5);
    } else return orders;
  };

  const fetchStats = async () => {
    try {
      await axios.get("/api/getDashboardStats").then((res) => {
        console.log(res.data);
        setOrderData(res.data.orders);
        setDeliveries(res.data.deliveries);
        setIsLoading(false);
        setYearRevenue(res.data.yearRevenue);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="dashboard-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Dashboard</h2>
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="dashboard-page-body">
          <div className="dashboard-stats-wrapper">
            <div className="dashboard-stats">
              <div className="dashboard-stats-card">
                <h4>Current Monthly Revenue</h4>
                <p>{formatDollar(currentMonthRevenue(deliveries))}</p>
              </div>
              <div className="dashboard-stats-card">
                <h4>Projected Monthly Revenue</h4>
                <p>{formatDollar(projectedMonthRevenue(orderData))}</p>
              </div>
              <div className="dashboard-stats-card">
                <h4>YTD Total Revenue</h4>
                <p>{formatDollar(yearRevenue)}</p>
              </div>
            </div>
            <div className="dashboard-stats">
              <div className="dashboard-stats-card">
                <h4>In Progress Orders</h4>
                <p>{inProgressOrders(orderData)}</p>
              </div>
              <div className="dashboard-stats-card">
                <h4>Partially Delivered Orders</h4>
                <p>{partialOrders(orderData)}</p>
              </div>
              <div className="dashboard-stats-card">
                <h4>Delivered Orders</h4>
                <p>{deliveredOrders(orderData)}</p>
              </div>
            </div>
          </div>
          <div className="dashboard-orders-wrapper">
            <h4>Recent Orders</h4>
            <div className="dashboard-orders-list">
              {latestOrders(orderData)?.map((order: any) => (
                <div
                  className="dashboard-order"
                  onClick={() => navigate(`/order/${order.orderId}/false`)}
                >
                  <ProfilePic src={order.user?.profilePic} />
                  <p>Order #{order.orderId}</p>
                  <p>{order.client?.clientName}</p>
                  <div className="order-status-badge-wrapper">
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                  <p>{formatDateNoTime(order.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
