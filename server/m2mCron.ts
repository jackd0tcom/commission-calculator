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
        const newOrder = await Order.create({
          userId: order.userId,
          clientId: order.clientId,
          orderStatus: "in progress",
          salesPerson: order.salesPerson,
          orderTitle: order.orderTitle,
          orderNotes: order.orderNotes,
          isM2M: false,
        });
        const newItems = await Promise.all(
          order.order_items.map(async (item: any) => {
            const itemCopy = item.toJSON();
            delete itemCopy.itemId;
            delete itemCopy.createdAt;
            delete itemCopy.updatedAt;

            return OrderItem.create({
              ...itemCopy,
              orderId: newOrder.orderId,
              dueDate: newDate,
              itemStatus: "staged",
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
