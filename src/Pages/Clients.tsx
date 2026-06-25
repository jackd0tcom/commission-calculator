import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ClientItem from "../components/Clients/ClientItem";
import { FaMagnifyingGlass } from "react-icons/fa6";
import ClientsOrderItem from "../components/Clients/ClientsOrderItem";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Sorter from "../components/Clients/Sorter";
import FilterDropdown from "../components/UI/FilterDropdown";

type FilterOption = {
  title: string;
  id?: number;
  profilePic?: string;
};

const Clients = () => {
  const [clientList, setClientList] = useState<any>([{}]);
  const [users, setUsers] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderList, setOrderList] = useState([]);
  const [currentClient, setCurrentClient] = useState(0);
  const userId = useSelector((state: any) => state.user.userId);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [salesPeople, setSalesPeople] = useState<FilterOption[]>();
  const [filter, setFilter] = useState({
    sales: 0,
    sort: "",
    direction: "up",
    orderSort: "",
    orderDirection: "up",
  });

  const currentClientName: any =
    clientList.find((client: any) => client?.clientId === currentClient)
      ?.clientName ?? "selected client";

  const fetchClients = async () => {
    try {
      await axios.get("/api/getClients").then((res) => {
        if (res.status === 200) {
          setClientList(res.data);
          const defaultClientId = res.data[0]?.clientId;
          const defaultClient = res.data.find(
            (client: any) => client.clientId === defaultClientId,
          );
          let salesArray: FilterOption[] = [];
          res.data.forEach((client: any) => {
            if (!salesArray.some((user: any) => user.id === client.userId)) {
              salesArray.push({
                title: `${client.user.firstName} ${client.user.lastName}`,
                profilePic: client.user.profilePic,
                id: client.userId,
              });
            }
          });
          setSalesPeople(salesArray);
          setOrderList(defaultClient?.orders ?? []);
          setCurrentClient(defaultClientId ?? 0);
          setIsLoading(false);
        }
      });
      await axios.get("/api/getUsers").then((res) => {
        setUsers(res.data);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchClients();
    }
  }, [userId]);

  const handleSelectClient = (clientId: number) => {
    const client: any = clientList.find((cl: any) => cl.clientId === clientId);
    setCurrentClient(clientId);
    setOrderList(client?.orders ?? []);
  };

  const handleAddClient = async () => {
    const emptyClient = {
      newClient: true,
      createdAt: new Date().toISOString(),
      userId: userId,
      clientName: "",
    };

    setClientList((prev: any) => [emptyClient, ...prev]);
  };

  const handleDeleteClient = async (clientId: number) => {
    try {
      await axios.post("/api/deleteClient", { clientId }).then((res) => {
        if (res.status === 200) {
          setClientList((prev: any) =>
            prev.filter(
              (p: any) =>
                Number((p as { clientId?: number }).clientId) !==
                Number(res.data.clientId),
            ),
          );
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const newOrder = async () => {
    if (currentClient === 0) {
      return;
    }
    try {
      await axios
        .post("/api/newOrder", { clientId: currentClient })
        .then((res) => {
          if (res.status === 200) {
            navigate(`/order/${res.data.orderId}/false`);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const { filteredClientList, filteredOrderList } = useMemo((): any => {
    let data;
    let orderData = orderList;

    const searchQuery = search.toLowerCase();

    // Search filtering
    if (searchQuery.trim() === "") {
      data = clientList;
    } else {
      data = clientList;
      data = data.filter((client: any) => {
        const name = client.clientName?.toLowerCase();
        if (name.includes(searchQuery)) return true;
        else return false;
      });
    }

    // Client filtering
    if (filter.sales !== 0) {
      data = data.filter((client: any) => {
        return client.user.userId === filter.sales;
      });
    }

    // Client Sort sorting
    if (filter.sort !== "") {
      data = data.sort((a: any, b: any) => {
        switch (filter.sort) {
          case "name":
            return filter.direction === "up"
              ? a.clientName
                  .toLowerCase()
                  .localeCompare(b.clientName.toLowerCase())
              : b.clientName
                  .toLowerCase()
                  .localeCompare(a.clientName.toLowerCase());

          case "dateCreated":
            return filter.direction !== "up"
              ? new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              : new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime();

          case "orders":
            return filter.direction === "up"
              ? a.orders?.length - b.orders?.length
              : b.orders?.length - a.orders?.length;

          default:
            break;
        }
      });
    } else
      data = data.sort((a: any, b: any) => {
        if (a.newClient) return -1;
        if (b.newClient) return 1;
        return a.clientName
          ?.toLowerCase()
          .localeCompare(b.clientName?.toLowerCase());
      });

    // Order Sort sorting
    if (filter.orderSort !== "") {
      orderData = orderData.sort((a: any, b: any): any => {
        const statusOrder = ["in progress", "partial", "delivered"];
        const orderName = (orderId: number) => {
          return `order #${orderId}`;
        };
        switch (filter.orderSort) {
          case "name":
            return filter.orderDirection === "up"
              ? orderName(a.orderId).localeCompare(orderName(b.orderId))
              : orderName(b.orderId).localeCompare(orderName(a.orderId));

          case "dateCreated":
            return filter.orderDirection !== "up"
              ? new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              : new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime();

          case "status":
            return filter.orderDirection === "up"
              ? statusOrder.indexOf(a.orderStatus) -
                  statusOrder.indexOf(b.orderStatus)
              : statusOrder.indexOf(b.orderStatus) -
                  statusOrder.indexOf(a.orderStatus);

          default:
            break;
        }
      });
    }

    return { filteredClientList: data, filteredOrderList: orderData };
  }, [search, clientList, filter, orderList]);

  return (
    <div className="clients-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Clients</h2>
        <button onClick={() => handleAddClient()} className="new-sheet-button">
          Add Client
        </button>
      </div>
      <div className="clients-page-container">
        <div className="clients-page-list-wrapper">
          <div className="clients-top-bar">
            <input
              type="text"
              placeholder="Search"
              className="clients-search"
              onChange={(e: any) => setSearch(e.target.value)}
            />
            <Sorter
              filter={filter}
              setFilter={setFilter}
              direction={"direction"}
              position="right"
              options={[
                {
                  heading: "Name",
                  sortHeading: "sort",
                  sortValue: "name",
                },
                {
                  heading: "Date Created",
                  sortHeading: "sort",
                  sortValue: "dateCreated",
                },
                {
                  heading: "# Orders",
                  sortHeading: "sort",
                  sortValue: "orders",
                },
              ]}
            />
          </div>
          <div className="clients-list-wrapper">
            <div className="clients-list-item clients-list-head">
              <FilterDropdown
                heading="Sales"
                array={false}
                options={salesPeople}
                filter={filter}
                setFilter={setFilter}
              />
              <p>Name</p>
              <p>Date Created</p>
              <p>Orders</p>
              <p></p>
            </div>
            {isLoading ? (
              <>Loading...</>
            ) : (
              <div className="clients-list-container">
                {filteredClientList?.map((client: any, index: number) => (
                  <ClientItem
                    key={`client-item-${client.clientId}`}
                    users={users}
                    client={client}
                    index={index}
                    handleDeleteClient={handleDeleteClient}
                    handleSelectClient={handleSelectClient}
                    currentClient={currentClient}
                    setClientList={setClientList}
                  />
                ))}
                <div
                  onClick={() => handleAddClient()}
                  className="new-client-row"
                >
                  <p>+</p>
                  <p>Add Client</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="clients-orders-wrapper">
          <div className="clients-order-top-bar">
            <Sorter
              filter={filter}
              setFilter={setFilter}
              direction={"orderDirection"}
              position="right"
              options={[
                {
                  heading: "Name",
                  sortHeading: "orderSort",
                  sortValue: "name",
                },
                {
                  heading: "Date Created",
                  sortHeading: "orderSort",
                  sortValue: "dateCreated",
                },
                {
                  heading: "Status",
                  sortHeading: "orderSort",
                  sortValue: "status",
                },
              ]}
            />
          </div>
          <div className="clients-sheet-wrapper">
            <div className="clients-sheet-head clients-sheet-item">
              <p>Title</p>
              <p>Status</p>
              <p>Date Created</p>
            </div>
            {filteredOrderList?.length > 0 ? (
              <div className="client-orders-list">
                {filteredOrderList?.map((order: any) => (
                  <ClientsOrderItem order={order} />
                ))}
                <div className="client-list-new-order-button">
                  <button
                    className="client-new-order-button"
                    onClick={() => newOrder()}
                  >
                    New Order
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-sheets-available">
                <FaMagnifyingGlass className="magnifying" />
                <p>No orders found for {currentClientName}</p>
                {currentClient !== 0 && (
                  <button
                    className="client-new-order-button"
                    onClick={() => newOrder()}
                  >
                    New Order
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Clients;
