import { useState, useEffect } from "react";
import axios from "axios";
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
  const [status, setStatus] = useState("ready");
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

  const handleSubmit = async () => {
    setStatus("submitting");
    try {
      await axios.post("/api/newLinkPortalOrder", { cart }).then((res) => {
        console.log(res.data);
        setTimeout(() => {
          setStatus("success");
          setCart({});
        }, 2000);
      });
    } catch (error) {
      console.log(error);
    }
  };
  return !showCart ? (
    <div className="link-cart-icon-wrapper" onClick={() => setShowCart(true)}>
      <FaShoppingCart className="cart-icon" />
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
                      <p className="link-cart-title">{link.publication}</p>
                      <p>{formatDollarNoCents(link.defaultPrice)}.00</p>
                      <p
                        className="remove-link"
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
                      className="link-cart-input"
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
          {status !== "success" ? (
            <button
              disabled={cart.length < 1}
              className="submit-order"
              onClick={() => handleSubmit()}
            >
              {status === "ready" ? "Submit Order" : "Submitting..."}
            </button>
          ) : (
            <p className="submission-success">Order Successfully Submitted</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default LinkCart;
