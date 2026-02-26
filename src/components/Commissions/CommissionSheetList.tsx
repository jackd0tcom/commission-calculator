import { useEffect, useState } from "react";
import axios from "axios";
import { capitalize } from "../../helpers";
import StatusBadge from "../UI/StatusBadge";
import { useNavigate } from "react-router";
import ProfilePic from "../UI/ProfilePic";
import { formatRelativeTime } from "../../helpers";
import Loader from "../UI/Loader";
import { useSelector } from "react-redux";

const CommissionSheetList = () => {
  const [commissionList, setCommissionList] = useState([{}]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const nav = useNavigate();
  const userId = useSelector((state: any) => state.user.userId);

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
    if (userId) {
      getCommissionSheets();
    }
  }, [userId]);

  return (
    <div className="commission-sheet-list-wrapper">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="commission-sheet-list">
          <div className="commission-sheet-header">
            <p>User</p>
            <p>Title</p>
            <p>Description</p>
            <p>Status</p>
            <p>Date Created</p>
          </div>
          {commissionList?.map((sheet) => (
            <div
              className="commission-sheet-item"
              onClick={() => nav(`/sheet/${sheet.sheetId}`)}
            >
              <ProfilePic src={null} />
              <p>{sheet.sheetTitle}</p>
              <p>{sheet.sheetDescription}</p>
              <StatusBadge status={sheet.sheetStatus} />
              <p>{formatRelativeTime(sheet.createdAt)}</p>
              {/* <div className="commission-list-dots-wrapper">
                <button
                  onClick={() =>
                    showDropdown
                      ? setShowDropdown(false)
                      : setShowDropdown(true)
                  }
                  className="commission-list-dots"
                >
                  ...
                </button>
                {showDropdown && (
                  <div className="dropdown commission-dots-wrapper">
                    <div className="dropdown-item">Delete Sheet</div>
                  </div>
                )}
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default CommissionSheetList;
