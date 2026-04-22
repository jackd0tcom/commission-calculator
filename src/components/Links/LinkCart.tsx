import { FaShoppingCart } from "react-icons/fa";
import { formatDollarNoCents } from "../../helpers";
import { FaX } from "react-icons/fa6";

interface props {
  showCart: any;
  setShowCart: any;
  cart: any;
  setCart: any;
}

const LinkCart = ({ showCart, setShowCart, cart, setCart }: props) => {
  const total =
    cart?.length > 0
      ? cart.reduce((acc: any, item: any) => {
          return acc + item.defaultPrice * item.quantity;
        }, 0)
      : 0;

  const totalItems =
    cart?.length > 0
      ? cart.reduce((acc: any, item: any) => {
          return acc + Number(item.quantity);
        }, 0)
      : 0;

  return !showCart ? (
    <div className="link-cart-icon-wrapper" onClick={() => setShowCart(true)}>
      <FaShoppingCart />
      <div className="cart-count">{Number(totalItems)}</div>
    </div>
  ) : (
    <div className="link-cart-overlay">
      <div className="link-cart-wrapper">
        <div className="link-cart-top">
          <div className="link-cart-header">
            <h2>Your Cart</h2>
            <FaX onClick={() => setShowCart(false)} className="close-cart" />
          </div>
          <div className="link-cart-items">
            {cart?.length > 0 ? (
              cart?.map((link: any) => {
                if (!link.linkId) {
                  return;
                }
                return (
                  <div className="link-cart-item">
                    <div className="link-cart-details">
                      <p>{link.publication}</p>
                      <p>{formatDollarNoCents(link.defaultPrice)}</p>
                      <p
                        onClick={() =>
                          setCart((prev: any) => {
                            return prev.filter(
                              (item: any) => item.linkId !== link.linkId,
                            );
                          })
                        }
                      >
                        Remove
                      </p>
                    </div>
                    <input
                      type="number"
                      value={link.quantity}
                      onChange={(e) => {
                        setCart((prev: any) => {
                          const raw = e.target.value;
                          const next = raw === "" ? 0 : Number(raw);
                          if (!Number.isFinite(next)) return;
                          const clamped = Math.max(1, Math.floor(next));
                          return prev.map((item: any) =>
                            item.linkId === link.linkId
                              ? {
                                  ...item,
                                  quantity: clamped,
                                }
                              : item,
                          );
                        });
                      }}
                    />
                  </div>
                );
              })
            ) : (
              <div>Your cart is empty</div>
            )}
          </div>
        </div>
        <div className="link-cart-footer-wrapper">
          <div className="link-cart-footer">
            <h4>Total</h4>
            <p>{formatDollarNoCents(total)}</p>
          </div>
          <button className="submit-order">Submit Order</button>
        </div>
      </div>
    </div>
  );
};
export default LinkCart;
