import { formatDollarNoCents } from "../../helpers";

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
    item.price ??
    product.defaultPrice;
  const quantity = item.deliveries?.length ?? 0;
  const cost = item.costSnapshot ?? product?.cost ?? item.link?.cost;
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
  const commission = contribution * commissionRate;
  const spiff = item.spiffSnapshot ?? product?.spiff ?? 0;
  const bonus = quantity * spiff;
  const total = commission + bonus;

  return (
    <div className="sheet-list-order-item">
      <p>{item.productNameSnapshot ?? product?.productName}</p>
      <p>{quantity}</p>
      <p>{formatDollarNoCents(totalPrice)}</p>
      <p>{formatDollarNoCents(totalCost)}</p>
      <p>{formatDollarNoCents(contribution)}</p>
      <p>{formatDollarNoCents(commission)}</p>
      <p>{formatDollarNoCents(bonus)}</p>
      <p>{formatDollarNoCents(total)}</p>
    </div>
  );
};
export default SheetOrderItem;
