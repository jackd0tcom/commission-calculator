import CommissionSheetList from "../components/Commissions/CommissionSheetList";

const Commissions = () => {
  return (
    <div className="commissions-page-wrapper">
      <div className="page-header-wrapper">
        <h1>Commission Sheets</h1>
      </div>
      <CommissionSheetList />
    </div>
  );
};
export default Commissions;
