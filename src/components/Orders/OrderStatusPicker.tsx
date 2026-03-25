import { current } from "@reduxjs/toolkit";
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
        className={
          currentStatus === "in progress"
            ? "order-status-button in-progress-button"
            : "order-status-button delivered-button"
        }
      >
        {capitalize(currentStatus)}
      </button>
    </div>
  );
};
export default OrderStatusPicker;
