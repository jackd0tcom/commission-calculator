import VendorRowInput from "./VendorRowInput";
import axios from "axios";
import { camelCase } from "../../helpers";

interface props {
  item: any;
  vendorList: any;
  currentVendor: boolean;
  status: string;
  vendorPayload: any;
  setVendorPayload: any;
  currentProduct: any;
}

const VendorRow = ({
  item,
  vendorList,
  currentVendor,
  status,
  vendorPayload,
  setVendorPayload,
  currentProduct,
}: props) => {
  const vendorData = vendorList.find(
    (vendor: any) => vendor.vendorId === currentVendor,
  );

  const vendorProductData = vendorData.vendor_products?.find(
    (product: any) => product.vendorProductId === currentProduct.productId,
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

  const orderedFields = vendorProductData.vendor_fields?.sort(
    (a: any, b: any) => a.sortIndex - b.sortIndex,
  );

  return (
    <div className="vendor-row">
      {vendorProductData?.vendor_fields ? (
        <>
          <div
            className="vendor-row-head"
            style={{
              gridTemplateColumns: `repeat(${vendorProductData.vendor_fields.length}, 1fr)`,
            }}
          >
            {vendorProductData.vendor_fields.map((field: any) => (
              <p>{field.label}</p>
            ))}
          </div>
          <div
            className="vendor-row-inputs"
            style={{
              gridTemplateColumns: `repeat(${vendorProductData.vendor_fields.length}, 1fr)`,
            }}
          >
            {orderedFields.map((field: any) =>
              field.isGenerated || field.isClient ? (
                <p>{vendorPayload?.[camelCase(field.label)] ?? ""}</p>
              ) : status !== "staged" ? (
                <p>{vendorPayload?.[camelCase(field.label)] ?? ""}</p>
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
