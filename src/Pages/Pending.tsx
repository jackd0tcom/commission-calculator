import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../components/UI/Loader";
import StatusBadge from "../components/UI/StatusBadge";
import ProfilePic from "../components/UI/ProfilePic";
import { formatDate } from "../helpers";
import { useNavigate } from "react-router";

const Pending = () => {
  const [pendingList, setPendingList] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPendingSheets = async () => {
    try {
      await axios.get("/api/getPendingSheets").then((res) => {
        console.log(res.data);
        setPendingList(res.data);
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPendingSheets();
  }, []);

  return (
    <div className="pending-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Pending Sheets</h2>
      </div>
      <div className="pending-sheets-list">
        <div className="pending-sheets-head pending-item">
          <p>User</p>
          <p>Title</p>
          <p>Amount?</p>
          <p>Status</p>
          <p>Date</p>
        </div>
        <div className="pending-sheets-items-wrapper">
          {isLoading ? (
            <Loader />
          ) : (
            pendingList?.map((sheet) => (
              <div
                className="pending-item"
                onClick={() => navigate(`/sheet/${sheet.sheetId}`)}
              >
                <ProfilePic />
                <p>{sheet.sheetTitle}</p>
                <p>{sheet.sheetTitle}</p>
                <StatusBadge status={sheet.sheetStatus} />
                <p>{formatDate(sheet.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default Pending;
