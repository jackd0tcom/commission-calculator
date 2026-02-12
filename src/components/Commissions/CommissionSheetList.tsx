import { useEffect, useState } from "react";
import axios from "axios";
import { capitalize } from "../../helpers";
import StatusBadge from "../UI/StatusBadge";
import { useNavigate } from "react-router";

const CommissionSheetList = () => {
  const [commissionList, setCommissionList] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);
  const nav = useNavigate();

  const getCommissionSheets = async () => {
    try {
      await axios.get("/api/getCommissionSheets").then((res) => {
        if (res.statusText === "OK") {
          setCommissionList(res.data);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCommissionSheets();
  }, []);

  return (
    <div className="commission-sheet-list-wrapper">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="commission-sheet-list">
          <div className="commission-sheet-header">
            <p>Title</p>
            <p>Description</p>
            <p>Status</p>
          </div>
          {commissionList?.map((sheet) => (
            <div
              className="commission-sheet-item"
              onClick={() => nav(`/sheet/${sheet.sheetId}`)}
            >
              <p>{sheet.sheetTitle}</p>
              <p>{sheet.sheetDescription}</p>
              <StatusBadge status={sheet.sheetStatus} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default CommissionSheetList;
