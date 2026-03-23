import { capitalize } from "../../helpers";

interface props {
  currentStatus: string;
  handleUpdateStatus: any;
}

const OrderStatusPicker = ({ currentStatus, handleUpdateStatus }: props) => {
  return (
    <div className="order-status-picker">
      <button
        onClick={() => handleUpdateStatus(currentStatus)}
        className="order-status-button"
      >
        {capitalize(currentStatus)}
      </button>
    </div>
  );
};
export default OrderStatusPicker;
