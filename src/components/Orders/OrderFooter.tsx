import { formatDollarNoCents } from "../../helpers";

interface props {
  items: any;
}

const OrderFooter = ({ items }: props) => {
  const filteredItems = items.filter((item: any) => item.product);
  const grandTotal: number = filteredItems.reduce(
    (acc: number, item: any) => acc + item.quantity * item.price,
    0,
  );

  return (
    <div className="order-sheet-footer">
      <div className="order-items-list-item order-items-list-head">
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p>Total</p>
      </div>
      <div className="order-items-list-item">
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p>{formatDollarNoCents(grandTotal)}</p>
      </div>
    </div>
  );
};
export default OrderFooter;
