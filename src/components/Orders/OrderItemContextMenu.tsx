import { useState } from "react";
import {
  FaClone,
  FaTrashCan,
  FaBarcode,
  FaMagnifyingGlass,
  FaHandPointer,
  FaCopy,
} from "react-icons/fa6";
import { useNavigate } from "react-router";
import axios from "axios";

interface props {
  yPos: any;
  xPos: any;
  item: any;
  setOrderItems: any;
  setBulkSelects: any;
  bulkSelects: any;
  isRespona?: boolean;
  handleRemoveResponaPlacement?: any;
}

const OrderItemContextMenu = ({
  yPos,
  xPos,
  item,
  setOrderItems,
  setBulkSelects,
  bulkSelects,
  isRespona,
  handleRemoveResponaPlacement,
}: props) => {
  const [showMass, setShowMass] = useState(false);
  const [duplications, setDuplications] = useState(0);
  const navigate = useNavigate();
  const handleDeleteItem = async () => {
    try {
      await axios
        .post("/api/deleteOrderItem", { itemId: item.itemId })
        .then((res) => {
          if (res.status === 200) {
            setOrderItems((prev: any) =>
              prev.filter((sheetItem: any) => sheetItem.itemId !== item.itemId),
            );
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
              const allItems = prev.map((it: any) =>
                it.orderIndex > item.orderIndex
                  ? { ...it, orderIndex: it.orderIndex + 1 }
                  : it,
              );
              return [...allItems, res.data].sort(
                (a, b) => a.orderIndex - b.orderIndex,
              );
            });
          }
        });
    } catch (error) {
      console.log(error);
    }
  };
  const handleMassDuplicate = async () => {
    try {
      const quantity = Number(duplications);
      await axios
        .post("/api/massDuplicateOrderItem", {
          itemId: item.itemId,
          quantity,
        })
        .then((res) => {
          console.log(res.data);
          if (res.status === 200) {
            setOrderItems((prev: any) => {
              const allItems = prev.map((it: any) =>
                it.orderIndex > item.orderIndex
                  ? { ...it, orderIndex: it.orderIndex + quantity }
                  : it,
              );
              return [...allItems, ...res.data].sort(
                (a, b) => a.orderIndex - b.orderIndex,
              );
            });
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelect = () => {
    setBulkSelects((prev: any) => [...prev, item]);
  };

  return (
    <ul
      className="context-menu dropdown"
      style={{ top: yPos, left: xPos, position: "fixed" }}
    >
      <p className="context-menu-heading">
        #{item.orderIndex ?? ""}{" "}
        {item.product?.productName ?? item.link?.publication ?? ""}
      </p>
      {isRespona && (
        <li
          className="context-menu-item dropdown-item"
          onClick={() => handleRemoveResponaPlacement()}
        >
          <FaTrashCan className="context-item-icons" />
          Remove From Respona Order
        </li>
      )}
      {showMass ? (
        <div className="mass-duplication">
          <input
            className="duplicate-input"
            onClick={(e: any) => e.stopPropagation()}
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            value={duplications}
            onChange={(e: any) => setDuplications(Number(e.target.value))}
          />
          <button
            className="duplicate-button"
            onClick={() => handleMassDuplicate()}
          >
            Duplicate
          </button>
        </div>
      ) : (
        <>
          {item.itemStatus !== "complete" && (
            <>
              {bulkSelects.length > 0 && (
                <li
                  className="context-menu-item dropdown-item"
                  onClick={() => handleDeleteItem()}
                >
                  <FaCopy className="context-item-icons" />
                  Copy Items ({bulkSelects.length})
                </li>
              )}
              <li
                className="context-menu-item dropdown-item"
                onClick={() => handleSelect()}
              >
                {" "}
                <FaHandPointer className="context-item-icons" />
                Select
              </li>
              <li
                className="context-menu-item dropdown-item"
                onClick={() => handleDuplicateItem()}
              >
                {" "}
                <FaClone className="context-item-icons" />
                Duplicate
              </li>
              <li
                className="context-menu-item dropdown-item"
                onClick={(e: any) => {
                  e.stopPropagation();
                  setShowMass(true);
                }}
              >
                {" "}
                <FaBarcode className="context-item-icons" />
                Mass Duplicate
              </li>
              <li
                className="context-menu-item dropdown-item"
                onClick={() => handleDeleteItem()}
              >
                <FaTrashCan className="context-item-icons" />
                Delete
              </li>
            </>
          )}
          <li
            className="context-menu-item dropdown-item"
            onClick={() => navigate("/products")}
          >
            <FaMagnifyingGlass className="context-item-icons" />
            See Product
          </li>
        </>
      )}
    </ul>
  );
};
export default OrderItemContextMenu;
