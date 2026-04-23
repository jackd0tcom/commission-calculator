import { useState } from "react";
import {
  FaClone,
  FaTrashCan,
  FaBarcode,
  FaMagnifyingGlass,
  FaHandPointer,
} from "react-icons/fa6";
import { useNavigate } from "react-router";
import axios from "axios";

interface props {
  yPos: any;
  xPos: any;
  item: any;
  setOrderItems: any;
  setBulkSelects: any;
}

const OrderItemContextMenu = ({
  yPos,
  xPos,
  item,
  setOrderItems,
  setBulkSelects,
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
              const allItems = [...prev, res.data];
              return allItems.sort((a, b) => a.orderIndex - b.orderIndex);
            });
          }
        });
    } catch (error) {
      console.log(error);
    }
  };
  const handleMassDuplicate = async () => {
    try {
      await axios
        .post("/api/massDuplicateOrderItem", {
          itemId: item.itemId,
          quantity: duplications,
        })
        .then((res) => {
          console.log(res.data);
          if (res.status === 200) {
            setOrderItems((prev: any) => {
              const allItems = [...prev, ...res.data];
              return allItems.sort((a, b) => a.orderIndex - b.orderIndex);
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
      {showMass ? (
        <div className="mass-duplication">
          <input
            className="duplicate-input"
            onClick={(e: any) => e.stopPropagation()}
            type="number"
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
