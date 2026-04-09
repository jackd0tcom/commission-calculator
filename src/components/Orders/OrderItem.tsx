import { useState } from "react";
import ProductPicker from "./ProductPicker";
import OrderStatusPicker from "./OrderStatusPicker";
import OrderDeliveryPicker from "./OrderDeliveryPicker";
import axios from "axios";
import { formatDollarNoCents, formatDateNoTime } from "../../helpers";
import VendorPicker from "./VendorPicker";
import VendorRow from "./VendorRow";
import { FaAngleUp } from "react-icons/fa6";
import { TiDelete } from "react-icons/ti";

interface props {
  item: any;
  index: number;
  setOrderItems: any;
  products: any;
  linkList: any;
  onQuantityChange: any;
  onPriceChange: any;
  onDeliveriesChange?: (itemId: number, deliveries: any[]) => void;
  vendorList: any;
}

const OrderItem = ({
  item,
  index,
  setOrderItems,
  products,
  onQuantityChange,
  onPriceChange,
  linkList,
  vendorList,
  onDeliveriesChange,
}: props) => {
  const [currentProduct, setCurrentProduct] = useState(
    item?.product ? item?.product : null,
  );
  const [currentVendor, setCurrentVendor] = useState(item.vendorId ?? null);
  const [hovering, setHovering] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity ?? 0);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [targetUrl, setTargetUrl] = useState(item.targetUrl ?? "");
  const [anchorText, setAnchorText] = useState(item.anchorText ?? "");
  const [status, setStatus] = useState(item.itemStatus ?? "");
  const [price, setPrice] = useState(
    item.priceSnapshot ?? item.price ?? item.product?.defaultPrice ?? 0,
  );
  const [deliveries, setDeliveries] = useState(item.deliveries ?? []);
  const [showVendorRows, setShowVendorRows] = useState(false);

  const handleProductChange = async (newProduct: any) => {
    setCurrentProduct(newProduct);
    setPrice(newProduct.defaultPrice);
    setOrderItems((prev: any) =>
      prev.map((it: any) =>
        it.itemId === item.itemId
          ? { ...it, product: newProduct, price: newProduct.defaultPrice }
          : it,
      ),
    );
  };

  const persistQuantityChange = async (newQuantity: number) => {
    try {
      const res = await axios.post("/api/updateOrderItem", {
        itemId: item.itemId,
        fieldName: "quantity",
        value: newQuantity,
      });
      if (res.status === 200) {
        setQuantity(newQuantity);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const persistPriceChange = async (newPrice: number) => {
    try {
      const res = await axios.post("/api/updateOrderItem", {
        itemId: item.itemId,
        fieldName: "price",
        value: newPrice,
      });
      if (res.status === 200) {
        setPrice(newPrice);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleDeleteItem = async () => {
    try {
      await axios
        .post("/api/deleteOrderItem", { itemId: item.itemId })
        .then((res) => {
          if (res.status === 200) {
            setOrderItems((prev: any) =>
              prev.filter((sheetItem: any) => sheetItem.itemId !== item.itemId),
            );
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    const newStatus = status === "draft" ? "submitted" : "draft";
    const newItem = { ...item, itemStatus: newStatus };
    try {
      await axios
        .post("/api/updateOrderStatus", {
          item: newItem,
        })
        .then((res) => {
          if (res.status === 200) {
            setOrderItems((prev: any) =>
              prev.map((it: any) =>
                it.itemId === item.itemId ? res.data : it,
              ),
            );
            setStatus(newStatus);
            if (newStatus === "draft") {
              setDeliveries([]);
              onDeliveriesChange?.(item.itemId, []);
            }
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const currentVendorName = vendorList.find(
    (vendor: any) => vendor.vendorId === currentVendor,
  )?.vendorName;

  return status !== "ordered" ? (
    <div className="order-items-list-item-wrapper">
      <div
        className="order-items-list-item"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {!hovering ? (
          <p className="sheet-item-number">{index + 1}</p>
        ) : currentVendorName && currentVendorName !== "Interior" ? (
          <FaAngleUp
            onClick={() => setShowVendorRows(!showVendorRows)}
            className={
              showVendorRows
                ? "order-item-carat carat-toggled"
                : "order-item-carat"
            }
          />
        ) : (
          <p className="sheet-item-number">{index + 1}</p>
        )}
        <p className="sheet-item-number">{formatDateNoTime(item.createdAt)}</p>
        <ProductPicker
          item={item}
          products={products}
          currentProduct={currentProduct}
          handleProductChange={handleProductChange}
          linkList={linkList}
        />
        <VendorPicker
          item={item}
          vendorList={vendorList}
          currentVendor={currentVendor}
          setCurrentVendor={setCurrentVendor}
        />
        <input
          className="order-input"
          type="text"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
          }}
          // TODO
          // onBlur={() => persistQuantityChange(quantity)}
        />
        <input
          className="order-input"
          type="text"
          value={targetUrl}
          onChange={(e) => {
            setTargetUrl(e.target.value);
          }}
          // TODO
          // onBlur={() => persistQuantityChange(quantity)}
        />
        <input
          className="order-input"
          type="text"
          value={anchorText}
          onChange={(e) => {
            setAnchorText(e.target.value);
          }}
          // TODO
          // onBlur={() => persistQuantityChange(quantity)}
        />
        <div className="price-input-wrapper">
          <span>$</span>
          <input
            className="price-input"
            type="number"
            value={`${price}`}
            onChange={(e) => {
              const val = Number(e.target.value);
              setPrice(val);
              onPriceChange?.(item.itemId, val);
            }}
            onBlur={() => persistPriceChange(price)}
          />
        </div>
        <OrderStatusPicker
          currentStatus={status}
          handleUpdateStatus={handleUpdateStatus}
        />
      </div>
      {showVendorRows && (
        <VendorRow vendorList={vendorList} currentVendor={currentVendor} />
      )}
    </div>
  ) : (
    <div className="order-items-list-item">
      <p className="sheet-item-number">{index + 1}</p>
      <p>{item.productNameSnapshot}</p>
      <p>{quantity}</p>
      <p>${item.priceSnapshot}</p>
      <OrderStatusPicker
        currentStatus={status}
        handleUpdateStatus={handleUpdateStatus}
      />
      <OrderDeliveryPicker
        deliveries={deliveries}
        setDeliveries={setDeliveries}
        quantity={quantity}
        item={item}
        onDeliveriesChange={(next) => onDeliveriesChange?.(item.itemId, next)}
      />
      <p>{formatDollarNoCents(quantity * price)}</p>
      <p className="delete-placeholder"></p>
    </div>
  );
};
export default OrderItem;
