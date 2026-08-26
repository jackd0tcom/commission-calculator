import { capitalize, skewerCase } from "../../helpers";
import ResponaError from "./ResponaError";
import { FaCheck } from "react-icons/fa6";

interface props {
  item: any;
  handleCreateResponaOrder: any;
  responaErrorMessage: string;
  setResponaErrorMessage: any;
  responaStatus: any;
}

const ResponaStatus = ({
  item,
  handleCreateResponaOrder,
  responaErrorMessage,
  responaStatus,
}: props) => {
  const currentStatus = item.responaItemStatus
    ? capitalize(item.responaItemStatus)
    : item.responaItemStatus;

  return (
    <div className="respona-status-wrapper relative">
      {!currentStatus ? (
        <button
          className="draft-respona-link-button"
          onClick={() => handleCreateResponaOrder()}
        >
          Draft Link
        </button>
      ) : (
        <div
          className={
            responaStatus === ""
              ? `respona-status-badge respona-${skewerCase(currentStatus.toLowerCase())}`
              : responaStatus === "sending"
                ? "respona-status-badge respona-sending"
                : responaStatus === "success"
                  ? "respona-status-badge respona-success"
                  : "respona-status-badge"
          }
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
