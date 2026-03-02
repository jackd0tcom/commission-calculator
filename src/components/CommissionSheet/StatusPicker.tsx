import { useState, useEffect, useRef } from "react";
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
    console.log(status);
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
          {status === "submitted" && !isAdmin && (
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
            className={`status-picker-button ${status}-button`}
            disabled={status === "approved"}
          >
            {status === "draft" ? "Submit" : capitalize(status)}
          </button>
        </>
      ) : (
        <>
          {status !== "approved" && status !== "denied" && (
            <button
              onClick={() => handleStatusChange("denied")}
              className={`status-picker-button ${status}-button`}
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
            className={`status-picker-button ${status}-button`}
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
