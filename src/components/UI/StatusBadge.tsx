import { capitalize } from "../../helpers";

interface status {
  status: string;
}

const StatusBadge = ({ status }: status) => {
  return (
    <div className="status-badge-wrapper">
      <div className={`status-badge ${status}`}>
        <p>{capitalize(status)}</p>
      </div>
    </div>
  );
};
export default StatusBadge;
