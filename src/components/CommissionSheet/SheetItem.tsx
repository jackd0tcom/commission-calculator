import ClientPicker from "./ClientPicker";
import ProductPicker from "./ProductPicker";
import { formatDollar } from "../../helpers";
import { useState } from "react";
import axios from "axios";

interface SheetItemProps {
  index: number;
  clientList: any[];
  item: any;
  productList: any[];
  onQuantityChange?: (itemId: number, quantity: number) => void;
  onPriceChange?: (itemId: number, price: number) => void;
}

const SheetItem = ({
  index,
  clientList,
  item,
  productList,
  onQuantityChange,
  onPriceChange,
}: SheetItemProps) => {
  const [quantity, setQuantity] = useState(item.quantity ? item.quantity : 0);
  const [price, setPrice] = useState(item.price ? item.price : 0);
  const totalCommission = item.product.commissionRate * price * quantity;
  const bonus = item.product.spiff * quantity;
  const contribution = (price - item.product.cost) * quantity;

  const persistQuantityChange = async (newQuantity: number) => {
    try {
      const res = await axios.post("/api/updateSheetItem", {
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
      const res = await axios.post("/api/updateSheetItem", {
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

  return (
    <div className="sheet-item">
      <p className="sheet-item-number">{index + 1}</p>
      <ClientPicker
        item={item}
        clients={clientList}
        currentClient={item.clientId}
      />
      <ProductPicker
        item={item}
        products={productList}
        currentProduct={item.productId}
      />
      <input
        className="quantity-input"
        type="number"
        value={quantity}
        onChange={(e) => {
          const val = Number(e.target.value);
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
      <p>${item.product.cost}</p>
      <p>{formatDollar(contribution)}</p>
      <p>{formatDollar(totalCommission)}</p>
      <p>{formatDollar(bonus)}</p>
      <p>{formatDollar(totalCommission + bonus)}</p>
    </div>
  );
};
export default SheetItem;
