import { useNavigate } from "react-router";
import StatusBadge from "../UI/StatusBadge";
import { formatDateNoTime } from "../../helpers";

const ClientsSheetItem = ({ sheet }) => {
  const navigate = useNavigate();

  return (
    <div
      className="clients-sheet-item"
      onClick={() => navigate(`/sheet/${sheet.sheetId}`)}
    >
      <p>{sheet.sheetTitle}</p>
      <StatusBadge status={sheet.sheetStatus} />
      <p>{formatDateNoTime(sheet?.createdAt)}</p>
    </div>
  );
};
export default ClientsSheetItem;
