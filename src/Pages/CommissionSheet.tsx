import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import axios from "axios";
import SheetItem from "../components/CommissionSheet/SheetItem";
import CommissionSheetFooter from "./CommissionSheetFooter";
import StatusPicker from "../components/CommissionSheet/StatusPicker";
import { useNavigate } from "react-router";
import { formatDateWithDay } from "../helpers";
import { FaTrashCan } from "react-icons/fa6";
import ProfilePic from "../components/UI/ProfilePic";

const CommissionSheet = () => {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user);
  const [clientList, setClientList] = useState([{}]);
  const [productList, setProductList] = useState([{}]);
  const [unauthorized, setUnauthorized] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const creatingSheetRef = useRef<boolean>(false);
  const [sheetData, setSheetData] = useState({
    sheetId: sheetId ? sheetId : 0,
    userId: user?.userId || 0,
    sheetTitle: "",
    sheetDescription: "",
    sheetStatus: "draft",
    createdAt: null,
    updatedAt: null,
  });
  const [sheetItems, setSheetItems] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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
                userId: res.data.userId,
                sheetStatus: res.data.sheetStatus,
                createdAt: res.data.createdAt,
                updatedAt: res.data.updatedAt,
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
    } catch (error: any) {
      console.log(error);
      if (error.status === 401) {
        setUnauthorized(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Number(sheetId) === 0) {
      return;
    }
    if (!user.userId) {
      return;
    }
    fetchData();
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
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleTitleChange = (e: any) => {
    setSheetData({ ...sheetData, sheetTitle: e.target.value });
  };

  const updateSheet = async (fieldName: string, value: string) => {
    if (Number(sheetId) === 0) {
      if (creatingSheetRef.current) return;
      if (fieldName !== "sheetTitle") return;
      creatingSheetRef.current = true;
      try {
        await axios.post("/api/newSheet", { sheetTitle: value }).then((res) => {
          if (res.status === 200) {
            navigate(`/sheet/${res.data.sheetId}`);
          }
        });
      } catch (error) {
        creatingSheetRef.current = false;
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

  const handleDeleteSheet = async () => {
    try {
      await axios.post("/api/deleteSheet", { sheetId }).then((res) => {
        if (res.status === 200) {
          navigate(`/commission-sheets`);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="commission-sheet-page-wrapper">
      {Number(sheetId) === 0 ? (
        <div className="new-sheet-wrapper">
          <ProfilePic src={user.profilePic} />
          <input
            placeholder="Give your new sheet a title"
            ref={titleRef}
            className="new-sheet-input title-input"
            type="text"
            value={sheetData.sheetTitle}
            onChange={(e) => handleTitleChange(e)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateSheet("sheetTitle", sheetData.sheetTitle);
              }
            }}
          />
          <button
            onClick={() => updateSheet("sheetTitle", sheetData.sheetTitle)}
            className="create-sheet-button"
          >
            Create New Sheet
          </button>
        </div>
      ) : (
        <>
          <div className="page-header-wrapper">
            {sheetData.sheetStatus === "draft" ? (
              <input
                placeholder="Sheet title"
                ref={titleRef}
                className="title-input"
                type="text"
                value={sheetData.sheetTitle}
                onChange={(e) => handleTitleChange(e)}
                onBlur={() => updateSheet("sheetTitle", sheetData.sheetTitle)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    titleRef.current?.blur();
                  }
                }}
              />
            ) : (
              <h2>{sheetData.sheetTitle}</h2>
            )}
            <div className="sheet-header-container">
              <p className="sheet-date">
                {formatDateWithDay(sheetData?.createdAt)}
              </p>
              <StatusPicker
                status={sheetData.sheetStatus}
                sheetData={sheetData}
                setSheetData={setSheetData}
                sheetId={Number(sheetId)}
                isAdmin={user.isAdmin}
              />
            </div>
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
              <FaTrashCan className={"trash-can-icon"} />
            </div>
            {isLoading ? (
              <p>Loading...</p>
            ) : unauthorized ? (
              <div className="unauthorized">
                <p>You do not have permission to see this sheet!</p>
              </div>
            ) : (
              <>
                <div className="sheet-list-container">
                  {sheetItems?.map((item, idx) => {
                    return (
                      <SheetItem
                        index={idx}
                        item={item}
                        clientList={clientList}
                        productList={productList}
                        onQuantityChange={handleQuantityChange}
                        onPriceChange={handlePriceChange}
                        setSheetItems={setSheetItems}
                        isDraft={sheetData.sheetStatus === "draft"}
                      />
                    );
                  })}
                  {sheetData?.sheetStatus === "draft" && (
                    <div
                      className="sheet-item new-item-row"
                      onClick={() => handleAddItem()}
                    >
                      <p>+</p>
                      <p>Add Product</p>
                    </div>
                  )}
                </div>
                {!isLoading && <CommissionSheetFooter items={sheetItems} />}
              </>
            )}
          </div>
          <div className="commission-sheet-bottom-wrapper">
            <textarea
              className="commission-sheet-notes"
              placeholder="Add a note"
              ref={descriptionRef}
              name="notes"
              id="notes"
              disabled={sheetData?.sheetStatus !== "draft"}
              onChange={(e) =>
                setSheetData({ ...sheetData, sheetDescription: e.target.value })
              }
              onBlur={() =>
                updateSheet("sheetDescription", sheetData.sheetDescription)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateSheet("sheetDescription", sheetData.sheetDescription);
                  descriptionRef.current?.blur();
                }
              }}
              value={sheetData.sheetDescription}
            ></textarea>
            <div className="delete-sheet">
              {!isDeleting ? (
                <button
                  className="delete-sheet-button"
                  onClick={() => setIsDeleting(true)}
                >
                  Delete Sheet
                </button>
              ) : (
                <div className="delete-sheet-buttons">
                  <p>Are you sure you want to delete this sheet?</p>
                  <button onClick={() => handleDeleteSheet()}>Delete</button>
                  <button onClick={() => setIsDeleting(false)}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default CommissionSheet;
