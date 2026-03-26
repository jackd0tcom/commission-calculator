import { useState } from "react";
import axios from "axios";

interface props {
  deliveries: any;
  setDeliveries: any;
  quantity: number;
  item: any;
}

const OrderDeliveryPicker = ({
  deliveries,
  setDeliveries,
  quantity,
  item,
}: props) => {
  const [deliveryCount, setDeliveryCount] = useState(deliveries?.length ?? 0);

  const handleAdd = async () => {
    try {
      await axios
        .post("/api/newDelivery", { itemId: item.itemId })
        .then((res) => {
          if (res.status === 200) {
            setDeliveryCount((prev: any) => (prev += 1));
            setDeliveries([...deliveries, res.data]);
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
            setDeliveryCount((prev: any) => (prev -= 1));
            setDeliveries((prev: any) =>
              prev.filter(
                (delivery: any) =>
                  delivery.deliveryId !== mostRecentDelivery.deliveryId,
              ),
            );
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="delivery-picker-wrapper">
      <button onClick={() => handleSubtract()} disabled={deliveries.length < 1}>
        -
      </button>
      <p>
        {deliveryCount} / {quantity}
      </p>
      <button onClick={() => handleAdd()}>+</button>
    </div>
  );
};
export default OrderDeliveryPicker;
