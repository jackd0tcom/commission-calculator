import { useState } from "react";
import { FaCheck, FaX } from "react-icons/fa6";

interface props {
  bulkSelects: any;
  setBulkSelects: any;
  orderItems: any;
}

const BulkSelector = ({ bulkSelects, setBulkSelects, orderItems }: props) => {
  const [hovering, setHovering] = useState(false);
  const handleBulkSelect = () => {
    if (bulkSelects.length <= 0) {
      const items = [...orderItems];
      const filteredItems: any = items.filter(
        (item: any) => item.itemId && item.itemStatus !== "complete",
      );
      setBulkSelects(filteredItems);
    } else setBulkSelects([]);
  };

  return (
    <div className="bulk-selector-wrapper">
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => handleBulkSelect()}
        className={
          bulkSelects.length > 0 ? "bulk-toggle bulk-selected" : "bulk-toggle"
        }
      >
        {bulkSelects.length > 0 && <FaX className="bulk-x" />}
      </div>
      {bulkSelects.length > 0 && <p>{bulkSelects.length}</p>}
    </div>
  );
};
export default BulkSelector;
