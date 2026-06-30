import { formatDollar, getGPclass } from "../../helpers";

interface props {
  items: any;
  products: any;
  filter: any;
  userId: number;
}

const CommissionSheetFooter = ({ items, products, filter, userId }: props) => {
  let filteredItems = items.flatMap((item: any) => item.order_items ?? []);
  // const quantity: number = filteredItems.reduce(
  //   (acc: number, item: any) => acc + item.quantity,
  //   0,
  // );
  if (filter.sort === "gp" || filter.sort === "commission") {
    filteredItems = items;
  }

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
    return acc + itemPrice * (item.deliveries?.length ?? 0);
  }, 0);
  const cost: number = filteredItems.reduce((acc: number, item: any) => {
    const product = products.find(
      (product: any) => product.productId === item.productId,
    );

    const cost =
      item.costSnapshot ?? product?.defaultCost ?? item.link?.cost ?? 0;
    return acc + cost * (item.deliveries?.length ?? 0);
  }, 0);
  const contribution: number = filteredItems.reduce(
    (acc: number, item: any) => {
      const product = products.find(
        (product: any) => product.productId === item.productId,
      );
      const totalPrice =
        (item.deliveries?.length ?? 0) *
        (item.priceSnapshot ??
          item.defaultPriceSnapshot ??
          item.link?.defaultPrice ??
          item.price ??
          product?.defaultPrice ??
          0);
      const totalCost =
        (item.deliveries?.length ?? 0) *
        (item.costSnapshot ?? product?.defaultCost ?? item.link?.cost);
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
      (item.deliveries?.length ?? 0) *
      (item.priceSnapshot ??
        item.defaultPriceSnapshot ??
        item.link?.defaultPrice ??
        item.price ??
        product?.defaultPrice ??
        0);
    const totalCost =
      (item.deliveries?.length ?? 0) *
      (item.costSnapshot ?? product?.defaultCost ?? item.link?.cost ?? 0);
    const userProductCommission = product?.user_product_commissions?.find(
      (rate: any) => rate.userId === userId,
    );
    const rate = userProductCommission
      ? (item.commissionRateSnapshot ?? userProductCommission.commissionRate)
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
    const defaultPrice =
      item.defaultPriceSnapshot ??
      item.link?.defaultPrice ??
      product?.defaultPrice ??
      0;
    const price =
      item.priceSnapshot ??
      item.defaultPriceSnapshot ??
      item.link?.defaultPrice ??
      item.price ??
      product?.defaultPrice ??
      0;
    const spiff = item.spiffSnapshot ?? product?.spiff ?? 0;
    return acc + (Number(price) >= Number(defaultPrice) ? Number(spiff) : 0);
  }, 0);
  const grandTotal: number = commission + bonus;
  const GPPercentage: number =
    price > 0 ? Math.floor((contribution / price) * 100) : 0;

  return (
    <div className="commission-sheet-footer">
      <div className="sheet-item sheet-items-list-head">
        <p></p>
        <p></p>
        <p>Price</p>
        <p>Cost</p>
        <p>GP</p>
        <p>Commission</p>
        <p>Bonus</p>
        <p>Total</p>
      </div>
      <div className="sheet-item">
        <p></p>
        <p></p>
        <p>{formatDollar(price)}</p>
        <p>{formatDollar(cost)}</p>
        <div className="gp-wrapper">
          {formatDollar(contribution)}{" "}
          <span className={`gp-percentage ${getGPclass(GPPercentage)}`}>
            {GPPercentage}%
          </span>
        </div>
        <p>{formatDollar(commission)}</p>
        <p>{formatDollar(bonus)}</p>
        <p>{formatDollar(grandTotal)}</p>
      </div>
    </div>
  );
};
export default CommissionSheetFooter;
