import { useState, useEffect, useRef, useMemo } from "react";
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
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const alphabetizedProducts = useMemo(
    () =>
      [...products].sort((a: any, b: any) =>
        a.productName.toLowerCase().localeCompare(b.productName.toLowerCase()),
      ),
    [products],
  );

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

  const filteredProducts = useMemo(() => {
    let data = alphabetizedProducts;

    if (search.trim() !== "") {
      // Search filtering
      const searchQuery = search.trim().toLowerCase();
      data = data.filter((product: any) => {
        if (product.productName.toLowerCase().includes(searchQuery))
          return true;
      });
    }

    return data;
  }, [search, alphabetizedProducts]);

  useEffect(() => {
    setActiveIndex(0);
    itemRefs.current = [];
  }, [search]);

  useEffect(() => {
    if (showDropDown) {
      searchInputRef.current?.focus();
    } else {
      setSearch("");
      setActiveIndex(0);
    }
  }, [showDropDown]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && filteredProducts[activeIndex]) {
      e.preventDefault();
      updateProduct(filteredProducts[activeIndex].productId, "product");
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeIndex]);

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
            {/* <div
              className={
                showLinks
                  ? "dropdown-item product-picker-category-item active-category"
                  : "dropdown-item product-picker-category-item"
              }
              onClick={() => setShowLinks(true)}
            >
              Links
            </div> */}
          </div>
          <div className="product-picker-items">
            <div className="product-search">
              <input
                ref={searchInputRef}
                type="text"
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="product-search-input"
                placeholder="Search"
              />
            </div>
            <div className="product-picker-items-wrapper">
              {!showLinks
                ? filteredProducts.map((product: any, index: number) => (
                  <div
                    className={
                      index === activeIndex
                        ? "dropdown-item product-picker-item active"
                        : "dropdown-item product-picker-item"
                    }
                    key={product.productId}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() =>
                      updateProduct(product.productId, "product")
                    }
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
        </div>
      )}
    </div>
  );
};
export default ProductPicker;
