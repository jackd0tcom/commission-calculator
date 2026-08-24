import { capitalize } from "../../helpers";
import ResponaError from "./ResponaError";
import { useState } from "react";
import { FaCheck } from "react-icons/fa6";

interface props {
  item: any;
  handleCreateResponaOrder: any;
  responaErrorMessage: string;
  setResponaErrorMessage: any;
  responaStatus: any;
  handleRemoveResponaPlacement: any;
}

const ResponaStatus = ({
  item,
  handleCreateResponaOrder,
  responaErrorMessage,
  responaStatus,
  handleRemoveResponaPlacement,
}: props) => {
  const currentStatus = item.responaItemStatus;
  const [hovering, setHovering] = useState(false);

  return (
    <div className="respona-status-wrapper relative">
      {!currentStatus ? (
        <button onClick={() => handleCreateResponaOrder()}>Draft</button>
      ) : hovering && responaStatus === "" ? (
        <button
          onMouseLeave={() => setHovering(false)}
          onClick={() => handleRemoveResponaPlacement()}
          className="respona-remove-placement"
        >
          Remove
        </button>
      ) : (
        <div
          onMouseEnter={() => setHovering(true)}
          className={`respona-status-badge ${currentStatus.toLowerCase()}`}
        >
          {responaStatus === "sending" ? (
            <div className="momentum"></div>
          ) : responaStatus === "success" ? (
            <div>
              <FaCheck className="respona-success" />
            </div>
          ) : (
            capitalize(currentStatus.toLowerCase())
          )}
        </div>
      )}
      {responaErrorMessage !== "" && (
        <ResponaError responaErrorMessage={responaErrorMessage} />
      )}
    </div>
  );
};
export default ResponaStatus;
