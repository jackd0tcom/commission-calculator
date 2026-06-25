import CommissionSheetList from "../components/Commissions/CommissionSheetList";

const Commissions = () => {
  return (
    <div className="commissions-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Commission Sheets</h2>
        {/* <button
          onClick={() => handleNewSheet()}
          className="new-sheet-button"
          disabled={sheetExists}
        >
          New Sheet
        </button> */}
      </div>
      <CommissionSheetList />
    </div>
  );
};
export default Commissions;
