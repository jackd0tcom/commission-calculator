import { useState, useEffect } from "react";
import axios from "axios";
import ClientItem from "../components/Clients/ClientItem";
import { FaTrashCan, FaMagnifyingGlass } from "react-icons/fa6";
import ClientsSheetItem from "../components/Clients/ClientsSheetItem";
import { useSelector } from "react-redux";

const Clients = () => {
  const [clientList, setClientList] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetList, setSheetList] = useState([{}]);
  const [currentClient, setCurrentClient] = useState(0);
  const userId = useSelector((state: any) => state.user.userId);

  const fetchClients = async () => {
    try {
      await axios.get("/api/getClients").then((res) => {
        if (res.status === 200) {
          setClientList(res.data);
          setIsLoading(false);
        }
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

  const getSheets = async (clientId: number) => {
    try {
      await axios.get(`/api/getClientSheets/${clientId}`).then((res) => {
        if (res.status === 200) {
          setSheetList(res.data);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectClient = (clientId: number) => {
    setCurrentClient(clientId);
    getSheets(clientId);
  };

  const handleAddClient = async () => {
    try {
      await axios.post("/api/newClient").then((res) => {
        if (res.status === 200) {
          setClientList([...clientList, res.data]);
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
          setClientList((prev) =>
            prev.filter(
              (p) =>
                Number((p as { clientId?: number }).clientId) !==
                Number(clientId),
            ),
          );
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="clients-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Clients</h2>
      </div>
      <div className="clients-page-container">
        <div className="clients-list-wrapper">
          <div className="clients-list-item clients-list-head">
            <p>#</p>
            <p>Name</p>
            <p>Date Created</p>
            <FaTrashCan className={"trash-can-icon"} />
          </div>
          {isLoading ? (
            <>Loading...</>
          ) : (
            <div className="clients-list-container">
              {clientList?.map((client, index) => (
                <ClientItem
                  client={client}
                  index={index}
                  handleDeleteClient={handleDeleteClient}
                  handleSelectClient={handleSelectClient}
                  currentClient={currentClient}
                />
              ))}
            </div>
          )}
          <div
            onClick={() => handleAddClient()}
            className="clients-list-item new-client-row"
          >
            <p>+</p>
            <p>Add Client</p>
          </div>
        </div>
        <div className="clients-sheet-wrapper">
          <div className="clients-sheet-head clients-sheet-item">
            <p>Title</p>
            <p>Status</p>
            <p>Date Created</p>
          </div>
          {sheetList?.length > 1 ? (
            sheetList?.map((sheet) => <ClientsSheetItem sheet={sheet} />)
          ) : (
            <div className="no-sheets-available">
              <FaMagnifyingGlass className="magnifying" />
              <p>No sheets found for selected client</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Clients;
