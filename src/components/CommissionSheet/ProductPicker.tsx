import { useState, useEffect, useRef } from "react";
import axios from "axios";

const ProductPicker = ({
  item,
  products,
  currentProduct,
  handleProductChange,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(currentProduct);
  const [showDropDown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const selectedProduct = products.find(
    (c: any) => c.productId === selectedProductId,
  );

  const updateProduct = async (id: number) => {
    try {
      await axios
        .post("/api/updateSheetItem", {
          itemId: item.itemId,
          fieldName: "productId",
          value: id,
        })
        .then((res) => {
          if (res.status === 200) {
            handleProductChange(res.data.newProduct);
            setSelectedProductId(id);
            setShowDropdown(false);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

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
    <div className="product-picker">
      <button
        className="product-picker-button"
        onClick={() => setShowDropdown(!showDropDown)}
      >
        {selectedProduct?.productName
          ? selectedProduct.productName
          : "Add a product"}
      </button>
      {showDropDown && (
        <div className="dropdown product-picker-dropdown" ref={dropdownRef}>
          {products.map((product: any) => (
            <div
              className="dropdown-item product-picker-item"
              key={product.productId}
              onClick={() => updateProduct(product.productId)}
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
