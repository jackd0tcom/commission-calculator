import { useState, useEffect } from "react";
import DetailsView from "../components/Quote/DetailsView";
import QuoteView from "../components/Quote/QuoteView";
import axios, { all } from "axios";
import QuoteRows from "../components/Quote/QuoteRows";
import Loaders from "../components/UI/Loader";

export default function QuoteGenerator() {
  const [linkServices, setLinkServices] = useState([{}]);
  const [AIServices, setAIServices] = useState([{}]);
  const [ContentServices, setContentServices] = useState([{}]);
  const [TechnicalServices, setTechnicalServices] = useState([{}]);
  const [monthlyTerm, setMonthlyTerm] = useState(3);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState({
    itemName: "Linkable Content",
    price: 700,
    details: "linkable content",
  });

  const fetchProducts = async () => {
    try {
      await axios.get("/api/getAdminProducts").then((res) => {
        let links: any = [];
        let aio: any = [];
        let content: any = [];
        let technical: any = [];
        res.data.products?.forEach((prod: any) => {
          const newProd = { ...prod, quantity: 0, price: prod.defaultPrice };
          switch (prod.productType) {
            case "content services":
              content.push(newProd);
              break;
            case "technical services":
              technical.push(newProd);
              break;
            case "ai search optimization":
              aio.push(newProd);
              break;
            default:
              links.push(newProd);
              break;
          }
        });
        setLinkServices(links);
        setAIServices(aio);
        setContentServices(content);
        setTechnicalServices(technical);
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const allRows = [
    ...linkServices,
    ...AIServices,
    ...ContentServices,
    ...TechnicalServices,
  ];

  const grandTotal: number = allRows.reduce(
    (acc: number, row: any) => acc + row.price * row.quantity,
    0,
  );

  const estimatedLinks: number = allRows.reduce(
    (acc: number, row: any) => acc + row.quantity * row.linkEstimate,
    0,
  );

  const costPerLink: number =
    estimatedLinks > 0 ? grandTotal / estimatedLinks : 0;

  const cart = allRows.filter((row: any) => row.quantity > 0);

  // Takes in number, returns it in dollar format without cents
  const formatDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const updateQuantity = (
    type: string,
    index: number,
    value: number,
    increment: boolean,
  ) => {
    if (!increment && value < 0) {
      return;
    }
    if (type === "month") {
      if (value < 1) {
        return;
      }
      console.log(value);
      setMonthlyTerm(value);
    }
    if (type === "link building services") {
      if (increment) {
        setLinkServices((prevRows) =>
          prevRows.map((row: any, i) =>
            i === index
              ? { ...row, quantity: Math.max(0, row.quantity + value) }
              : row,
          ),
        );
        return;
      }
      setLinkServices((prevRows) => {
        const newRows: any = [...prevRows];
        newRows[index].quantity = value;
        return newRows;
      });
    } else if (type === "ai search optimization") {
      if (increment) {
        setAIServices((prevRows) =>
          prevRows.map((row: any, i) =>
            i === index
              ? { ...row, quantity: Math.max(0, row.quantity + value) }
              : row,
          ),
        );
        return;
      }
      setAIServices((prevRows) => {
        const newRows: any = [...prevRows];
        newRows[index].quantity = value;
        return newRows;
      });
    } else if (type === "content services") {
      if (increment) {
        setContentServices((prevRows) =>
          prevRows.map((row: any, i) =>
            i === index
              ? { ...row, quantity: Math.max(0, row.quantity + value) }
              : row,
          ),
        );
        return;
      }
      setContentServices((prevRows) => {
        const newRows: any = [...prevRows];
        newRows[index].quantity = value;
        return newRows;
      });
    } else if (type === "technical services") {
      if (increment) {
        setTechnicalServices((prevRows) =>
          prevRows.map((row: any, i) =>
            i === index
              ? { ...row, quantity: Math.max(0, row.quantity + value) }
              : row,
          ),
        );
        return;
      }
      setTechnicalServices((prevRows) => {
        const newRows: any = [...prevRows];
        newRows[index].quantity = value;
        return newRows;
      });
    }
  };

  // Handles updating the math for rows except for ultra premium rows
  const updatePrice = (type: string, index: number, value: number) => {
    if (type === "link building services") {
      setLinkServices((prevRows) => {
        const newRows: any = [...prevRows];
        newRows[index].price = Number(value);
        return newRows;
      });
    } else if (type === "ai search optimization") {
      setAIServices((prevRows) => {
        const newRows: any = [...prevRows];
        newRows[index].price = value;
        return newRows;
      });
    } else if (type === "content services") {
      setContentServices((prevRows) => {
        const newRows: any = [...prevRows];
        newRows[index].price = value;
        return newRows;
      });
    } else if (type === "technical services") {
      setTechnicalServices((prevRows) => {
        const newRows: any = [...prevRows];
        newRows[index].price = value;
        return newRows;
      });
    }
  };

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
          {isLoading ? (
            <Loaders />
          ) : (
            <>
              <QuoteRows
                serviceList={linkServices}
                setDetails={setDetails}
                setShowDetails={setShowDetails}
                updatePrice={updatePrice}
                updateQuantity={updateQuantity}
              />
              <QuoteRows
                serviceList={AIServices}
                setDetails={setDetails}
                setShowDetails={setShowDetails}
                updatePrice={updatePrice}
                updateQuantity={updateQuantity}
              />
              <QuoteRows
                serviceList={ContentServices}
                setDetails={setDetails}
                setShowDetails={setShowDetails}
                updatePrice={updatePrice}
                updateQuantity={updateQuantity}
              />
              <QuoteRows
                serviceList={TechnicalServices}
                setDetails={setDetails}
                setShowDetails={setShowDetails}
                updatePrice={updatePrice}
                updateQuantity={updateQuantity}
              />
              <div className="quote-generator-sidebar">
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
                    <p>
                      {!costPerLink ? "$0" : formatDollar.format(costPerLink)}
                    </p>
                  </div>
                  <div className="foot-row">
                    <p className="monthly-term">Monthly Term</p>
                    <input
                      className="calculator-input monthly-input"
                      type="number"
                      name="monthly-term"
                      value={monthlyTerm}
                      onChange={(e) =>
                        updateQuantity(
                          "month",
                          0,
                          Number(e.target.value),
                          false,
                        )
                      }
                    />
                  </div>
                  <div className="foot-row">
                    <p className="monthly">Monthly Cost</p>
                    <p className="monthly">
                      {formatDollar.format(grandTotal / monthlyTerm)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuote(true)}
                  className="quote-generator-submit"
                >
                  Submit My Quote
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
