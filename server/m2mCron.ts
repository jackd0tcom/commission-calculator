import { Order, OrderItem } from "./model";
import { configDotenv } from "dotenv";

configDotenv();

const createMonthlyM2MOrders = async () => {
  try {
    const m2mOrders = await Order.findAll({
      where: {
        isM2M: true,
      },
      include: [
        {
          model: OrderItem,
        },
      ],
    });

    const newDate = new Date();

    const newOrders = await Promise.all(
      m2mOrders.map(async (order: any) => {
        const newOrder: any = await Order.create({
          ...order,
          isM2M: false,
          orderId: null,
          orderStatus: "in progress",
        });
        const newItems = await Promise.all(
          order.order_items.map(async (item: any) => {
            return await OrderItem.create({
              ...item,
              dueDate: newDate,
              orderId: newOrder.orderId,
              status: "staged",
            });
          }),
        );
        return { ...newOrder, order_items: newItems };
      }),
    );

    return newOrders;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

console.log("[M2M CRON] starting");
const response = await createMonthlyM2MOrders();
console.log("[M2M CRON] created monthly jobs:", response);
console.log("[M2M CRON] done");
process.exit(0);
