import CommissionSheetList from "../components/Commissions/CommissionSheetList";

const Commissions = () => {
  return (
    <div className="commissions-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Commission Sheets</h2>
      </div>
      <CommissionSheetList />
    </div>
  );
};
export default Commissions;
