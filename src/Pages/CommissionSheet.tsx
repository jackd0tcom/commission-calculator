import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import axios from "axios";
import CommissionSheetFooter from "./CommissionSheetFooter";
import SheetOrderItem from "../components/CommissionSheet/SheetOrderItem";
import StatusPicker from "../components/CommissionSheet/StatusPicker";
import { useNavigate } from "react-router";
import { formatDateWithDay } from "../helpers";
import Loader from "../components/UI/Loader";

const CommissionSheet = () => {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user);
  const [productList, setProductList] = useState([{}]);
  const [orderList, setOrderList] = useState([{}]);
  const [unauthorized, setUnauthorized] = useState(false);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const promises = [];

      if (sheetId) {
        promises.push(
          axios.get(`/api/getSheet/${sheetId}`).then((res) => {
            if (res.status === 200) {
              console.log(res.data);
              setSheetData((prev) => ({
                ...prev,
                sheetTitle: res.data.sheetTitle,
                sheetDescription: res.data.sheetDescription,
                userId: res.data.userId,
                sheetStatus: res.data.sheetStatus,
                createdAt: res.data.createdAt,
                updatedAt: res.data.updatedAt,
              }));
              setOrderList(res.data.orders);
            }
          }),
        );
      }

      promises.push(
        axios.get(`/api/getProducts/${sheetData.userId}`).then((res) => {
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
      <>
        <div className="page-header-wrapper">
          <h2>{sheetData.sheetTitle}</h2>
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
        <div className="sheet-page-body">
          <div className="sheet-items-list">
            <div className="sheet-item sheet-items-list-head">
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
              <Loader />
            ) : unauthorized ? (
              <div className="unauthorized">
                <p>You do not have permission to see this sheet!</p>
              </div>
            ) : (
              <>
                <div className="sheet-list-container">
                  {orderList?.length > 0 &&
                    orderList?.map((order: any) => {
                      return (
                        <div className="sheet-list-order-wrapper">
                          <div className="sheet-list-order">
                            <p>Order #{order.orderId}</p>
                            <p>{order.client?.clientName}</p>
                          </div>
                          {order?.order_items?.length > 0 &&
                            order.order_items.map((item: any) => (
                              <SheetOrderItem
                                item={item}
                                productList={productList}
                              />
                            ))}
                        </div>
                      );
                    })}
                </div>
                {!isLoading && (
                  <CommissionSheetFooter
                    items={orderList}
                    products={productList}
                  />
                )}
              </>
            )}
          </div>
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
    </div>
  );
};
export default CommissionSheet;
