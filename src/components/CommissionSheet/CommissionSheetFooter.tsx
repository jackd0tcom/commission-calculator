import { formatDollar } from "../../helpers";

interface props {
  items: any;
  products: any;
}

const CommissionSheetFooter = ({ items, products }: props) => {
  const filteredItems = items.flatMap((item: any) => item.order_items ?? []);
  // const quantity: number = filteredItems.reduce(
  //   (acc: number, item: any) => acc + item.quantity,
  //   0,
  // );

  const price: number = filteredItems.reduce((acc: number, item: any) => {
    const product = products.find(
      (product: any) => product.productId === item.productId,
    );
    const itemPrice =
      item.priceSnapshot ??
      item.defaultPriceSnapshot ??
      item.link?.defaultPrice ??
      item.price ??
      product?.defaultPrice ??
      0;
    return acc + itemPrice * item.deliveries?.length;
  }, 0);
  const cost: number = filteredItems.reduce((acc: number, item: any) => {
    const product = products.find(
      (product: any) => product.productId === item.productId,
    );

    const cost = item.costSnapshot ?? product?.cost ?? item.link?.cost;
    return acc + cost * item.deliveries?.length;
  }, 0);
  const contribution: number = filteredItems.reduce(
    (acc: number, item: any) => {
      const product = products.find(
        (product: any) => product.productId === item.productId,
      );
      const totalPrice =
        item.deliveries?.length *
        (item.priceSnapshot ??
          item.defaultPriceSnapshot ??
          item.link?.defaultPrice ??
          item.price ??
          product?.defaultPrice ??
          0);
      const totalCost =
        item.deliveries?.length *
        (item.costSnapshot ?? product?.cost ?? item.link?.cost);
      return acc + totalPrice - totalCost;
    },
    0,
  );
  const commission: number = filteredItems.reduce((acc: number, item: any) => {
    // const price = item?.price ? item.price : item.product?.defaultPrice;
    // const itemContribution = (price - item.product.cost) * item.deliveries?.length;
    const product = products.find(
      (product: any) => product.productId === item.productId,
    );
    const totalPrice =
      item.deliveries?.length *
      (item.priceSnapshot ??
        item.defaultPriceSnapshot ??
        item.link?.defaultPrice ??
        item.price ??
        product?.defaultPrice ??
        0);
    const totalCost =
      item.deliveries?.length *
      (item.costSnapshot ?? product?.cost ?? item.link?.cost);
    const rate =
      product?.user_product_commissions?.length > 0
        ? (item.commissionRateSnapshot ??
          product.user_product_commissions[0].commissionRate)
        : !item.link
          ? (item.commissionRateSnapshot ?? product?.commissionRate)
          : item.link?.commissionRate;

    const contribution = totalPrice - totalCost;
    if (contribution <= 0) {
      return acc + 0;
    }
    return acc + contribution * rate;
  }, 0);
  const bonus: number = filteredItems.reduce((acc: number, item: any) => {
    const product = products.find(
      (product: any) => product.productId === item.productId,
    );
    return (
      acc +
      (item.spiffSnapshot ?? product?.spiff ?? 0) * item.deliveries?.length
    );
  }, 0);
  const grandTotal: number = commission + bonus;

  return (
    <div className="commission-sheet-footer">
      <div className="sheet-item sheet-items-list-head">
        <p></p>
        <p></p>
        <p>Price</p>
        <p>Cost</p>
        <p>Contribution</p>
        <p>Commission</p>
        <p>Bonus</p>
        <p>Total</p>
      </div>
      <div className="sheet-item">
        <p></p>
        <p></p>
        <p>{formatDollar(price)}</p>
        <p>{formatDollar(cost)}</p>
        <p>{formatDollar(contribution)}</p>
        <p>{formatDollar(commission)}</p>
        <p>{formatDollar(bonus)}</p>
        <p>{formatDollar(grandTotal)}</p>
      </div>
    </div>
  );
};
export default CommissionSheetFooter;
