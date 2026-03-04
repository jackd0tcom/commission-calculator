import ClientPicker from "./ClientPicker";
import ProductPicker from "./ProductPicker";
import { formatDollarNoCents } from "../../helpers";
import { useState } from "react";
import axios from "axios";
import { TiDelete } from "react-icons/ti";

interface SheetItemProps {
  index: number;
  clientList: any[];
  item: any;
  productList: any[];
  setSheetItems: any;
  onQuantityChange?: (itemId: number, quantity: number) => void;
  onPriceChange?: (itemId: number, price: number) => void;
  isDraft: boolean;
}

const SheetItem = ({
  index,
  clientList,
  item,
  productList,
  setSheetItems,
  onQuantityChange,
  onPriceChange,
  isDraft,
}: SheetItemProps) => {
  const [currentProduct, setCurrentProduct] = useState(
    item.product ? item.product : null,
  );
  const [quantity, setQuantity] = useState(item.quantity ? item.quantity : 0);
  const [price, setPrice] = useState(
    item.price
      ? item.price
      : currentProduct?.defaultPrice
        ? currentProduct.defaultPrice
        : 0,
  );
  const commissionRate = currentProduct ? currentProduct.commissionRate : 0;
  const spiff = currentProduct ? currentProduct.spiff : 0;
  const cost = currentProduct ? currentProduct.cost * item.quantity : 0;
  const isSpiff = price >= item?.product?.defaultPrice;
  const bonus = isSpiff ? spiff * quantity : 0;
  const contribution = (price - item?.product?.cost) * quantity;
  const totalCommission = commissionRate * contribution;

  const handleProductChange = async (newProduct: any) => {
    setCurrentProduct(newProduct);
    setPrice(newProduct.defaultPrice);
    setSheetItems((prev: any) =>
      prev.map((it: any) =>
        it.itemId === item.itemId
          ? { ...it, product: newProduct, price: newProduct.defaultPrice }
          : it,
      ),
    );
  };

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
        console.log(res.data);
        setPrice(newPrice);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteItem = async () => {
    try {
      await axios
        .post("/api/deleteSheetItem", { itemId: item.itemId })
        .then((res) => {
          if (res.status === 200) {
            setSheetItems((prev: any) =>
              prev.filter((sheetItem: any) => sheetItem.itemId !== item.itemId),
            );
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return isDraft ? (
    <div className="sheet-item">
      <p className="sheet-item-number">{index + 1}</p>
      <ClientPicker
        item={item}
        clients={clientList}
        currentClient={item.client}
      />
      <ProductPicker
        item={item}
        products={productList}
        currentProduct={item.productId}
        handleProductChange={handleProductChange}
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
      <p>{formatDollarNoCents(cost)}</p>
      <p>{formatDollarNoCents(contribution)}</p>
      <p>{formatDollarNoCents(totalCommission)}</p>
      <p>{formatDollarNoCents(bonus)}</p>
      <p>{formatDollarNoCents(totalCommission + bonus)}</p>
      <TiDelete
        className="sheet-item-delete"
        onClick={() => handleDeleteItem()}
      />
    </div>
  ) : (
    <div className="sheet-item">
      <p className="sheet-item-number">{index + 1}</p>
      <p>{item.client?.clientName}</p>
      <p>{item.product?.productName}</p>
      <p>{quantity}</p>
      <p>${price}</p>
      <p>{formatDollarNoCents(cost)}</p>
      <p>{formatDollarNoCents(contribution)}</p>
      <p>{formatDollarNoCents(totalCommission)}</p>
      <p>{formatDollarNoCents(bonus)}</p>
      <p>{formatDollarNoCents(totalCommission + bonus)}</p>
      <p className="delete-placeholder"></p>
    </div>
  );
};
export default SheetItem;
