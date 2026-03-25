import { useState, useEffect } from "react";
import axios from "axios";
import CommissionSheetList from "../components/Commissions/CommissionSheetList";
import { useNavigate } from "react-router";

const Commissions = () => {
  const navigate = useNavigate();
  const [sheetExists, setSheetExists] = useState(false);

  const checkSheet = async () => {
    try {
      await axios.get("/api/checkMonthlySheet").then((res) => {
        if (res.data.sheetId) {
          setSheetExists(true);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleNewSheet = async () => {
    try {
      await axios.post("/api/newSheet").then((res) => {
        if (res.status === 200) {
          navigate(`/sheet/${res.data.sheetId}`);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkSheet();
  }, []);

  return (
    <div className="commissions-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Commission Sheets</h2>
        <button
          onClick={() => handleNewSheet()}
          className="new-sheet-button"
          disabled={sheetExists}
        >
          New Sheet
        </button>
      </div>
      <CommissionSheetList />
    </div>
  );
};
export default Commissions;
