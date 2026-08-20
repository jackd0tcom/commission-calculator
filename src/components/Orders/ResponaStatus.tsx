import { capitalize } from "../../helpers";

interface props {
  item: any;
  handleCreateResponaOrder: any;
}

const ResponaStatus = ({ item, handleCreateResponaOrder }: props) => {
  const currentStatus = item.responaItemStatus;

  return (
    <div className="respona-status-wrapper">
      {!currentStatus ? (
        <button onClick={() => handleCreateResponaOrder()}>Draft</button>
      ) : (
        <div className={`respona-status-badge ${currentStatus.toLowerCase()}`}>
          {capitalize(currentStatus.toLowerCase())}
        </div>
      )}
    </div>
  );
};
export default ResponaStatus;
