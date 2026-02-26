import { useState } from "react";
import { useRef } from "react";
import axios from "axios";
import { formatDateNoTime } from "../../helpers";
import { TiDelete } from "react-icons/ti";

const ClientItem = ({
  client,
  index,
  handleDeleteClient,
  handleSelectClient,
  currentClient,
}) => {
  const [name, setName] = useState(client?.clientName ? client.clientName : "");
  const nameRef = useRef(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateClient = async (fieldName: string, value: string) => {
    try {
      await axios
        .post("/api/updateClient", {
          clientId: client.clientId,
          fieldName,
          value,
        })
        .then((res) => {
          if (res.status === 200) {
            return;
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return isDeleting ? (
    <div className="product-delete-modal">
      <p>Are you sure you want to delete {name}?</p>
      <div>
        <button
          className="delete-product"
          onClick={() => {
            handleDeleteClient(client.clientId);
            setIsDeleting(false);
          }}
        >
          Delete
        </button>
        <button
          className="cancel-delete-product"
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
      <p>{index + 1}</p>
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
            nameRef.current.blur();
          }
        }}
      />
      <p>{formatDateNoTime(client?.createdAt)}</p>
      <TiDelete
        className="sheet-item-delete"
        onClick={() => setIsDeleting(true)}
      />
    </div>
  );
};
export default ClientItem;
