import { capitalize } from "../../helpers";

interface props {
  status: string;
}

const OrderStatusBadge = ({ status }: props) => {
  return (
    <div
      className={`order-status-badge ${status === "in progress" ? "in-progress-badge" : status === "partial" ? "partial-badge" : status === "submitted" ? "submitted-badge" : "delivered-badge"}`}
    >
      {capitalize(status)}
    </div>
  );
};
export default OrderStatusBadge;
