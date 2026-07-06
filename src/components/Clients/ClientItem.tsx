import { useState } from "react";
import { useRef } from "react";
import axios from "axios";
import { formatDateNoTime } from "../../helpers";
import UserSelector from "../UI/UserSelector";
import ClientItemSettings from "./ClientItemSettings";

interface props {
  client: any;
  users: any;
  index: number;
  handleDeleteClient: any;
  handleSelectClient: any;
  currentClient: any;
  setClientList: any;
}

const ClientItem = ({
  client,
  users,
  handleDeleteClient,
  handleSelectClient,
  currentClient,
  setClientList,
}: props) => {
  const [name, setName] = useState(client?.clientName ?? "");
  const nameRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(client.newClient ? true : false);
  const [currentUserId, setCurrentUserId] = useState(client?.userId ?? null);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateClient = async (fieldName: string, value: any) => {
    if (client.newClient) {
      try {
        await axios.post("/api/newClient", { name: value }).then((res) => {
          if (res.status === 200) {
            setClientList((prev: any) =>
              prev.map((client: any) => (client.newClient ? res.data : client)),
            );
          }
        });
      } catch (error) {
        console.log(error);
      }
    } else
      try {
        await axios
          .post("/api/updateClient", {
            clientId: client.clientId,
            fieldName,
            value,
          })
          .then(() => {
            if (fieldName === "isArchived") {
              setClientList((prev: any) =>
                prev.filter(
                  (filtClient: any) => filtClient.clientId !== client.clientId,
                ),
              );
            }
          });
      } catch (error) {
        console.log(error);
      }
  };

  const handleSelectUser = (userId: number) => {
    updateClient("userId", userId);
    setCurrentUserId(userId);
  };

  return isDeleting ? (
    <div className="client-delete-modal">
      <p>Are you sure you want to delete {client.clientName}?</p>
      <div className="delete-client-buttons">
        <button
          className="delete-client"
          onClick={() => {
            handleDeleteClient(client.clientId);
            setIsDeleting(false);
          }}
        >
          Delete
        </button>
        <button
          className="cancel-delete-client"
          onClick={() => setIsDeleting(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <div
      className={
        currentClient === client.clientId
          ? "current-client clients-list-item"
          : "clients-list-item"
      }
      onClick={() => handleSelectClient(client.clientId)}
    >
      <div className="client-list-user-selector">
        <UserSelector
          users={users}
          currentUserId={currentUserId}
          handleSelectUser={handleSelectUser}
        />
      </div>
      {isEditing ? (
        <input
          type="text"
          className="client-list-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name !== client?.clientName) {
              updateClient("clientName", name);
            }
          }}
          onKeyDown={(e) => {
            if (name === client?.clientName) {
              return;
            }
            if (e.key === "Enter") {
              updateClient("clientName", name);
              nameRef.current?.blur();
            }
          }}
        />
      ) : (
        <p>{name}</p>
      )}

      <p>{formatDateNoTime(client?.createdAt)}</p>
      <p>{client.orders?.length ?? 0}</p>
      <ClientItemSettings
        client={client}
        handleDeleteClient={handleDeleteClient}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        setIsDeleting={setIsDeleting}
        updateClient={updateClient}
      />
    </div>
  );
};
export default ClientItem;
