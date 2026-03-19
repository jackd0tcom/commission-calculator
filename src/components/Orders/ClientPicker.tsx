import { useState, useRef, useEffect } from "react";
import axios from "axios";

interface props {
  clientList: any;
  setClientList: any;
  newClient: any;
  setNewClient: any;
}

const ClientPicker = ({
  setClientList,
  clientList,
  newClient,
  setNewClient,
}: props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);
  const [addingClient, setAddingClient] = useState(false);
  const [name, setName] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

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
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

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

  return (
    <div className="client-picker-wrapper">
      <button onClick={() => setShowDropdown(!showDropdown)}>
        {newClient.clientName ?? "Select a client"}
      </button>
      {showDropdown && (
        <div className="dropdown client-picker-dropdown" ref={dropdownRef}>
          {clientList?.map((client: any) => (
            <div
              onClick={() => {
                setNewClient(client);
                setShowDropdown(false);
              }}
              className="dropdown-item client-picker-dropdown-item"
            >
              {client.clientName}
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
