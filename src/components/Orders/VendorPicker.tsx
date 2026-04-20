import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { skewerCase } from "../../helpers";

interface props {
  item: any;
  vendorList: any;
  currentVendor: number;
  setCurrentVendor: any;
}

const VendorPicker = ({
  item,
  vendorList,
  currentVendor,
  setCurrentVendor,
}: props) => {
  const [selectedVendorId, setSelectedVendorId] = useState(
    currentVendor ?? null,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);

  const currentVendorObject = vendorList.find(
    (vendor: any) => vendor.vendorId === selectedVendorId,
  );

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".vendor-picker-button");
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

  const updateVendor = async (id: number) => {
    try {
      await axios
        .post("/api/updateOrderItem", {
          itemId: item.itemId,
          fieldName: "vendorId",
          value: id,
        })
        .then((res) => {
          if (res.status === 200) {
            setCurrentVendor(id);
            setSelectedVendorId(id);
            setShowDropdown(false);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="vendor-picker-wrapper">
      <button
        className={`vendor-picker-button ${skewerCase(currentVendorObject?.vendorName ?? "")}`}
        onClick={() => {
          setShowDropdown(!showDropdown);
        }}
      >
        {currentVendorObject?.vendorName ?? "Select a vendor"}
      </button>
      {showDropdown && (
        <div className="dropdown vendor-picker-dropdown" ref={dropdownRef}>
          {vendorList.map((vendor: any) => (
            <div
              className="dropdown-item vendor-picker-item"
              onClick={() => updateVendor(vendor.vendorId)}
            >
              {vendor.vendorName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default VendorPicker;
