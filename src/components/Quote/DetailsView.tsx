import { useRef, useEffect } from "react";

interface props {
  data: any;
  setShowDetails: any;
  showDetails: any;
}

export default function DetailsView({
  data,
  setShowDetails,
  showDetails,
}: props) {
  const detailsRef = useRef<HTMLInputElement>(null);

  // // Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
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
          <h3>{data.productName}</h3>
          <p>${data.price}</p>
        </div>
        <div className="calculator-content-wrapper">
          <div className="calculator-details-container">
            <>
              <div
                className="calculator-details"
                dangerouslySetInnerHTML={{ __html: data.details }}
              ></div>
            </>
          </div>
        </div>
      </div>
    </div>
  );
}
