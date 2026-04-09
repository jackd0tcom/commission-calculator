import VendorRowInput from "./VendorRowInput";
import axios from "axios";

interface props {
  item: any;
  vendorList: any;
  currentVendor: boolean;
  status: string;
  vendorPayload: any;
  setVendorPayload: any;
}

const VendorRow = ({
  item,
  vendorList,
  currentVendor,
  status,
  vendorPayload,
  setVendorPayload,
}: props) => {
  const vendorData = vendorList.find(
    (vendor: any) => vendor.vendorId === currentVendor,
  );

  const orderUpdate = async (fieldName: string, value: any) => {
    const updatedPayload = { ...vendorPayload, [fieldName]: value };
    try {
      const res = await axios.post("/api/updateOrderItem", {
        itemId: item.itemId,
        fieldName: "vendorPayload",
        value: updatedPayload,
      });
      if (res.status === 200) {
        console.log(res.data);
        setVendorPayload({ ...vendorPayload, [fieldName]: value });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="vendor-row">
      {vendorData?.vendor_fields ? (
        <>
          <div
            className="vendor-row-head"
            style={{
              gridTemplateColumns: `repeat(${vendorData.vendor_fields.length}, 1fr)`,
            }}
          >
            {vendorData.vendor_fields.map((field: any) => (
              <p>{field.label}</p>
            ))}
          </div>
          <div
            className="vendor-row-inputs"
            style={{
              gridTemplateColumns: `repeat(${vendorData.vendor_fields.length}, 1fr)`,
            }}
          >
            {vendorData.vendor_fields.map((field: any) =>
              status !== "staged" ? (
                <p></p>
              ) : (
                <VendorRowInput
                  vendorPayload={vendorPayload}
                  orderUpdate={orderUpdate}
                  field={field}
                />
              ),
            )}
          </div>
        </>
      ) : (
        <div className="vendor-row-head">No extra rows needed</div>
      )}
    </div>
  );
};
export default VendorRow;
