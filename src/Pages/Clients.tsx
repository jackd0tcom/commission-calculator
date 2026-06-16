import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ClientItem from "../components/Clients/ClientItem";
import { FaMagnifyingGlass } from "react-icons/fa6";
import ClientsOrderItem from "../components/Clients/ClientsOrderItem";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import ClientsSort from "../components/Clients/ClientsSort";
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
    try {
      await axios.post("/api/newClient").then((res) => {
        if (res.status === 200) {
          const newClient = res.data;
          res.data.newClient = true;
          setClientList([...clientList, newClient]);
        }
      });
    } catch (error) {
      console.log(error);
    }
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

  const filteredClientList = useMemo(() => {
    let data;

    const searchQuery = search.toLowerCase();

    // Search filtering
    if (searchQuery.trim() === "") {
      data = clientList;
    } else {
      data = clientList;
      data = data.filter((client: any) => {
        const name = client.clientName.toLowerCase();
        if (name.includes(searchQuery)) return true;
        else return false;
      });
    }

    // Sort filtering
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
            return filter.direction === "up"
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
      data = data.sort((a: any, b: any) =>
        a.clientName.toLowerCase().localeCompare(b.clientName.toLowerCase()),
      );

    return data;
  }, [search, clientList, filter]);

  return (
    <div className="clients-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Clients</h2>
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
            <ClientsSort filter={filter} setFilter={setFilter} />
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
        <div className="clients-sheet-wrapper">
          <div className="clients-sheet-head clients-sheet-item">
            <p>Title</p>
            <p>Status</p>
            <p>Date Created</p>
          </div>
          {orderList?.length > 0 ? (
            <div className="client-orders-list">
              {orderList?.map((order: any) => (
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
  );
};
export default Clients;
