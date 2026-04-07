import axios from "axios";

interface props {
  deliveries: any;
  setDeliveries: any;
  quantity: number;
  item: any;
  onDeliveriesChange?: (deliveries: any[]) => void;
}

const OrderDeliveryPicker = ({
  deliveries,
  setDeliveries,
  quantity,
  item,
  onDeliveriesChange,
}: props) => {
  const deliveryCount = deliveries?.length ?? 0;

  const handleAdd = async () => {
    if (deliveryCount >= quantity) {
      return;
    }
    try {
      await axios
        .post("/api/newDelivery", { itemId: item.itemId })
        .then((res) => {
          if (res.status === 200) {
            const next = [...deliveries, res.data];
            setDeliveries(next);
            onDeliveriesChange?.(next);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubtract = async () => {
    if (deliveries.length > 1) {
      return;
    }
    const mostRecentDelivery = deliveries.reduce((acc: any, delivery: any) =>
      delivery.createdAt > acc.createdAt ? delivery : acc,
    );
    try {
      await axios
        .post("/api/deleteDelivery", { delivery: mostRecentDelivery })
        .then((res) => {
          if (res.status === 200) {
            const next = deliveries.filter(
              (delivery: any) =>
                delivery.deliveryId !== mostRecentDelivery.deliveryId,
            );
            setDeliveries(next);
            onDeliveriesChange?.(next);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="delivery-picker-wrapper">
      {/* <button
        onClick={() => handleSubtract()}
        disabled={deliveries.length < 1 && item.itemStatus === "draft"}
      >
        -
      </button> */}
      <p>
        {deliveryCount} / {quantity}
      </p>
      {/* <button
        onClick={() => handleAdd()}
        disabled={item.itemStatus === "draft"}
      >
        +
      </button> */}
    </div>
  );
};
export default OrderDeliveryPicker;
