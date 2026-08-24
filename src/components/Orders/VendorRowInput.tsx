import { useState } from "react";
import { camelCase } from "../../helpers";

interface props {
  field: any;
  vendorPayload: any;
  orderUpdate: any;
}

const VendorRowInput = ({ field, vendorPayload, orderUpdate }: props) => {
  const slug = camelCase(field.slug) ?? undefined;
  const [value, setValue] = useState(vendorPayload?.[slug] ?? undefined);
  const [showDropdown, setShowDropdown] = useState(false);

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
          <div className="dropdown">
            {field.options?.map((option: any) => {
              return (
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setValue(option.value);
                    orderUpdate(slug, value);
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
