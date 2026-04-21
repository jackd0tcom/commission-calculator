import { useState, useEffect } from "react";
// import DetailsView from "../components/Quote/DetailsView";
// import QuoteView from "../components/Quote/QuoteView";
import axios from "axios";

export default function QuoteGenerator() {
  const [initialServices, setInitialServices] = useState([{}]);
  const [initialAIOServices, setInitialAIOServices] = useState([{}]);
  const [initialContentServices, setInitialContentServices] = useState([{}]);
  const [initialTechnicalServices, setInitialTechnicalServices] = useState([
    {},
  ]);
  const [showUltraPremium, setShowUltraPremium] = useState(false);
  const [monthlyTerm, setMonthlyTerm] = useState(3);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [details, setDetails] = useState({
    itemName: "Linkable Content",
    price: 700,
    details: "linkable content",
  });

  //   const cart = allRows.filter((row) => row.quantity > 0);

  // Takes in number, returns it in dollar format without cents
  const formatDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const fetchProducts = async () => {
    try {
      await axios.get("/api/getAdminProducts").then((res) => {
        console.log(res.data.products);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="quote-generator-page-wrapper">
      <div className="quote-generator-header">
        <div className="quote-generator-inner">
          <img
            src="/p1p-logo-white.png"
            alt=""
            className="quote-generator-logo"
          />
          <h2 className="quicksand">Link Building Quote Calculator</h2>
        </div>
      </div>
      <div className="quote-generator-wrapper">
        {showQuote && (
          <QuoteView
            data={{
              total: grandTotal,
              estimatedLinks: estimatedLinks,
              costPerLink: !costPerLink
                ? "$0"
                : formatDollar.format(costPerLink),
              monthlyTerm: monthlyTerm,
              monthlyCost: formatDollar.format(grandTotal / monthlyTerm),
            }}
            setShowQuote={setShowQuote}
            showQuote={showQuote}
            formatDollar={formatDollar}
            cart={cart}
          />
        )}
        {showDetails && (
          <DetailsView
            data={details}
            setShowDetails={setShowDetails}
            showDetails={showDetails}
            isLeadGen={false}
          />
        )}
        <div className="quote-generator-table-wrapper">
          {/* <div className="quote-generator-sidebar">
          <div className="quote-generator-foot">
            <div className="foot-row">
              <p>Total</p>
              <p>{formatDollar.format(grandTotal)}</p>
            </div>
            <div className="foot-row">
              <p>Estimated Links</p>
              <p>{estimatedLinks}</p>
            </div>
            <div className="foot-row">
              <p>Cost Per Link</p>
              <p>{!costPerLink ? "$0" : formatDollar.format(costPerLink)}</p>
            </div>
            <div className="foot-row">
              <p className="monthly-term">Monthly Term</p>
              <input
                className="calculator-input monthly-input"
                type="number"
                name="monthly-term"
                value={monthlyTerm}
                // onChange={(e) =>
                //   updateQuantity("month", 0, Number(e.target.value))
                // }
              />
            </div>
            <div className="foot-row">
              <p className="monthly">Monthly Cost</p>
              <p className="monthly">
                {formatDollar.format(grandTotal / monthlyTerm)}
              </p>
            </div>
          </div>
          {/* {showQuoteButton && (
            <button
              onClick={() => setShowQuote(true)}
              className="quote-generator-submit"
            >
              Submit My Quote
            </button>
          )} 
        </div>*/}
        </div>
      </div>
    </div>
  );
}
