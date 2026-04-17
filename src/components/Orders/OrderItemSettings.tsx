import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaClone } from "react-icons/fa6";
import { FaTrashCan } from "react-icons/fa6";

interface props {
  item: any;
  setOrderItems: any;
}

const OrderItemSettings = ({ item, setOrderItems }: props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".order-item-settings-button");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isButtonClick
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleDeleteItem = async () => {
    try {
      await axios
        .post("/api/deleteOrderItem", { itemId: item.itemId })
        .then((res) => {
          if (res.status === 200) {
            setOrderItems((prev: any) =>
              prev.filter((sheetItem: any) => sheetItem.itemId !== item.itemId),
            );
            setShowDropdown(false);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };
  const handleDuplicateItem = async () => {
    try {
      await axios
        .post("/api/duplicateOrderItem", { itemId: item.itemId })
        .then((res) => {
          console.log(res.data);
          if (res.status === 200) {
            setOrderItems((prev: any) => {
              const allItems = [...prev, res.data];
              return allItems.sort((a, b) => a.orderIndex - b.orderIndex);
            });
            setShowDropdown(false);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="order-item-settings">
      <button
        className="order-item-settings-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        ...
      </button>
      {showDropdown && (
        <div
          className="dropdown order-item-settings-dropdown"
          ref={dropdownRef}
        >
          <div
            className="dropdown-item order-item-settings-item"
            onClick={() => handleDuplicateItem()}
          >
            <FaClone className="order-item-icons" />
            Duplicate
          </div>
          <div
            className="dropdown-item order-item-settings-item"
            onClick={() => handleDeleteItem()}
          >
            <FaTrashCan className="order-item-icons" />
            Delete
          </div>
        </div>
      )}
    </div>
  );
};
export default OrderItemSettings;
