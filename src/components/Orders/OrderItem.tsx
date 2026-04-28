import { useState } from "react";
import ProductPicker from "./ProductPicker";
import OrderStatusPicker from "./OrderStatusPicker";
import axios from "axios";
import { formatDateNoTime } from "../../helpers";
import VendorPicker from "./VendorPicker";
import VendorRow from "./VendorRow";
import OrderItemSettings from "./OrderItemSettings";
import { FaAngleUp, FaCheck } from "react-icons/fa6";
import { useContextMenu } from "../../hooks/UseContextMenu";
import OrderItemContextMenu from "./OrderItemContextMenu";

interface props {
  item: any;
  index: number;
  setOrderItems: any;
  products: any;
  bulkSelects: any;
  setBulkSelects: any;
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
  bulkSelects,
  setBulkSelects,
  linkList,
  vendorList,
  handleOrderItemUpdate,
}: props) => {
  const [currentProduct, setCurrentProduct] = useState(
    item.linkId ? { linkId: item.linkId } : (item?.product ?? null),
  );
  const [currentProductType, setCurrentProductType] = useState(
    item?.productType ?? null,
  );
  const [currentVendor, setCurrentVendor] = useState(item.vendorId ?? null);
  const [hovering, setHovering] = useState(false);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [targetUrl, setTargetUrl] = useState(item.targetUrl ?? "");
  const [anchorText, setAnchorText] = useState(item.anchorText ?? "");
  let status = item.itemStatus ?? "";
  const [price, setPrice] = useState(
    item.priceSnapshot ?? item.price ?? item.product?.defaultPrice ?? 0,
  );
  const [showVendorRows, setShowVendorRows] = useState(false);
  const [vendorPayload, setVendorPayload] = useState(item.vendorPayload ?? {});
  const { xPos, yPos, showMenu, handleContextMenu } = useContextMenu();

  let isSelected = bulkSelects.some((it: any) => it.itemId === item.itemId);

  const handleProductChange = async (newProduct: any, productType: string) => {
    const interiorVendor = vendorList.find(
      (vendor: any) => vendor.vendorName === "Interior",
    );
    setCurrentProduct(newProduct);
    setCurrentProductType(productType);
    setPrice(newProduct.defaultPrice);
    setShowVendorRows(false);
    setCurrentVendor(interiorVendor.vendorId ?? 1);
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

  const handleUpdateStatus = async (status: string) => {
    const newItem = {
      ...item,
      itemStatus: status,
      productType: currentProductType,
    };
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
            status = status;
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleBulkSelect = () => {
    if (!isSelected) {
      setBulkSelects((prev: any) => [...prev, item]);
    } else {
      setBulkSelects((prev: any) =>
        prev.filter((it: any) => it.itemId !== item.itemId),
      );
    }
  };

  const currentVendorName = vendorList.find(
    (vendor: any) => vendor.vendorId === currentVendor,
  )?.vendorName;

  return bulkSelects.length > 0 && status !== "complete" ? (
    <div className="order-items-list-item-wrapper">
      <div
        className="order-items-list-item"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div
          onClick={() => handleBulkSelect()}
          className={
            !isSelected
              ? "bulk-select-radio"
              : "bulk-select-radio selected-bulk"
          }
        >
          {isSelected && <FaCheck className="bulk-select-radio-check" />}
        </div>
        <p className="sheet-item-number">{formatDateNoTime(item.createdAt)}</p>
        <p>
          {currentProductType === "product"
            ? (item.productNameSnapshot ?? item.product?.productName)
            : (item.link?.publication ?? "")}
        </p>
        <p>{currentVendorName}</p>
        <OrderStatusPicker
          currentStatus={status}
          handleUpdateStatus={handleUpdateStatus}
        />
        <p>
          $
          {item.priceSnapshot ??
            item.product?.defaultPrice ??
            item.defaultPrice ??
            0}
        </p>
        <p>{item.notes}</p>
        <p>{item.targetUrl}</p>
        <p>{item.anchorText}</p>
        <OrderItemSettings item={item} setOrderItems={setOrderItems} />
      </div>
      {showVendorRows && (
        <VendorRow
          item={item}
          status={status}
          vendorList={vendorList}
          currentVendor={currentVendor}
          currentProduct={currentProduct}
          vendorPayload={vendorPayload}
          setVendorPayload={setVendorPayload}
        />
      )}
    </div>
  ) : status === "staged" ? (
    <div className="order-items-list-item-wrapper">
      <div
        className="order-items-list-item"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onContextMenu={handleContextMenu}
      >
        {showMenu && (
          <OrderItemContextMenu
            item={item}
            yPos={yPos}
            xPos={xPos}
            setOrderItems={setOrderItems}
            setBulkSelects={setBulkSelects}
          />
        )}
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
          currentProductType={currentProductType}
          products={products}
          currentProduct={currentProduct}
          handleProductChange={handleProductChange}
          linkList={linkList}
        />
        <VendorPicker
          currentProduct={currentProduct}
          item={item}
          vendorList={vendorList}
          currentVendor={currentVendor}
          setCurrentVendor={setCurrentVendor}
        />
        <OrderStatusPicker
          currentStatus={status}
          handleUpdateStatus={handleUpdateStatus}
        />
        <div className="order-price-input-wrapper">
          <span>$</span>
          <input
            className="order-price-input"
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
        <OrderItemSettings item={item} setOrderItems={setOrderItems} />
      </div>
      {showVendorRows && (
        <VendorRow
          item={item}
          status={status}
          vendorList={vendorList}
          currentVendor={currentVendor}
          vendorPayload={vendorPayload}
          setVendorPayload={setVendorPayload}
          currentProduct={currentProduct}
        />
      )}
    </div>
  ) : (
    <div className="order-items-list-item-wrapper">
      <div
        className="order-items-list-item"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onContextMenu={handleContextMenu}
      >
        {showMenu && (
          <OrderItemContextMenu
            item={item}
            yPos={yPos}
            xPos={xPos}
            setOrderItems={setOrderItems}
            setBulkSelects={setBulkSelects}
          />
        )}
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
        <p>
          {currentProductType === "product"
            ? (item.productNameSnapshot ?? item.product?.productName)
            : (item.link?.publication ?? "")}
        </p>
        <p>{currentVendorName}</p>
        <OrderStatusPicker
          currentStatus={status}
          handleUpdateStatus={handleUpdateStatus}
        />
        <p>
          $
          {item.priceSnapshot ??
            item.product?.defaultPrice ??
            item.defaultPrice ??
            0}
        </p>
        <p>{item.notes}</p>
        <p>{item.targetUrl}</p>
        <p>{item.anchorText}</p>
        <OrderItemSettings item={item} setOrderItems={setOrderItems} />
      </div>
      {showVendorRows && (
        <VendorRow
          item={item}
          status={status}
          vendorList={vendorList}
          currentVendor={currentVendor}
          currentProduct={currentProduct}
          vendorPayload={vendorPayload}
          setVendorPayload={setVendorPayload}
        />
      )}
    </div>
  );
};
export default OrderItem;
