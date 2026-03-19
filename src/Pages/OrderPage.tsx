import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import ProfilePic from "../components/UI/ProfilePic";
import { useNavigate } from "react-router";
import axios from "axios";
import ClientPicker from "../components/Orders/ClientPicker";

const OrderPage = () => {
  const { orderId } = useParams();
  const user = useSelector((state: any) => state.user);
  const navigate = useNavigate();
  const [newClient, setNewClient] = useState({ clientId: 0 });
  const [orderData, setOrderData] = useState({});
  const [orderItems, setOrderItems] = useState([{}]);
  const [clientList, setClientList] = useState([{}]);
  const [productList, setProductList] = useState([{}]);
  const [unauthorized, setUnauthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const promises = [];

      if (Number(orderId) !== 0) {
        promises.push(
          axios.get(`/api/getOrder/${orderId}`).then((res) => {
            if (res.status === 200) {
              setOrderData(res.data);
              if (res.data.orderItems && res.data.orderItems.length > 0) {
                setOrderItems(res.data.orderItems);
              }
              console.log(res.data);
            }
          }),
        );

        promises.push(
          axios.get(`/api/getProducts/${user?.userId}`).then((res) => {
            if (res.status === 200) setProductList(res.data);
          }),
        );
      }

      promises.push(
        axios.get("/api/getClients").then((res) => {
          if (res.status === 200) setClientList(res.data);
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
    fetchData();
  }, []);

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
        await axios.post("/api/newOrder", { fieldName: value }).then((res) => {
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

  return (
    <div className="order-page-wrapper">
      {Number(orderId) === 0 ? (
        <div className="new-sheet-wrapper">
          <ProfilePic src={user.profilePic} />
          <h2>New Order</h2>
          <ClientPicker
            setClientList={setClientList}
            clientList={clientList}
            newClient={newClient}
            setNewClient={setNewClient}
          />
          <button
            onClick={() => updateOrder("clientId", newClient.clientId)}
            className="create-sheet-button"
          >
            Create New Order
          </button>
        </div>
      ) : (
        <>
          <div className="page-header-wrapper">
            <h2>Order #{orderId}</h2>
          </div>
        </>
      )}
    </div>
  );
};
export default OrderPage;
