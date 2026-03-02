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
        {!isAdmin
          ? status === "draft"
            ? "Submit"
            : capitalize(status)
          : status !== "submitted"
            ? capitalize(status)
            : "Approve"}
      </button>
    </div>
  );
};
export default StatusPicker;
