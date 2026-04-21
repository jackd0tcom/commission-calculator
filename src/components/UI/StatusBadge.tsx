import { capitalize } from "../../helpers";
import { skewerCase } from "../../helpers";

interface status {
  status: string;
}

const StatusBadge = ({ status }: status) => {
  return (
    <div className="status-badge-wrapper">
      <div className={`order-status-badge ${skewerCase(status)}-badge`}>
        {capitalize(status)}
      </div>
    </div>
  );
};
export default StatusBadge;
