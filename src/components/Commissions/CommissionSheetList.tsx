import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import StatusBadge from "../UI/StatusBadge";
import { useNavigate } from "react-router";
import ProfilePic from "../UI/ProfilePic";
import { formatDateWithDay } from "../../helpers";
import Loader from "../UI/Loader";
import { useSelector } from "react-redux";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { formatDollar } from "../../helpers";
import FilterDropdown from "../UI/FilterDropdown";
import { usePersistedFilter } from "../../hooks/usePersistedFilter";

type FilterOption = {
  title: string;
  id?: number;
  profilePic?: string;
};

const CommissionSheetList = () => {
  const [commissionList, setCommissionList] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);
  const nav = useNavigate();
  const userId = useSelector((state: any) => state.user.userId);
  const [filter, setFilter] = usePersistedFilter("commission-sheets", userId, {
    sort: "",
    user: [],
    title: [],
    status: [],
    direction: "up",
  });
  const [userList, setUserList] = useState<FilterOption[]>([]);
  const [titles, setTitles] = useState<FilterOption[]>([]);
  const [statuses, setStatuses] = useState<FilterOption[]>([]);

  const getCommissionSheets = async () => {
    try {
      await axios.get("/api/getCommissionSheets").then((res) => {
        if (res.status === 200) {
          setCommissionList(res.data);
          setIsLoading(false);

          let users: FilterOption[] = [];
          let titleArray: FilterOption[] = [];
          let statusArray: FilterOption[] = [];

          res.data.forEach((order: any) => {
            if (!users.some((user: any) => order.user?.userId === user.id)) {
              users.push({
                title: `${order.user.firstName ?? ""}`,
                id: order.userId,
                profilePic: order.user.profilePic ?? "",
              });
            }
            if (
              !titleArray.some((title: any) => order.sheetTitle === title.title)
            ) {
              titleArray.push({
                title: order.sheetTitle,
                id: order.sheetTitle,
              });
            }
            if (
              !statusArray.some(
                (status: any) => order.sheetStatus === status.id,
              )
            ) {
              statusArray.push({
                title: order.sheetStatus,
                id: order.sheetStatus,
              });
            }
          });

          setUserList(users);
          setTitles(titleArray);
          setStatuses(statusArray);
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

  const filteredList = useMemo(() => {
    let data = commissionList;

    // filter
    if (filter.user.length > 0) {
      data = data.filter((commission: any) =>
        filter.user.some((user: any) => user.id === commission.userId),
      );
    }
    if (filter.title.length > 0) {
      data = data.filter((commission: any) =>
        filter.title.some(
          (title: any) => title.title === commission.sheetTitle,
        ),
      );
    }
    if (filter.status.length > 0) {
      data = data.filter((commission: any) =>
        filter.status.some(
          (status: any) => status.title === commission.sheetStatus,
        ),
      );
    }

    return data;
  }, [filter, commissionList]);

  const getTotal = (deliveries: any) => {
    return deliveries.reduce((acc: number, delivery: any) => {
      const item = delivery.order_item;
      const price = item.priceSnapshot ?? item.defaultPriceSnapshot ?? 0;
      const cost = item.costSnapshot ?? 0;
      const contribution = price - cost;
      const commission =
        contribution * item.commissionRateSnapshot <= 0
          ? 0
          : contribution * item.commissionRateSnapshot;
      return acc + commission;
    }, 0);
  };

  return (
    <div className="commission-sheet-list-wrapper">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="commission-sheet-list">
          <div className="commission-sheet-header">
            <div className="filter-dropdown-wrapper">
              <FilterDropdown
                heading="User"
                array={true}
                options={userList}
                filter={filter}
                setFilter={setFilter}
              />
            </div>
            <div className="commission-sheet-header-item">
              <FilterDropdown
                heading="Title"
                array={true}
                options={titles}
                filter={filter}
                setFilter={setFilter}
              />
            </div>
            <div className="commission-sheet-header-item">
              {" "}
              <FilterDropdown
                heading="Status"
                array={true}
                options={statuses}
                filter={filter}
                setFilter={setFilter}
              />
            </div>
            <div className="commission-sheet-header-item">Commission</div>
            <div className="commission-sheet-header-item">Date Created</div>
          </div>
          {filteredList?.length > 0 ? (
            filteredList?.map((sheet: any) => (
              <div
                className="commission-sheet-item"
                onClick={() => nav(`/sheet/${sheet.sheetId}`)}
              >
                <div className="commission-sheet-header-item commission-profile">
                  <ProfilePic src={sheet.user.profilePic} />
                </div>
                <div className="commission-sheet-header-item">
                  {sheet.sheetTitle}
                </div>
                <div className="commission-sheet-header-item">
                  <StatusBadge status={sheet.sheetStatus} />
                </div>
                <div className="commission-sheet-header-item">
                  {formatDollar(getTotal(sheet.deliveries))}
                </div>
                <div className="commission-sheet-header-item">
                  {formatDateWithDay(sheet.createdAt)}
                </div>
              </div>
            ))
          ) : (
            <div className="no-sheets">
              <FaMagnifyingGlass className="no-sheets-icon" />
              <h3>No sheets found</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default CommissionSheetList;
