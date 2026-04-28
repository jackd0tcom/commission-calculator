import { FaCheck } from "react-icons/fa6";

interface props {
  bulkSelects: any;
  setBulkSelects: any;
  orderItems: any;
}

const BulkSelector = ({ bulkSelects, setBulkSelects, orderItems }: props) => {
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
        onClick={() => handleBulkSelect()}
        className={
          bulkSelects.length > 0 ? "bulk-toggle bulk-selected" : "bulk-toggle"
        }
      >
        {bulkSelects.length > 0 && <FaCheck className="bulk-check" />}
      </div>
      {bulkSelects.length > 0 && <p>{bulkSelects.length} Selected</p>}
    </div>
  );
};
export default BulkSelector;
