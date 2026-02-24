import { formatDollar } from "../helpers";

const CommissionSheetFooter = ({ items }) => {
  const quantity: number = items.reduce((acc, item) => acc + item.quantity, 0);
  const price: number = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const cost: number = items.reduce(
    (acc, item) => acc + item.product.cost * item.quantity,
    0,
  );
  const commission: number = items.reduce(
    (acc, item) =>
      acc + item.product.commissionRate * item.price * item.quantity,
    0,
  );
  const contribution: number = items.reduce(
    (acc, item) => acc + (item.price - item.product.cost) * item.quantity,
    0,
  );
  const bonus: number = items.reduce(
    (acc, item) => acc + item.product.spiff * item.quantity,
    0,
  );
  const grandTotal: number = commission + bonus;

  return (
    <div className="sheet-item commission-sheet-footer">
      <p></p>
      <p></p>
      <p></p>
      <p>{quantity}</p>
      <p>{formatDollar(price)}</p>
      <p>{formatDollar(cost)}</p>
      <p>{formatDollar(contribution)}</p>
      <p>{formatDollar(commission)}</p>
      <p>{formatDollar(bonus)}</p>
      <p>{formatDollar(grandTotal)}</p>
    </div>
  );
};
export default CommissionSheetFooter;
