import { formatDollarNoCents } from "../helpers";

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
      item.price ??
      product.defaultPrice;
    return acc + itemPrice * item.quantity;
  }, 0);
  const cost: number = filteredItems.reduce((acc: number, item: any) => {
    const product = products.find(
      (product: any) => product.productId === item.productId,
    );

    const cost = item.costSnapshot ?? product?.cost;
    return acc + cost * item.quantity;
  }, 0);
  const contribution: number = filteredItems.reduce(
    (acc: number, item: any) => {
      const product = products.find(
        (product: any) => product.productId === item.productId,
      );
      const totalPrice =
        item.quantity *
        (item.priceSnapshot ??
          item.defaultPriceSnapshot ??
          item.price ??
          product.defaultPrice);
      const totalCost = item.quantity * (item.costSnapshot ?? product?.cost);
      return acc + totalPrice - totalCost;
    },
    0,
  );
  const commission: number = filteredItems.reduce((acc: number, item: any) => {
    // const price = item?.price ? item.price : item.product?.defaultPrice;
    // const itemContribution = (price - item.product.cost) * item.quantity;
    const product = products.find(
      (product: any) => product.productId === item.productId,
    );
    const totalPrice =
      item.quantity *
      (item.priceSnapshot ??
        item.defaultPriceSnapshot ??
        item.price ??
        product.defaultPrice);
    const totalCost = item.quantity * (item.costSnapshot ?? product?.cost);
    const rate = item.commissionRateSnapshot ?? product.commissionRate;
    const contribution = totalPrice - totalCost;
    return acc + contribution * rate;
  }, 0);
  const bonus: number = filteredItems.reduce((acc: number, item: any) => {
    const product = products.find(
      (product: any) => product.productId === item.productId,
    );
    return acc + (item.spiffSnapshot ?? product.spiff) * item.quantity;
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
        <p className="delete-placeholder"></p>
      </div>
      <div className="sheet-item">
        <p></p>
        <p></p>
        <p>{formatDollarNoCents(price)}</p>
        <p>{formatDollarNoCents(cost)}</p>
        <p>{formatDollarNoCents(contribution)}</p>
        <p>{formatDollarNoCents(commission)}</p>
        <p>{formatDollarNoCents(bonus)}</p>
        <p>{formatDollarNoCents(grandTotal)}</p>
        <p className="delete-placeholder"></p>
      </div>
    </div>
  );
};
export default CommissionSheetFooter;
