import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface props {
  item: any;
  clientList: any;
  setClientList: any;
  currentClient: any;
}

const ClientPicker = ({
  item,
  clientList,
  setClientList,
  currentClient,
}: props) => {
  const [name, setName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(
    currentClient?.clientId,
  );
  const [showDropDown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [addingClient, setAddingClient] = useState(false);

  const selectedClient = clientList.find(
    (c: any) => c.clientId === selectedClientId,
  );

  const updateClient = async (id: number) => {
    try {
      await axios
        .post("/api/updateSheetItem", {
          itemId: item.itemId,
          fieldName: "clientId",
          value: id,
        })
        .then((res) => {
          if (res.status === 200) {
            setSelectedClientId(id);
            setShowDropdown(false);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddClient = async () => {
    try {
      await axios
        .post("/api/addNewClient", { clientName: name })
        .then((res) => {
          if (res.status === 200) {
            console.log(res.data);
            setClientList([...clientList, res.data]);
            setName("");
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".user-picker-button");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isButtonClick
      ) {
        setShowDropdown(false);
        setAddingClient(false);
      }
    };

    if (showDropDown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropDown]);

  // Focus the name input when user clicks "+ Add Client" (after the input is in the DOM)
  useEffect(() => {
    if (addingClient) {
      nameRef.current?.focus();
    }
  }, [addingClient]);

  return (
    <div className="client-picker">
      <button
        className="client-picker-button"
        onClick={() => setShowDropdown(!showDropDown)}
      >
        {selectedClient ? selectedClient.clientName : "Add a client"}
      </button>
      {showDropDown && (
        <div className="dropdown client-picker-dropdown" ref={dropdownRef}>
          {clientList.map((c: any) => (
            <div
              className="dropdown-item client-picker-item"
              key={c.clientId}
              onClick={() => updateClient(c.clientId)}
            >
              {c.clientName}
            </div>
          ))}
          <div className="dropdown-item new-client-item">
            {!addingClient ? (
              <p onClick={() => setAddingClient(true)}>+ Add Client</p>
            ) : (
              <input
                ref={nameRef}
                placeholder="Client Name"
                type="text"
                className="client-list-name new-client-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  if (name.length > 0) {
                    console.log(name);
                    handleAddClient();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    console.log("enter");
                    if (name.length > 0) {
                      console.log(name);
                      handleAddClient();
                    }
                    nameRef.current?.blur();
                  }
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ClientPicker;
