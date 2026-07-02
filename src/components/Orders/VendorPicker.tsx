import axios from "axios";
import { skewerCase } from "../../helpers";
import { useFloatingDropdown } from "../../hooks/useFloatingDropdown";

interface props {
  item: any;
  vendorList: any;
  currentVendor: number;
  setCurrentVendor: any;
  currentProduct: any;
  boundaryRef: any;
}

const VendorPicker = ({
  item,
  vendorList,
  currentVendor,
  setCurrentVendor,
  currentProduct,
  boundaryRef,
}: props) => {
  let selectedVendorId = currentVendor ?? null;
  const {
    open: showDropDown,
    setOpen: setShowDropdown,
    referenceRef,
    floatingRef,
    floatingStyles,
    FloatingPortal,
  } = useFloatingDropdown({ boundaryRef, maxHeight: 200, minHeight: 100 });

  const availableVendors = vendorList.filter(
    (vendor: any) =>
      vendor.vendorName === "Interior" ||
      (vendor.vendor_products?.length > 0 &&
        vendor.vendor_products.some(
          (product: any) =>
            product?.vendorProductId === currentProduct?.productId,
        )),
  );

  const currentVendorObject = vendorList.find(
    (vendor: any) => vendor.vendorId === selectedVendorId,
  );

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
            selectedVendorId = id;
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
        ref={referenceRef}
        onClick={() => {
          setShowDropdown(!showDropDown);
        }}
      >
        {currentVendorObject?.vendorName ?? "Select a vendor"}
      </button>
      {showDropDown && (
        <FloatingPortal>
          <div
            className="dropdown-floating vendor-picker-dropdown"
            ref={floatingRef}
            style={floatingStyles}
          >
            {availableVendors.map((vendor: any) => (
              <div
                className="dropdown-item vendor-picker-item"
                onClick={() => updateVendor(vendor.vendorId)}
              >
                {vendor.vendorName}
              </div>
            ))}
          </div>
        </FloatingPortal>
      )}
    </div>
  );
};
export default VendorPicker;
