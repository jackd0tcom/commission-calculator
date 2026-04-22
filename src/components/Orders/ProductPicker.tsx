import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface props {
  item: any;
  products: any;
  currentProduct: any;
  handleProductChange: any;
  currentProductType: any;
  linkList: any;
}

const ProductPicker = ({
  item,
  products,
  currentProduct,
  currentProductType,
  handleProductChange,
  linkList,
}: props) => {
  const [selectedProductId, setSelectedProductId] = useState(
    item.productType === "product"
      ? currentProduct?.productId
      : currentProduct?.linkId,
  );
  const [showDropDown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);
  const [showLinks, setShowLinks] = useState(false);

  let selectedProduct;
  let currentName;

  if (currentProductType === "product") {
    selectedProduct = products.find(
      (c: any) => c.productId === selectedProductId,
    );
    currentName = selectedProduct?.productName;
  } else {
    selectedProduct = linkList.find((c: any) => c.linkId === selectedProductId);
    currentName = selectedProduct?.publication;
  }

  const updateProduct = async (id: number, productType: string) => {
    try {
      await axios
        .post("/api/updateOrderItemProduct", {
          itemId: item.itemId,
          productType,
          id,
        })
        .then((res) => {
          if (res.status === 200) {
            handleProductChange(res.data.newProduct, productType);
            setSelectedProductId(id);
            setShowDropdown(false);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  // const updateLink = async (id: number) => {
  //   try {
  //     await axios
  //       .post("/api/updateOrderItem", {
  //         itemId: item.itemId,
  //         fieldName: "productId",
  //         productType: "link",
  //         value: id,
  //       })
  //       .then((res) => {
  //         if (res.status === 200) {
  //           handleProductChange(res.data.newProduct);
  //           setSelectedProductId(id);
  //           setShowDropdown(false);
  //         }
  //       });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".product-picker-button");
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
        {currentName ?? "Add a product"}
      </button>
      {showDropDown && (
        <div className="dropdown product-picker-dropdown" ref={dropdownRef}>
          <div className="product-picker-category">
            <div
              className={
                !showLinks
                  ? "dropdown-item product-picker-category-item active-category"
                  : "dropdown-item product-picker-category-item"
              }
              onClick={() => setShowLinks(false)}
            >
              Products
            </div>
            <div
              className={
                showLinks
                  ? "dropdown-item product-picker-category-item active-category"
                  : "dropdown-item product-picker-category-item"
              }
              onClick={() => setShowLinks(true)}
            >
              Links
            </div>
          </div>
          <div className="product-picker-items">
            {!showLinks
              ? products.map((product: any) => (
                  <div
                    className="dropdown-item product-picker-item"
                    key={product.productId}
                    onClick={() => updateProduct(product.productId, "product")}
                  >
                    {product.productName}
                  </div>
                ))
              : linkList.map((link: any) => {
                  if (!link.publication) {
                    return;
                  }
                  return (
                    <div
                      className="dropdown-item product-picker-item"
                      key={link.linkId}
                      onClick={() => updateProduct(link.linkId, "link")}
                    >
                      {link.publication ?? "No url provided"}
                    </div>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductPicker;
