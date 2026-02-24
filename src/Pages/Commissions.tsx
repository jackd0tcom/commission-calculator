import CommissionSheetList from "../components/Commissions/CommissionSheetList";
import { useNavigate } from "react-router";

const Commissions = () => {
  const navigate = useNavigate();
  return (
    <div className="commissions-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Commission Sheets</h2>
        <button
          onClick={() => navigate("/sheet/0")}
          className="new-sheet-button"
        >
          New Sheet
        </button>
      </div>
      <CommissionSheetList />
    </div>
  );
};
export default Commissions;
