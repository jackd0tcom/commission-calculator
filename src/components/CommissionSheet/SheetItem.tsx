import ClientPicker from "./ClientPicker";
import ProductPicker from "./ProductPicker";
import { formatDollar } from "../../helpers";

const SheetItem = ({ clientList, item, productList }) => {
  const totalCommission =
    item.product.commissionRate * item.price * item.quantity;
  const bonus = item.product.spiff * item.quantity;
  const contribution = (item.price - item.product.cost) * item.quantity;

  return (
    <div className="sheet-item">
      <ClientPicker clients={clientList} currentClient={item.clientId} />
      <ProductPicker products={productList} currentProduct={item.productId} />
      {/* TODO make quantity input */}
      <p>{item.quantity}</p>
      {/* TODO Make price a input */}
      <p>${item.price}</p>
      <p>${item.product.cost}</p>
      <p>{formatDollar(contribution)}</p>
      <p>{formatDollar(totalCommission)}</p>
      <p>{formatDollar(bonus)}</p>
      <p>{formatDollar(totalCommission + bonus)}</p>
    </div>
  );
};
export default SheetItem;
