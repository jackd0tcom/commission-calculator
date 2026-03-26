import { formatDollarNoCents } from "../../helpers";

interface props {
  items: any;
}

const OrderFooter = ({ items }: props) => {
  const filteredItems = items.filter((item: any) => item.product);
  const grandTotal: number = filteredItems.reduce((acc: number, item: any) => {
    const quantity = item.quantity ?? 0;
    const price =
      item.priceSnapshot ?? item.price ?? item.product.defaultPrice ?? 0;
    return acc + quantity * price;
  }, 0);
  const totalQuantity: number = filteredItems.reduce(
    (acc: number, item: any) => {
      const quantity = item.quantity ?? 0;
      return acc + quantity;
    },
    0,
  );
  const totalDeliveries: number = filteredItems.reduce(
    (acc: number, item: any) => {
      return acc + item.deliveries?.length;
    },
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
        <p>Deliveries</p>
        <p>Total</p>
      </div>
      <div className="order-items-list-item">
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p>
          {totalDeliveries} / {totalQuantity}
        </p>
        <p>{formatDollarNoCents(grandTotal)}</p>
      </div>
    </div>
  );
};
export default OrderFooter;
