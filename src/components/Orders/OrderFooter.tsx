import { formatDollarNoCents, getGPclass } from "../../helpers";

interface props {
  items: any;
}

const OrderFooter = ({ items }: props) => {
  const filteredItems = items.filter((item: any) => item.product || item.link);
  const totalCost: number = filteredItems.reduce((acc: number, item: any) => {
    const cost =
      item.costSnapshot ??
      item.cost ??
      item.product?.defaultCost ??
      item.link?.cost;

    0;
    return acc + Number(cost);
  }, 0);
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

  const GP: number = grandTotal - totalCost;
  const GPPercentage: number =
    grandTotal > 0 ? Math.floor((GP / grandTotal) * 100) : 0;

  return (
    <div className="order-sheet-stats">
      <div className="order-footer-wrapper">
        <div className="order-footer-items">
          <p>Total Cost</p>
          <p>Delivered</p>
          <p>Total Invoice</p>
          <p>Gross Profit</p>
        </div>
      </div>
      <div className="order-footer-wrapper">
        <div className="order-footer-items">
          <p>{formatDollarNoCents(totalCost)}</p>
          <p>
            {totalDeliveries.length} / {filteredItems.length}
          </p>
          <p>{formatDollarNoCents(grandTotal)}</p>
          <div className="gp-wrapper">
            {formatDollarNoCents(GP)}{" "}
            <span className={`gp-percentage ${getGPclass(GPPercentage)}`}>
              {GPPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderFooter;
