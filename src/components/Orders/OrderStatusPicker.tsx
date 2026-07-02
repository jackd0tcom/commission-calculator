import { capitalize, skewerCase } from "../../helpers";
import { useFloatingDropdown } from "../../hooks/useFloatingDropdown";

interface props {
  currentStatus: string;
  handleUpdateStatus: any;
  boundaryRef: any;
}

const OrderStatusPicker = ({
  currentStatus,
  handleUpdateStatus,
  boundaryRef,
}: props) => {
  const {
    open: showDropDown,
    setOpen: setShowDropdown,
    referenceRef,
    floatingRef,
    floatingStyles,
    FloatingPortal,
  } = useFloatingDropdown({ boundaryRef, maxHeight: 250, minHeight: 200 });

  const statuses = [
    "staged",
    "ordered",
    "in progress",
    "complete",
    "cancelled",
    "support needed",
  ];

  return (
    <div className="order-status-picker">
      <button
        onClick={() => setShowDropdown(!showDropDown)}
        className={`order-status-button ${skewerCase(currentStatus)}-button`}
        ref={referenceRef}
      >
        {capitalize(currentStatus)}
      </button>
      {showDropDown && (
        <FloatingPortal>
          <div
            className="dropdown-floating order-status-picker-dropdown"
            ref={floatingRef}
            style={floatingStyles}
          >
            {statuses.map((status: any) => (
              <div
                className="dropdown-item"
                onClick={() => {
                  handleUpdateStatus(status);
                  setShowDropdown(false);
                }}
              >
                <button
                  className={`order-status-button ${skewerCase(status)}-button`}
                >
                  {capitalize(status)}
                </button>
              </div>
            ))}
          </div>
        </FloatingPortal>
      )}
    </div>
  );
};
export default OrderStatusPicker;
