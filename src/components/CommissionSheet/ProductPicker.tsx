import { useState, useEffect, useRef } from "react";

const ProductPicker = ({ products, currentProduct }) => {
  const [selectedProductId, setSelectedProductId] = useState(currentProduct);
  const [showDropDown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const selectedProduct = products.find(
    (c: any) => c.productId === selectedProductId,
  );

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".user-picker-button");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isButtonClick
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropDown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropDown]);

  return (
    <div className="client-picker">
      <button
        className="client-picker-button"
        onClick={() => setShowDropdown(!showDropDown)}
      >
        {selectedProduct?.productName}
      </button>
      {showDropDown && (
        <div className="client-picker-dropdown" ref={dropdownRef}>
          {products.map((product: any) => (
            <div
              className="client-picker-item"
              key={product.productId}
              onClick={() => setSelectedProductId(product.productId)}
            >
              {product.productName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ProductPicker;
