import { useState, useEffect, useRef } from "react";
import { camelCase } from "../../helpers";

interface props {
  field: any;
  vendorPayload: any;
  orderUpdate: any;
}

const VendorRowInput = ({ field, vendorPayload, orderUpdate }: props) => {
  const slug = field.slug
    ? camelCase(field.slug)
    : (camelCase(field.label) ?? undefined);
  const [value, setValue] = useState(vendorPayload?.[slug] ?? undefined);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".order-status-button");
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

  return field.fieldType === "string" ? (
    <input
      className="order-input"
      type={field.field_type}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onBlur={(e) => {
        if (e.target.value !== value) {
          orderUpdate(slug, value);
        }
      }}
    />
  ) : (
    field.fieldType === "enum" && (
      <div className="order-vendor-dropdown-wrapper relative">
        <button onClick={() => setShowDropdown(!showDropdown)}>
          {value ?? "Select"}
        </button>
        {showDropdown && (
          <div className="dropdown" ref={dropdownRef}>
            {field.options?.map((option: any) => {
              return (
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setValue(option.value);
                    orderUpdate(slug, option.value);
                    setShowDropdown(false);
                  }}
                >
                  {option.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    )
  );
};
export default VendorRowInput;
