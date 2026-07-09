import { useNavigate } from "react-router";
import StatusBadge from "../UI/StatusBadge";
import { formatDateNoTime } from "../../helpers";

interface props {
  order: any;
  index: number;
}

const ClientsOrderItem = ({ order, index }: props) => {
  const navigate = useNavigate();

  return (
    <div
      className="clients-sheet-item"
      onClick={() => navigate(`/order/${order?.orderId}/false`)}
    >
      <div className="count">{index + 1}</div>
      <p>Order #{order?.orderId}</p>
      <StatusBadge status={order?.orderStatus} />
      <p>{formatDateNoTime(order?.createdAt)}</p>
    </div>
  );
};
export default ClientsOrderItem;
