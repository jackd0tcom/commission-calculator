import { useState } from "react";
import ProductPicker from "./ProductPicker";
import OrderStatusPicker from "./OrderStatusPicker";
import axios from "axios";
import VendorPicker from "./VendorPicker";
import VendorRow from "./VendorRow";
import { FaAngleUp, FaCheck } from "react-icons/fa6";
import { useContextMenu } from "../../hooks/UseContextMenu";
import OrderItemContextMenu from "./OrderItemContextMenu";
import DuePicker from "./DuePicker";
import { useSortable } from "@dnd-kit/react/sortable";
import ResponaStatus from "./ResponaStatus";
import {
  formatMoneyInput,
  parseNumericInput,
  sanitizeNumericInput,
} from "../../helpers";

interface props {
  isShiftPressed: boolean;
  isProduction: boolean;
  item: any;
  index: number;
  orderItems: any;
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
  handleCostChange: any;
  boundaryRef: any;
}

const OrderItem = ({
  isShiftPressed,
  isProduction,
  item,
  index,
  orderItems,
  setOrderItems,
  products,
  onPriceChange,
  bulkSelects,
  setBulkSelects,
  linkList,
  vendorList,
  handleOrderItemUpdate,
  handleCostChange,
  boundaryRef,
}: props) => {
  const currentProduct = item.linkId
    ? { linkId: item.linkId }
    : (item?.product ?? null);
  const currentProductType = item?.productType ?? null;
  const [currentVendor, setCurrentVendor] = useState(item.vendorId ?? null);
  const [hovering, setHovering] = useState(false);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [targetUrl, setTargetUrl] = useState(item.targetUrl ?? "");
  const [anchorText, setAnchorText] = useState(item.anchorText ?? "");
  const [publisherUrl, setPublisherUrl] = useState(item.linkingTo ?? "");
  let status = item.itemStatus ?? "";
  const price =
    status === "complete"
      ? item.priceSnapshot
      : (item.price ??
        item.product?.defaultPrice ??
        item.link?.defaultPrice ??
        0);

  const cost =
    status === "complete"
      ? item.costSnapshot
      : (item.cost ?? item.product?.defaultCost ?? 0);
  const [showVendorRows, setShowVendorRows] = useState(false);
  const currentDueDate = item.dueDate ?? null;
  const [vendorPayload, setVendorPayload] = useState(item.vendorPayload ?? {});
  const [costDraft, setCostDraft] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState<string | null>(null);
  const [responaErrorMessage, setResponaErrorMessage] = useState("");
  const [responaStatus, setResponaStatus] = useState("");
  const { xPos, yPos, showMenu, handleContextMenu } = useContextMenu();
  const { ref } = useSortable({
    id: item.itemId,
    index: index,
  });

  let isSelected = bulkSelects.some((it: any) => it.itemId === item.itemId);
  const currentVendorName = vendorList.find(
    (vendor: any) => vendor.vendorId === currentVendor,
  )?.vendorName;

  const isRespona = currentVendorName.toLowerCase() === "respona";
  const showBulk = bulkSelects.length > 0 && status !== "complete";
  const isDraft = isRespona
    ? item.responaItemStatus === null
    : status !== "complete";

  const handleProductChange = async (newProduct: any, productType: string) => {
    const interiorVendor = vendorList.find(
      (vendor: any) => vendor.vendorName === "Interior",
    );
    setCurrentVendor(interiorVendor.vendorId ?? 1);
    setShowVendorRows(false);
    setOrderItems((prev: any) =>
      prev.map((it: any) =>
        it.itemId === item.itemId
          ? {
              ...it,
              product: productType === "product" ? newProduct : null,
              link: productType === "link" ? newProduct : null,
              productType,
              price: newProduct.defaultPrice,
              cost: newProduct.defaultCost,
              productNameSnapshot: null,
            }
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
        console.log(res.data);
        switch (fieldName) {
          case "notes":
            setNotes(value);
            break;
          case "targetUrl":
            setTargetUrl(value);
            break;
          case "anchorText":
            setAnchorText(value);
            break;
          case "dueDate":
            setOrderItems((prev: any) =>
              prev.map((it: any) =>
                it.itemId === item.itemId
                  ? { ...it, dueDate: res.data.dueDate }
                  : it,
              ),
            );
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
  const handleCreateResponaOrder = async () => {
    setResponaStatus("sending");
    try {
      await axios
        .post("/api/respona/newResponaPlacement", { itemId: item.itemId })
        .then((res: any) => {
          if (!res.data?.updatedItem) return;
          setTimeout(() => {
            setResponaStatus("success");
          }, 2000);
          const updatedItem = res.data.updatedItem;
          console.log(updatedItem);
          setOrderItems((prev: any) =>
            prev.map((it: any) =>
              it.itemId === item.itemId
                ? {
                    ...it,
                    responaItemStatus: updatedItem.responaItemStatus,
                    responaItemId: updatedItem.responaItemId,
                    cost: updatedItem.cost,
                  }
                : it,
            ),
          );
        });
      setTimeout(() => {
        setResponaStatus("");
      }, 3000);
    } catch (error: any) {
      const data = error?.response?.data;
      console.log("Respona placement error:", data);
      setResponaStatus("");
      setResponaErrorMessage(
        data?.message ?? "Failed to create Respona placement",
      );
      setTimeout(() => {
        setResponaErrorMessage("");
      }, 5000);
    }
  };
  const handleRemoveResponaPlacement = async () => {
    setResponaStatus("sending");
    try {
      await axios
        .post("/api/respona/removeResponaPlacement", { itemId: item.itemId })
        .then((res: any) => {
          if (!res.data?.updatedItem) return;
          setTimeout(() => {
            setResponaStatus("success");
          }, 2000);
          const updatedItem = res.data.updatedItem;
          setOrderItems((prev: any) =>
            prev.map((it: any) =>
              it.itemId === item.itemId
                ? {
                    ...it,
                    responaItemStatus: updatedItem.respondaItemStatus,
                    responaItemId: updatedItem.responaItemId,
                  }
                : it,
            ),
          );
        });
      setTimeout(() => {
        setResponaStatus("");
      }, 3000);
    } catch (error: any) {
      const data = error?.response?.data;
      console.log("Respona placement error:", data);
      setResponaStatus("");
      setResponaErrorMessage(
        data?.message ?? "Failed to create Respona placement",
      );
      setTimeout(() => {
        setResponaErrorMessage("");
      }, 5000);
    }
  };

  const handleBulkSelect = () => {
    const bulkLength = bulkSelects.length;
    const currentIndex = item.orderIndex;

    if (isShiftPressed && bulkLength > 0) {
      const differences = bulkSelects.map((item: any) => {
        return {
          difference: Math.abs(item.orderIndex - currentIndex),
          ...item,
        };
      });
      const closestItem = differences.reduce((min: any, item: any) =>
        item.difference < min.difference ? item : min,
      );

      const itemsBetween = orderItems.filter((item: any) => {
        const currentLarger = currentIndex > closestItem.orderIndex;

        return currentLarger
          ? item.orderIndex < currentIndex &&
              item.orderIndex > closestItem.orderIndex
          : item.orderIndex > currentIndex &&
              item.orderIndex < closestItem.orderIndex;
      });

      setBulkSelects((prev: any) => [...prev, ...itemsBetween]);
    }

    if (!isSelected) {
      setBulkSelects((prev: any) => [...prev, item]);
    } else {
      setBulkSelects((prev: any) =>
        prev.filter((it: any) => it.itemId !== item.itemId),
      );
    }
  };

  return showBulk ? (
    <div
      className="order-items-list-item-wrapper"
      ref={!isProduction ? ref : null}
      onContextMenu={handleContextMenu}
    >
      <div
        className={
          isSelected
            ? "order-items-list-item selected-order-item"
            : "order-items-list-item"
        }
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {showMenu && (
          <OrderItemContextMenu
            item={item}
            yPos={yPos}
            xPos={xPos}
            setOrderItems={setOrderItems}
            setBulkSelects={setBulkSelects}
            bulkSelects={bulkSelects}
          />
        )}
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
        <DuePicker
          currentDate={currentDueDate}
          updateDate={persistOrderUpdate}
          isEditable={false}
        />
        <p>
          {currentProductType === "product"
            ? (item.productNameSnapshot ?? item.product?.productName)
            : (item.link?.publication ?? "")}
        </p>
        <p>{currentVendorName}</p>
        {item.product ? (
          <OrderStatusPicker
            currentStatus={status}
            handleUpdateStatus={handleUpdateStatus}
            boundaryRef={boundaryRef}
          />
        ) : (
          <div></div>
        )}
        <p>${cost}</p>
        <p>${price}</p>
        <p>{item.targetUrl}</p>
        <p>{item.anchorText}</p>
        <p>{item.notes}</p>
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
  ) : isDraft ? (
    <div
      className="order-items-list-item-wrapper"
      ref={!isProduction ? ref : null}
    >
      <div
        className={
          isProduction
            ? "order-items-list-item-production"
            : "order-items-list-item"
        }
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
            bulkSelects={bulkSelects}
            setBulkSelects={setBulkSelects}
          />
        )}
        {isProduction && <div className="prod-count">{index + 1}</div>}
        {isProduction && <p>{item.order?.client?.clientName ?? ""}</p>}
        {!hovering ? (
          isProduction ? (
            <a href={`/order/${item.orderId}/false`}>{item.orderId}</a>
          ) : (
            <p className="sheet-item-number">{index + 1}</p>
          )
        ) : currentVendorName && currentVendorName !== "Interior" ? (
          <FaAngleUp
            onClick={() => setShowVendorRows(!showVendorRows)}
            className={
              showVendorRows
                ? "order-item-carat carat-toggled"
                : "order-item-carat"
            }
          />
        ) : isProduction ? (
          <a href={`/order/${item.orderId}/false`}>{item.orderId}</a>
        ) : (
          <p className="sheet-item-number">{index + 1}</p>
        )}
        <DuePicker
          currentDate={currentDueDate}
          updateDate={persistOrderUpdate}
          isEditable={true}
        />
        <ProductPicker
          item={item}
          currentProductType={currentProductType}
          products={products}
          currentProduct={currentProduct}
          handleProductChange={handleProductChange}
          linkList={linkList}
          boundaryRef={boundaryRef}
        />
        <VendorPicker
          currentProduct={currentProduct}
          item={item}
          vendorList={vendorList}
          currentVendor={currentVendor}
          setCurrentVendor={setCurrentVendor}
          boundaryRef={boundaryRef}
        />
        {item.product ? (
          isRespona ? (
            <ResponaStatus
              item={item}
              handleCreateResponaOrder={handleCreateResponaOrder}
              responaErrorMessage={responaErrorMessage}
              setResponaErrorMessage={setResponaErrorMessage}
              responaStatus={responaStatus}
            />
          ) : (
            <OrderStatusPicker
              currentStatus={status}
              handleUpdateStatus={handleUpdateStatus}
              boundaryRef={boundaryRef}
            />
          )
        ) : (
          <div></div>
        )}
        {currentProductType === "product" && currentProduct?.isCostDynamic ? (
          <div className="order-price-input-wrapper">
            <span>$</span>
            <input
              className="order-price-input"
              type="text"
              inputMode="decimal"
              onWheel={(e) => e.currentTarget.blur()}
              value={costDraft ?? formatMoneyInput(Number(cost ?? 0))}
              onFocus={() => setCostDraft(formatMoneyInput(Number(cost ?? 0)))}
              onChange={(e) => {
                const cleaned = sanitizeNumericInput(e.target.value);
                if (cleaned === null) return;
                setCostDraft(cleaned);
              }}
              onBlur={() => {
                const n = parseNumericInput(costDraft ?? String(cost ?? ""));
                setCostDraft(null);
                handleCostChange?.(item.itemId, n);
                persistOrderUpdate("cost", n);
              }}
            />
          </div>
        ) : (
          <p>${cost}</p>
        )}
        <div className="order-price-input-wrapper">
          <span>$</span>
          <input
            className="order-price-input"
            type="text"
            inputMode="decimal"
            onWheel={(e) => e.currentTarget.blur()}
            value={priceDraft ?? formatMoneyInput(Number(price ?? 0))}
            onFocus={() => setPriceDraft(formatMoneyInput(Number(price ?? 0)))}
            onChange={(e) => {
              const cleaned = sanitizeNumericInput(e.target.value);
              if (cleaned === null) return;
              setPriceDraft(cleaned);
            }}
            onBlur={() => {
              const n = parseNumericInput(priceDraft ?? String(price ?? ""));
              setPriceDraft(null);
              onPriceChange?.(item.itemId, n);
              persistOrderUpdate("price", n);
            }}
          />
        </div>
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
          value={publisherUrl}
          onChange={(e) => {
            setPublisherUrl(e.target.value);
            handleOrderItemUpdate?.("linkingTo", item.itemId, e.target.value);
          }}
          onBlur={() => persistOrderUpdate("linkingTo", publisherUrl)}
        />
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
    <div
      className="order-items-list-item-wrapper"
      ref={!isProduction ? ref : null}
    >
      <div
        className={
          isProduction
            ? "order-items-list-item-production"
            : "order-items-list-item"
        }
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onContextMenu={handleContextMenu}
      >
        {showMenu && (
          <OrderItemContextMenu
            item={item}
            yPos={yPos}
            xPos={xPos}
            bulkSelects={bulkSelects}
            setOrderItems={setOrderItems}
            setBulkSelects={setBulkSelects}
            handleRemoveResponaPlacement={handleRemoveResponaPlacement}
            isRespona={isRespona}
          />
        )}
        {isProduction && <div className="prod-count">{index + 1}</div>}
        {isProduction && <p>{item.order?.client?.clientName ?? ""}</p>}
        {!hovering ? (
          isProduction ? (
            <a href={`/order/${item.orderId}/false`}>{item.orderId}</a>
          ) : (
            <p className="sheet-item-number">{index + 1}</p>
          )
        ) : currentVendorName && currentVendorName !== "Interior" ? (
          <FaAngleUp
            onClick={() => setShowVendorRows(!showVendorRows)}
            className={
              showVendorRows
                ? "order-item-carat carat-toggled"
                : "order-item-carat"
            }
          />
        ) : isProduction ? (
          <a href={`/order/${item.orderId}/false`}>{item.orderId}</a>
        ) : (
          <p className="sheet-item-number">{index + 1}</p>
        )}
        <DuePicker
          currentDate={currentDueDate}
          updateDate={persistOrderUpdate}
          isEditable={false}
        />
        <div className="order-item-p-wrapper">
          <p>
            {currentProductType === "product"
              ? (item.productNameSnapshot ?? item.product?.productName)
              : (item.link?.publication ?? "")}
          </p>
        </div>
        <div className="order-item-p-wrapper">
          <p className={isRespona ? "respona-p" : ""}>{currentVendorName}</p>
        </div>
        {item.product ? (
          isRespona ? (
            <ResponaStatus
              item={item}
              handleCreateResponaOrder={handleCreateResponaOrder}
              responaErrorMessage={responaErrorMessage}
              setResponaErrorMessage={setResponaErrorMessage}
              responaStatus={responaStatus}
            />
          ) : (
            <OrderStatusPicker
              currentStatus={status}
              handleUpdateStatus={handleUpdateStatus}
              boundaryRef={boundaryRef}
            />
          )
        ) : (
          <div></div>
        )}
        <p>${cost}</p>
        <p>${price}</p>
        <a href={item.targetUrl} target="_blank" className="order-item-p">
          {item.targetUrl}
        </a>
        <p className="order-item-p">{item.anchorText}</p>
        <div className="order-item-p">
          <p>{item.notes}</p>
        </div>
        <a href={item.linkingTo} target="_blank" className="order-item-p">
          {item.linkingTo}
        </a>
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
