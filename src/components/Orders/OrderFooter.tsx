import { formatDollarNoCents } from "../../helpers";

interface props {
  items: any;
}

const OrderFooter = ({ items }: props) => {
  const filteredItems = items.filter((item: any) => item.product || item.link);
  const grandTotal: number = filteredItems.reduce((acc: number, item: any) => {
    const price =
      item.priceSnapshot ??
      item.price ??
      item.product?.defaultPrice ??
      item.link?.price ??
      0;
    return acc + Number(price);
  }, 0);
  const totalDeliveries = filteredItems.filter((item: any) => {
    return item.itemStatus === "complete";
  });

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
          {totalDeliveries.length} / {filteredItems.length}
        </p>
        <p>{formatDollarNoCents(grandTotal)}</p>
      </div>
    </div>
  );
};
export default OrderFooter;
