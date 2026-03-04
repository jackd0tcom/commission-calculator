import { formatDollarNoCents } from "../helpers";

interface props {
  items: any;
}

const CommissionSheetFooter = ({ items }: props) => {
  const filteredItems = items.filter((item: any) => item.product);
  const quantity: number = filteredItems.reduce(
    (acc: number, item: any) => acc + item.quantity,
    0,
  );
  const price: number = filteredItems.reduce(
    (acc: number, item: any) => acc + item.price * item.quantity,
    0,
  );
  const cost: number = filteredItems.reduce(
    (acc: number, item: any) => acc + item.product.cost * item.quantity,
    0,
  );
  const contribution: number = filteredItems.reduce(
    (acc: number, item: any) => {
      const price = item?.price
        ? item.price
        : (item.product?.defaultPrice ?? 0);
      return acc + (price - item.product.cost) * item.quantity;
    },
    0,
  );
  const commission: number = filteredItems.reduce((acc: number, item: any) => {
    const price = item?.price ? item.price : item.product?.defaultPrice;
    const itemContribution = (price - item.product.cost) * item.quantity;
    return acc + item.product.commissionRate * itemContribution;
  }, 0);
  const bonus: number = filteredItems.reduce(
    (acc: number, item: any) => acc + item.product.spiff * item.quantity,
    0,
  );
  const grandTotal: number = commission + bonus;

  return (
    <div className="commission-sheet-footer">
      <div className="sheet-item sheet-items-list-head">
        <p></p>
        <p></p>
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
