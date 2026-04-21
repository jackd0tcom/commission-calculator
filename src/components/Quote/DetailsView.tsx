import { useRef, useEffect, useState } from "react";
import DetailsForm from "./DetailsForm";

export default function DetailsView({
  data,
  setShowDetails,
  showDetails,
  isLeadGen,
}): JSX.Element {
  const detailsRef = useRef(null);
  const [showForm, setShowForm] = useState(false);

  // // Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        setShowDetails(false);
      }
    };

    if (showDetails) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDetails]);

  return (
    <div className="calculator-details-overlay">
      <div className="calculator-details-wrapper" ref={detailsRef}>
        <div className="calculator-details-head">
          <h3>{data.itemName}</h3>
          <p>${data.price}</p>
        </div>
        <div className="calculator-content-wrapper">
          <div className="calculator-details-container">
            {!showForm ? (
              <>
                <div
                  className="calculator-details"
                  dangerouslySetInnerHTML={{ __html: data.details }}
                ></div>
                {isLeadGen && (
                  <a
                    style={{ marginTop: "1rem" }}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowForm(true);
                    }}
                  >
                    Example
                  </a>
                )}
              </>
            ) : (
              <DetailsForm data={data} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
