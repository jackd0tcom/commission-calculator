import axios from "axios";
import { capitalize } from "../../helpers";

interface props {
  status: string;
  sheetId: number;
  sheetData: any;
  setSheetData: any;
  isAdmin: boolean;
}

const StatusPicker = ({
  status,
  sheetId,
  sheetData,
  setSheetData,
  isAdmin,
}: props) => {
  const handleStatusChange = async (status: string) => {
    try {
      await axios
        .post("/api/updateSheet", {
          sheetId,
          fieldName: "sheetStatus",
          value: status,
        })
        .then((res) => {
          if (res.status === 200) {
            setSheetData({ ...sheetData, sheetStatus: status });
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="status-picker-wrapper">
      {!isAdmin ? (
        <>
          {status === "submitted" && (
            <button
              className="draft-switch"
              onClick={() => handleStatusChange("draft")}
            >
              Switch to draft
            </button>
          )}
          <button
            onClick={() =>
              handleStatusChange(
                !isAdmin
                  ? status === "draft"
                    ? "submitted"
                    : status
                  : status !== "submitted"
                    ? status
                    : "approved",
              )
            }
            className={`status-picker-button user-${status}-button`}
            disabled={status !== "draft"}
          >
            {status === "draft" ? "Submit" : capitalize(status)}
          </button>
        </>
      ) : status === "approved" || status === "paid" ? (
        <>
          {status !== "paid" && (
            <button
              onClick={() => handleStatusChange("denied")}
              className={`status-picker-button deny ${status}-button`}
            >
              Deny
            </button>
          )}
          <button
            onClick={() => handleStatusChange("paid")}
            className={`status-picker-button pay-button ${status}-button`}
            disabled={status === "paid"}
          >
            {status === "paid" ? "Paid" : "Pay"}
          </button>
        </>
      ) : (
        <>
          {status !== "approved" && status !== "denied" && (
            <button
              onClick={() => handleStatusChange("denied")}
              className={`status-picker-button deny ${status}-button`}
              disabled={status === "approved"}
            >
              {status === "draft"
                ? "Deny"
                : status === "submitted"
                  ? "Deny"
                  : capitalize(status)}
            </button>
          )}
          <button
            onClick={() => handleStatusChange("approved")}
            className={`status-picker-button approve-button ${status}-button`}
            disabled={status === "approved"}
          >
            {status === "draft"
              ? "Approve"
              : status === "submitted"
                ? "Approve"
                : capitalize(status)}
          </button>
        </>
      )}
    </div>
  );
};
export default StatusPicker;
