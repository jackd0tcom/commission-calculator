import { useState } from "react";
import { camelCase } from "../../helpers";

interface props {
  field: any;
  vendorPayload: any;
  orderUpdate: any;
}

const VendorRowInput = ({ field, vendorPayload, orderUpdate }: props) => {
  const slug = camelCase(field.label) ?? undefined;
  const [value, setValue] = useState(vendorPayload?.[slug] ?? undefined);

  return (
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
  );
};
export default VendorRowInput;
