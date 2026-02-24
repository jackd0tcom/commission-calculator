import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import axios from "axios";
import SheetItem from "../components/CommissionSheet/SheetItem";
import CommissionSheetFooter from "./CommissionSheetFooter";
import StatusPicker from "../components/CommissionSheet/StatusPicker";
import { useNavigate } from "react-router";

const CommissionSheet = () => {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user);
  const [clientList, setClientList] = useState([{}]);
  const [productList, setProductList] = useState([{}]);
  const [addingNewProduct, setAddingNewProduct] = useState(false);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
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
    if (Number(sheetId) !== 0) {
      if (user.userId) {
        fetchData();
      }
    }
  }, [user?.userId, sheetId]);

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

  const handleAddItem = async () => {
    try {
      await axios.post("/api/newSheetItem", { sheetId }).then((res) => {
        console.log(res.data);
        setSheetItems((prev) => [...prev, res.data]);
        setAddingNewProduct(true);
      });
    } catch (error) {
      setAddingNewProduct(false);
      console.log(error);
    }
  };

  const handleTitleChange = (e: any) => {
    setSheetData({ ...sheetData, sheetTitle: e.target.value });
  };

  const updateSheet = async (fieldName: string, value: string) => {
    if (Number(sheetId) === 0) {
      try {
        await axios.post("/api/newSheet", { sheetTitle: value }).then((res) => {
          if (res.status === 200) {
            navigate(`/sheet/${res.data.sheetId}`);
          }
        });
      } catch (error) {
        console.log(error);
      }
    } else
      try {
        await axios
          .post("/api/updateSheet", { sheetId, fieldName, value })
          .then((res) => {
            if (res.status !== 200) {
              console.log(res);
            }
          });
      } catch (error) {
        console.log(error);
      }
  };

  return (
    <div className="commission-sheet-page-wrapper">
      <div className="page-header-wrapper">
        <input
          ref={titleRef}
          type="text"
          value={sheetData.sheetTitle}
          onChange={(e) => handleTitleChange(e)}
          onBlur={() => updateSheet("sheetTitle", sheetData.sheetTitle)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateSheet("sheetTitle", sheetData.sheetTitle);
              titleRef.current.blur();
            }
          }}
        />
        <StatusPicker
          status={sheetData.sheetStatus}
          sheetData={sheetData}
          setSheetData={setSheetData}
          sheetId={sheetId}
        />
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
          <p>trash</p>
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
              sheetItems={sheetItems}
              setSheetItems={setSheetItems}
            />
          ))
        )}
        <div
          className="sheet-item new-item-row"
          onClick={() => handleAddItem()}
        >
          <p>+</p>
          <p>Add Product</p>
        </div>
        {!isLoading && <CommissionSheetFooter items={sheetItems} />}
      </div>
      <div className="commission-sheet-bottom-wrapper">
        <textarea
          ref={descriptionRef}
          name="notes"
          id="notes"
          onChange={(e) =>
            setSheetData({ ...sheetData, sheetDescription: e.target.value })
          }
          onBlur={() =>
            updateSheet("sheetDescription", sheetData.sheetDescription)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateSheet("sheetDescription", sheetData.sheetDescription);
              descriptionRef.current.blur();
            }
          }}
          value={sheetData.sheetDescription}
        ></textarea>
      </div>
    </div>
  );
};
export default CommissionSheet;
