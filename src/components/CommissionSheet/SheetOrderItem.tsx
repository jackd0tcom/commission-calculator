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
  const cost = item.costSnapshot ?? product?.cost;
  const totalPrice = item.quantity * price;
  const totalCost = item.quantity * cost;
  const contribution = totalPrice - totalCost;
  const commissionRate = item.commissionRateSnapshot ?? product.commissionRate;
  const commission = contribution * commissionRate;
  const spiff = item.spiffSnapshot ?? product.spiff;
  const bonus = item.quantity * spiff;
  const total = commission + bonus;

  return (
    <div className="sheet-list-order-item">
      <p>{item.productNameSnapshot ?? product?.productName}</p>
      <p>{item.quantity}</p>
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
