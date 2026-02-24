import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import axios from "axios";
import SheetItem from "../components/CommissionSheet/SheetItem";
import CommissionSheetFooter from "./CommissionSheetFooter";

const CommissionSheet = () => {
  const { sheetId } = useParams();
  const user = useSelector((state: any) => state.user);
  const [clientList, setClientList] = useState([{}]);
  const [productList, setProductList] = useState([{}]);
  const [sheetData, setSheetData] = useState({
    sheetId: sheetId ? sheetId : 0,
    userId: user?.userId || 0,
    sheetTitle: "",
    sheetDescription: "",
    sheetStatus: "draft",
  });
  const [sheetItems, setSheetItems] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const promises = [];

      if (sheetId) {
        promises.push(
          axios.get(`/api/getSheet/${sheetId}`).then((res) => {
            if (res.status === 200) {
              setSheetData((prev) => ({
                ...prev,
                sheetTitle: res.data.sheetTitle,
                sheetDescription: res.data.sheetDescription,
                sheetStatus: res.data.sheetStatus,
              }));
              setSheetItems(res.data.items);
            }
          }),
        );
      }

      promises.push(
        axios.get("/api/getClients").then((res) => {
          if (res.status === 200) setClientList(res.data);
        }),
      );

      promises.push(
        axios.get("/api/getProducts").then((res) => {
          if (res.status === 200) setProductList(res.data);
        }),
      );

      await Promise.all(promises);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setSheetItems((prev) =>
      prev.map((it: any) => (it.itemId === itemId ? { ...it, quantity } : it)),
    );
  };

  const handlePriceChange = (itemId: number, price: number) => {
    setSheetItems((prev) =>
      prev.map((it: any) => (it.itemId === itemId ? { ...it, price } : it)),
    );
  };

  return (
    <div className="commission-sheet-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Sheet</h2>
      </div>
      <div className="sheet-items-list">
        <div className="sheet-item sheet-items-list-head">
          <p>#</p>
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
          sheetItems?.map((item, index) => (
            <SheetItem
              index={index}
              item={item}
              clientList={clientList}
              productList={productList}
              onQuantityChange={handleQuantityChange}
              onPriceChange={handlePriceChange}
            />
          ))
        )}
        <div className="sheet-item new-item-row"></div>
        {!isLoading && <CommissionSheetFooter items={sheetItems} />}
      </div>
    </div>
  );
};
export default CommissionSheet;
