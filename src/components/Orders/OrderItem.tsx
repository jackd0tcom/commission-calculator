import { useState } from "react";
import ProductPicker from "../CommissionSheet/ProductPicker";
import OrderStatusPicker from "./OrderStatusPicker";
import axios from "axios";
import { formatDollarNoCents } from "../../helpers";
import { TiDelete } from "react-icons/ti";

interface props {
  item: any;
  index: number;
  setOrderItems: any;
  products: any;
  onQuantityChange: any;
  onPriceChange: any;
  orderStatus: string;
}

const OrderItem = ({
  item,
  index,
  setOrderItems,
  products,
  onQuantityChange,
  onPriceChange,
  orderStatus,
}: props) => {
  const [currentProduct, setCurrentProduct] = useState(
    item?.product ? item?.product : null,
  );
  const [quantity, setQuantity] = useState(item.quantity ? item.quantity : 0);
  const [status, setStatus] = useState(item.itemStatus ?? "");
  const [price, setPrice] = useState(
    item.price
      ? item.price
      : currentProduct?.defaultPrice
        ? currentProduct.defaultPrice
        : 0,
  );

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
    const newStatus = status === "in progress" ? "delivered" : "in progress";
    try {
      await axios
        .post("/api/updateOrderItem", {
          itemId: item.itemId,
          fieldName: "itemStatus",
          value: newStatus,
        })
        .then((res) => {
          if (res.status === 200) {
            setStatus(newStatus);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return orderStatus === "in progress" ? (
    <div className="order-items-list-item">
      <p className="sheet-item-number">{index + 1}</p>
      <ProductPicker
        item={item}
        products={products}
        currentProduct={currentProduct}
        handleProductChange={handleProductChange}
      />
      <input
        className="quantity-input"
        type="number"
        value={quantity}
        onChange={(e) => {
          const val = Number(e.target.value);
          if (val < 0) {
            return;
          }
          setQuantity(val);
          onQuantityChange?.(item.itemId, val);
        }}
        onBlur={() => persistQuantityChange(quantity)}
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
      <p>{formatDollarNoCents(quantity * price)}</p>
      <TiDelete
        className="sheet-item-delete"
        onClick={() => handleDeleteItem()}
      />
    </div>
  ) : (
    <div className="order-items-list-item">
      <p className="sheet-item-number">{index + 1}</p>
      <p>{item.productNameSnapshot}</p>
      <p>{quantity}</p>
      <p>${item.priceSnapshot}</p>
      <p>{item.itemStatus}</p>
      <p>{formatDollarNoCents(quantity * price)}</p>
      <p className="delete-placeholder"></p>
    </div>
  );
};
export default OrderItem;
