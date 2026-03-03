import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../components/UI/Loader";
import StatusBadge from "../components/UI/StatusBadge";
import ProfilePic from "../components/UI/ProfilePic";
import { formatDate } from "../helpers";
import { useNavigate } from "react-router";

const Approved = () => {
  const [approvedList, setApprovedList] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchApprovedSheets = async () => {
    try {
      await axios
        .post("/api/getPendingSheets", { status: "approved" })
        .then((res) => {
          setApprovedList(res.data);
          setIsLoading(false);
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchApprovedSheets();
  }, []);

  return (
    <div className="pending-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Approved Sheets</h2>
      </div>
      <div className="pending-sheets-list">
        <div className="pending-sheets-head pending-item">
          <p>User</p>
          <p>Title</p>
          <p>Status</p>
          <p>Date Submitted</p>
        </div>
        <div className="pending-sheets-items-wrapper">
          {isLoading ? (
            <Loader />
          ) : approvedList.length > 0 ? (
            approvedList?.map((sheet) => (
              <div
                className="pending-item"
                onClick={() => navigate(`/sheet/${sheet.sheetId}`)}
              >
                <ProfilePic src={sheet.user?.profilePic} />
                <p>{sheet.sheetTitle}</p>
                <p>{sheet.sheetTitle}</p>
                <StatusBadge status={sheet.sheetStatus} />
                <p>{formatDate(sheet.submitDate)}</p>
              </div>
            ))
          ) : (
            <div className="pending-item">
              <p></p>
              <p>No Approved sheets to show</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Approved;
