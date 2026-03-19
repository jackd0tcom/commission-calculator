import { useState } from "react";
import ProductPicker from "../CommissionSheet/ProductPicker";
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
  const userCommissionRate = currentProduct?.user_product_commissions
    ? (currentProduct?.user_product_commissions[0].commissionRate ?? 0)
    : null;
  const [price, setPrice] = useState(
    item.price
      ? item.price
      : currentProduct?.defaultPrice
        ? currentProduct.defaultPrice
        : 0,
  );
  // if there is no product selected, i.e. when a new item is added, it is 0, else if there is not a userproductCommission item, it is the default commission, else if there is a userproductcommission rate then it is that
  const commissionRate = currentProduct
    ? (userCommissionRate ?? currentProduct?.commissionRate)
    : 0;
  const spiff = currentProduct ? currentProduct.spiff : 0;
  let cost = currentProduct ? currentProduct.cost * item.quantity : 0;
  const isSpiff = price >= item?.product?.defaultPrice;
  let bonus = isSpiff ? spiff * quantity : 0;
  let contribution = (price - (item?.product?.cost ?? 0)) * quantity;
  let totalCommission = commissionRate * contribution;

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
    <div className="order-items-list-item">
      <p className="sheet-item-number">{index + 1}</p>
      <p>{item.clientNameSnapshot}</p>
      <p>{item.productNameSnapshot}</p>
      <p>{quantity}</p>
      <p>${item.priceSnapshot}</p>
      <p>{formatDollarNoCents(item.costSnapshot)}</p>
      <p>{formatDollarNoCents(contribution)}</p>
      <p>{formatDollarNoCents(totalCommission)}</p>
      <p>{formatDollarNoCents(bonus)}</p>
      <p>{formatDollarNoCents(totalCommission + bonus)}</p>
      <p className="delete-placeholder"></p>
    </div>
  );
};
export default OrderItem;
