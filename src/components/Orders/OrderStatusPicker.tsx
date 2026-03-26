interface props {
  currentStatus: string;
  handleUpdateStatus: any;
}

const OrderStatusPicker = ({ currentStatus, handleUpdateStatus }: props) => {
  const statusText = currentStatus === "draft" ? "Submit" : "Submitted";
  return (
    <div className="order-status-picker">
      <button
        onClick={() => handleUpdateStatus(currentStatus)}
        className={
          currentStatus === "draft"
            ? "order-status-button in-progress-button"
            : "order-status-button delivered-button"
        }
      >
        {statusText}
      </button>
    </div>
  );
};
export default OrderStatusPicker;
