import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { useNavigate } from "react-router";

interface props {
  client: any;
  clientOrders: any;
  orderId: number;
}

const ClientOrderScroll = ({ orderId, client, clientOrders }: props) => {
  const navigate = useNavigate();
  const currentIndex = clientOrders.findIndex(
    (ord: any) => ord.orderId === orderId,
  );
  const previousOrder = clientOrders[currentIndex - 1];
  const nextOrder = clientOrders[currentIndex + 1];

  return (
    <div className="order-client-wrapper">
      <div onClick={() => navigate(`/order/${previousOrder.orderId}/false`)}>
        {previousOrder && <FaArrowAltCircleLeft />}
      </div>
      <p>{client.clientName ?? ""}</p>

      <div onClick={() => navigate(`/order/${nextOrder.orderId}/false`)}>
        {nextOrder && <FaArrowAltCircleRight />}
      </div>
    </div>
  );
};
export default ClientOrderScroll;
