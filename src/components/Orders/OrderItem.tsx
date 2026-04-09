import { useState } from "react";
import ProductPicker from "./ProductPicker";
import OrderStatusPicker from "./OrderStatusPicker";
import axios from "axios";
import { formatDateNoTime } from "../../helpers";
import VendorPicker from "./VendorPicker";
import VendorRow from "./VendorRow";
import OrderItemSettings from "./OrderItemSettings";
import { FaAngleUp } from "react-icons/fa6";

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
  handleOrderItemUpdate: any;
}

const OrderItem = ({
  item,
  index,
  setOrderItems,
  products,
  onPriceChange,
  linkList,
  vendorList,
  handleOrderItemUpdate,
}: props) => {
  const [currentProduct, setCurrentProduct] = useState(
    item?.product ? item?.product : null,
  );
  const [currentVendor, setCurrentVendor] = useState(item.vendorId ?? null);
  const [hovering, setHovering] = useState(false);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [targetUrl, setTargetUrl] = useState(item.targetUrl ?? "");
  const [anchorText, setAnchorText] = useState(item.anchorText ?? "");
  const [status, setStatus] = useState(item.itemStatus ?? "");
  const [price, setPrice] = useState(
    item.priceSnapshot ?? item.price ?? item.product?.defaultPrice ?? 0,
  );
  const [showVendorRows, setShowVendorRows] = useState(false);
  const [vendorPayload, setVendorPayload] = useState(item.vendorPayload ?? {});

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

  const persistOrderUpdate = async (fieldName: string, value: any) => {
    try {
      const res = await axios.post("/api/updateOrderItem", {
        itemId: item.itemId,
        fieldName,
        value,
      });
      if (res.status === 200) {
        switch (fieldName) {
          case "price":
            setPrice(value);
            break;
          case "notes":
            setNotes(value);
            break;
          case "targetUrl":
            setTargetUrl(value);
            break;
          case "anchorText":
            setAnchorText(value);
            break;
        }
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
    const newItem = { ...item, itemStatus: status };
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
            setStatus(status);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const currentVendorName = vendorList.find(
    (vendor: any) => vendor.vendorId === currentVendor,
  )?.vendorName;

  return status === "staged" ? (
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
            onBlur={() => persistOrderUpdate("price", price)}
          />
        </div>
        <input
          className="order-input"
          type="text"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            handleOrderItemUpdate?.("notes", item.itemId, e.target.value);
          }}
          onBlur={() => persistOrderUpdate("notes", notes)}
        />
        <input
          className="order-input"
          type="text"
          value={targetUrl}
          onChange={(e) => {
            setTargetUrl(e.target.value);
            handleOrderItemUpdate?.("targetUrl", item.itemId, e.target.value);
          }}
          onBlur={() => persistOrderUpdate("targetUrl", targetUrl)}
        />
        <input
          className="order-input"
          type="text"
          value={anchorText}
          onChange={(e) => {
            setAnchorText(e.target.value);
            handleOrderItemUpdate?.("anchorText", item.itemId, e.target.value);
          }}
          onBlur={() => persistOrderUpdate("anchorText", anchorText)}
        />
        <OrderStatusPicker
          currentStatus={status}
          handleUpdateStatus={handleUpdateStatus}
        />
        <OrderItemSettings item={item} handleDeleteItem={handleDeleteItem} />
      </div>
      {showVendorRows && (
        <VendorRow
          item={item}
          status={status}
          vendorList={vendorList}
          currentVendor={currentVendor}
          vendorPayload={vendorPayload}
          setVendorPayload={setVendorPayload}
        />
      )}
    </div>
  ) : (
    <div className="order-items-list-item-wrapper">
      <div className="order-items-list-item">
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
        <p>{item.productNameSnapshot ?? item.product.productName}</p>
        <p>{currentVendorName}</p>
        <p>${item.priceSnapshot ?? item.product.defaultPrice}</p>
        <p>{item.notes}</p>
        <p>{item.targetUrl}</p>
        <p>{item.anchorText}</p>
        <OrderStatusPicker
          currentStatus={status}
          handleUpdateStatus={handleUpdateStatus}
        />
        <OrderItemSettings item={item} handleDeleteItem={handleDeleteItem} />
      </div>
      {showVendorRows && (
        <VendorRow
          item={item}
          status={status}
          vendorList={vendorList}
          currentVendor={currentVendor}
          vendorPayload={vendorPayload}
          setVendorPayload={setVendorPayload}
        />
      )}
    </div>
  );
};
export default OrderItem;
