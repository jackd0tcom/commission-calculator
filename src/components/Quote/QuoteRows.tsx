import { formatDollar } from "../../helpers";
import { useState } from "react";
import { capitalize } from "../../helpers";

interface props {
  serviceList: any;
  setDetails: any;
  setShowDetails: any;
  updatePrice: any;
  updateQuantity: any;
}

const QuoteRows = ({
  serviceList,
  setDetails,
  setShowDetails,
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
          {capitalize(serviceList[1].productType)}
        </h3>
        {carat(showRows)}
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
            if (!row.commissionRate) {
              return;
            }
            return (
              <div className="service-row">
                <p
                  className={
                    index < 1
                      ? "row-title"
                      : index >= 1
                        ? "row-title"
                        : "row-title greyed-out"
                  }
                  onClick={() => {
                    setDetails(row);
                    setShowDetails(true);
                  }}
                >
                  {row.productName}
                </p>
                <div className="lead-gen-quantity-wrapper">
                  <button
                    disabled={index > 0 && index < 1}
                    className="quantity-button"
                    onClick={() =>
                      updateQuantity(row.productType, index, -1, true)
                    }
                  >
                    -
                  </button>

                  <input
                    disabled={index > 0 && index < 1}
                    className="calculator-input"
                    type="number"
                    value={row.quantity >= 1 ? row.quantity : ""}
                    onChange={(e) =>
                      updateQuantity(
                        row.productType,
                        index,
                        Number(e.target.value),
                        false,
                      )
                    }
                  />
                  <button
                    disabled={index > 0 && index < 1}
                    className="quantity-button"
                    onClick={() =>
                      updateQuantity(row.productType, index, 1, true)
                    }
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
                      updatePrice(
                        row.productType,
                        index,
                        Number(e.target.value),
                      );
                    }}
                  />
                </div>
                <p>{formatDollar(row.price * row.quantity)}</p>
              </div>
            );
          })}
        </div>
      </>
    </div>
  );
};
export default QuoteRows;
