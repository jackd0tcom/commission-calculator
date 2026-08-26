import { capitalize, skewerCase } from "../../helpers";
import ResponaError from "./ResponaError";
import { FaCheck } from "react-icons/fa6";
import ResponaLogo from "../UI/ResponaLogo";

interface props {
  item?: any;
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
  const currentStatus = item?.responaItemStatus
    ? capitalize(item?.responaItemStatus)
    : item?.responaItemStatus;

  const showDraftButton =
    !currentStatus &&
    responaStatus !== "sending" &&
    responaStatus !== "success";

  return (
    <div className="respona-status-wrapper relative">
      {showDraftButton ? (
        <button
          className="draft-respona-link-button"
          onClick={() => handleCreateResponaOrder()}
        >
          Draft{" "}
          <ResponaLogo height="12px" width="12px" fill="white" arrow="green" />
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
