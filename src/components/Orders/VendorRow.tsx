import VendorRowInput from "./VendorRowInput";

interface props {
  vendorList: any;
  currentVendor: boolean;
}

const VendorRow = ({ vendorList, currentVendor }: props) => {
  const vendorData = vendorList.find(
    (vendor: any) => vendor.vendorId === currentVendor,
  );

  console.log(vendorData);

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
            {vendorData.vendor_fields.map((field: any) => (
              <VendorRowInput field={field} />
            ))}
          </div>
        </>
      ) : (
        <div className="vendor-row-head">No extra rows needed</div>
      )}
    </div>
  );
};
export default VendorRow;
