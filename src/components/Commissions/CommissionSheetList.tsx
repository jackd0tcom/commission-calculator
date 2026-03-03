import { useEffect, useState } from "react";
import axios from "axios";
import StatusBadge from "../UI/StatusBadge";
import { useNavigate } from "react-router";
import ProfilePic from "../UI/ProfilePic";
import { formatRelativeTime } from "../../helpers";
import Loader from "../UI/Loader";
import { useSelector } from "react-redux";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { formatDollarNoCents } from "../../helpers";

const CommissionSheetList = () => {
  const [commissionList, setCommissionList] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);
  const nav = useNavigate();
  const userId = useSelector((state: any) => state.user.userId);

  const getCommissionSheets = async () => {
    try {
      await axios.get("/api/getCommissionSheets").then((res) => {
        if (res.status === 200) {
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

  const getCommissionAmount = (sheet: any) => {
    if (!sheet?.commission_items || sheet?.commission_items?.length === 0) {
      return "$0";
    }
    return formatDollarNoCents(
      sheet.commission_items?.reduce((acc: number, item: any) => {
        const price = item.price ?? item.product?.defaultPrice ?? 0;
        const contribution = item.quantity * price;
        return acc + contribution * (item.product?.commissionRate ?? 0);
      }, 0),
    );
  };

  return (
    <div className="commission-sheet-list-wrapper">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="commission-sheet-list">
          <div className="commission-sheet-header">
            <p>User</p>
            <p>Title</p>
            <p>Status</p>
            <p>Commission</p>
            <p>Date Created</p>
          </div>
          {commissionList?.length > 0 ? (
            commissionList?.map((sheet: any) => (
              <div
                className="commission-sheet-item"
                onClick={() => nav(`/sheet/${sheet.sheetId}`)}
              >
                <ProfilePic src={sheet.user.profilePic} />
                <p>{sheet.sheetTitle}</p>
                <StatusBadge status={sheet.sheetStatus} />
                <p>{getCommissionAmount(sheet)}</p>
                <p>{formatRelativeTime(sheet.createdAt)}</p>
              </div>
            ))
          ) : (
            <div className="no-sheets">
              <FaMagnifyingGlass className="no-sheets-icon" />
              <h3>No sheets found</h3>
              <p>Hit the button in the top right to create a new sheet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default CommissionSheetList;
