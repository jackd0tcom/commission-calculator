import { formatDollar } from "../../helpers";
import { useState } from "react";

interface props {
  serviceList: any;
  setDetails: any;
  setShowDetails: any;
  serviceType: string;
  updatePrice: any;
  updateQuantity: any;
}

const QuoteRows = ({
  serviceList,
  setDetails,
  setShowDetails,
  serviceType,
  updatePrice,
  updateQuantity,
}: props) => {
  const [showRows, setShowRows] = useState(false);

  // Reusable icon for collapse state next to table heading
  const carat = (state: any) => {
    return (
      <p className={state ? "carat toggled" : "carat"}>{state ? "-" : "+"}</p>
    );
  };

  return (
    <div className="quote-generator-section">
      <div className="heading-toggle" onClick={() => setShowRows(!showRows)}>
        <h3 className="rows-container-heading link-building-services">
          Link Building Services
        </h3>
        {carat(setShowRows)}
      </div>
      <>
        <div
          className={
            showRows
              ? "rows-container rows-visible"
              : "rows-container rows-hidden"
          }
        >
          <div className="service-row">
            <p></p>
            <p>Qty</p>
            <p>Price</p>
            <p>Total</p>
          </div>
          {serviceList.map((row: any, index: number) => {
            return (
              <div className="service-row">
                <p
                  className={
                    index < 1
                      ? "row-title"
                      : serviceType >= 1
                        ? "row-title"
                        : "row-title greyed-out"
                  }
                  onClick={() => {
                    setDetails(row);
                    setShowDetails(true);
                  }}
                >
                  {row.itemName}
                </p>
                <div className="lead-gen-quantity-wrapper">
                  <button
                    disabled={index > 0 && serviceType < 1}
                    className="quantity-button"
                    onClick={() => updateQuantity("AIO", index, -1, true)}
                  >
                    -
                  </button>

                  <input
                    disabled={index > 0 && serviceType < 1}
                    className="calculator-input"
                    type="number"
                    value={row.quantity >= 1 ? row.quantity : ""}
                    onChange={(e) =>
                      updateQuantity(
                        "AIO",
                        index,
                        Number(e.target.value),
                        false,
                      )
                    }
                  />
                  <button
                    disabled={index > 0 && serviceType < 1}
                    className="quantity-button"
                    onClick={() => updateQuantity("AIO", index, 1, true)}
                  >
                    +
                  </button>
                </div>
                <div className="calculator-price-wrapper">
                  <p className="dollar-sign">$</p>
                  <input
                    className="price-input"
                    type="number"
                    value={Number(row.price).toString()}
                    onChange={(e) => {
                      updatePrice("AIO", index, Number(e.target.value));
                    }}
                  />
                </div>
                <p>{formatDollar(row.price * row.quantity)}</p>
              </div>
            );
          })}
          {/* <div 
                className="heading-toggle premium-button"
                onClick={() =>
                  handleVisibilityToggle(showUltraPremium, setShowUltraPremium)
                }
              >
                {carat(showUltraPremium)}
                <h4 id="ultra-premium">Ultra Premium Links </h4>
              </div>
              */}
        </div>
      </>
    </div>
  );
};
export default QuoteRows;
