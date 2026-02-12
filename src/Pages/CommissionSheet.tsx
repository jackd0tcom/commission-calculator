import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import axios from "axios";
import SheetItem from "../components/CommissionSheet/SheetItem";

const CommissionSheet = () => {
  const { sheetId } = useParams();
  const user = useSelector((state: any) => state.user);
  const [sheetData, setSheetData] = useState({
    sheetId: sheetId ? sheetId : 0,
    userId: user?.userId || 0,
    sheetTitle: "",
    sheetDescription: "",
    sheetStatus: "draft",
  });
  const [sheetItems, setSheetItems] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);

  const getSheet = async () => {
    try {
      await axios.get(`/api/getSheet/${sheetId}`).then((res) => {
        console.log(res.data);
        if (res.status === 200) {
          setSheetData({
            ...sheetData,
            sheetTitle: res.data.sheetTitle,
            sheetDescription: res.data.sheetDescription,
            sheetStatus: res.data.sheetStatus,
          });
          setSheetItems(res.data.items);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (sheetId) {
      getSheet();
    }
  }, []);

  return (
    <div className="commission-sheet-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Sheet</h2>
      </div>
      <div className="sheet-items-list">
        <div className="sheet-item sheet-items-list-head">
          <p>Client</p>
          <p>Product</p>
          <p>Quantity</p>
          <p>Price</p>
          <p>Cost</p>
          <p>Contribution</p>
          <p>Commission</p>
          <p>Bonus</p>
          <p>Total</p>
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          sheetItems?.map((item) => <SheetItem item={item} />)
        )}
      </div>
    </div>
  );
};
export default CommissionSheet;
