import { formatDollar } from "../../helpers";

interface props {
  item: any;
  productList: any;
}

const SheetOrderItem = ({ item, productList }: props) => {
  const product = productList.find(
    (product: any) => product.productId === item.productId,
  );

  const price =
    item.priceSnapshot ??
    item.defaultPriceSnapshot ??
    item.link?.defaultPrice ??
    item.price ??
    product?.defaultPrice ??
    0;
  const quantity = item.deliveries?.length ?? 0;
  const cost = item.costSnapshot ?? product?.cost ?? item.link?.cost ?? 0;
  const totalPrice = quantity * price;
  const totalCost = quantity * cost;
  const contribution = totalPrice - totalCost;
  const commissionRate =
    product?.user_product_commissions?.length > 0
      ? (item.commissionRateSnapshot ??
        product.user_product_commissions[0].commissionRate)
      : !item.link
        ? (item.commissionRateSnapshot ?? product?.commissionRate)
        : item.link?.commissionRate;
  const commission =
    contribution * commissionRate <= 0 ? 0 : contribution * commissionRate;
  const spiff = item.spiffSnapshot ?? product?.spiff ?? 0;
  const bonus = quantity * spiff;
  const total = commission + bonus;

  return (
    <div className="sheet-list-order-item">
      <p>
        {item.productNameSnapshot ??
          product?.productName ??
          item.link?.publication ??
          ""}
      </p>
      <p>{quantity}</p>
      <p>{formatDollar(totalPrice)}</p>
      <p>{formatDollar(totalCost)}</p>
      <p>{formatDollar(contribution)}</p>
      <p>{formatDollar(commission)}</p>
      <p>{formatDollar(bonus)}</p>
      <p>{formatDollar(total)}</p>
    </div>
  );
};
export default SheetOrderItem;
