import { Order, OrderItem } from "./model";
import cron from "node-cron";

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
          orderStatus: "in progress",
        });
        const newItems = order.order_items.map(async (item: any) => {
          return await OrderItem.create({
            ...item,
            dueDate: newDate,
            orderId: newOrder.orderId,
            status: "staged",
          });
        });
        return { ...newOrder, order_items: newItems };
      }),
    );

    return newOrders;
  } catch (error) {
    console.log(error);
  }
};

export const startM2MCron = async () => {
  cron.schedule("11 15 * * *", async () => {
    try {
      const response = await createMonthlyM2MOrders();
      console.log("[M2M CRON] created monthly jobs:", response);
    } catch (error) {
      console.log("[M2M CRON] ERROR:", error);
    }
  });
};
