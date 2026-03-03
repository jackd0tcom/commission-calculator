import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface props {
  item: any;
  clients: any;
  currentClient: any;
}

const ClientPicker = ({ item, clients, currentClient }: props) => {
  const [selectedClientId, setSelectedClientId] = useState(
    currentClient?.clientId,
  );
  const [showDropDown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);

  const selectedClient = clients.find(
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

    if (showDropDown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropDown]);

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
          {clients.map((c: any) => (
            <div
              className="dropdown-item client-picker-item"
              key={c.clientId}
              onClick={() => updateClient(c.clientId)}
            >
              {c.clientName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ClientPicker;
