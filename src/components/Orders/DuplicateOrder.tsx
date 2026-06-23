import { useState } from "react";

interface props {
  setShowDuplicateOrder: any;
  handleDuplicateOrder: any;
}

const DuplicateOrder = ({
  setShowDuplicateOrder,
  handleDuplicateOrder,
}: props) => {
  const [quantity, setQuantity] = useState(0);
  const [monthly, setMonthly] = useState(true);

  return (
    <div className="duplicate-order-wrapper">
      <p>Duplicate Order</p>
      <div className="duplicate-order-quantity">
        <p>Quantity</p>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>
      <div className="toggle-container">
        <p>Increment Due Date Monthly</p>
        <label className="switch">
          <input
            type="checkbox"
            onChange={() => {
              setMonthly(!monthly);
            }}
            checked={monthly}
          />
          <span className="slider round"></span>
        </label>
      </div>
      <div className="duplicate-order-buttons">
        <button
          className="duplicate-button"
          onClick={() => handleDuplicateOrder(quantity, monthly)}
          disabled={quantity === 0}
        >
          Duplicate
        </button>
        <button onClick={() => setShowDuplicateOrder(false)}>Cancel</button>
      </div>
    </div>
  );
};
export default DuplicateOrder;
