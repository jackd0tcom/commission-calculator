import { formatDollar } from "../../helpers";

interface props {
  item: any;
  productList: any;
  userId: number;
}

const SheetOrderItem = ({ item, productList, userId }: props) => {
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
  const defaultPrice =
    item.defaultPriceSnapshot ??
    item.link?.defaultPrice ??
    product?.defaultPrice ??
    0;
  const quantity = item.deliveries?.length ?? 0;
  const cost =
    item.costSnapshot ?? product?.defaultCost ?? item.link?.cost ?? 0;
  const totalPrice = quantity * price;
  const totalCost = quantity * cost;
  const contribution = totalPrice - totalCost;
  const userProductCommission = product?.user_product_commissions?.find(
    (rate: any) => rate.userId === userId,
  );
  const commissionRate = userProductCommission
    ? (item.commissionRateSnapshot ?? userProductCommission.commissionRate)
    : !item.link
      ? (item.commissionRateSnapshot ?? product?.commissionRate)
      : item.link?.commissionRate;
  const commission =
    contribution * commissionRate <= 0 ? 0 : contribution * commissionRate;
  const spiff = item.spiffSnapshot ?? 0;
  const bonus = Number(price) >= Number(defaultPrice) ? spiff : 0;
  const total = Number(commission) + Number(bonus);

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
