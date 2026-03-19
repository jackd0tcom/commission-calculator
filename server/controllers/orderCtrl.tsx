import {
  CommissionSheet,
  Product,
  Order,
  OrderItem,
  User,
  Client,
} from "../model";
import { Request, Response } from "express";

export default {
  getOrders: async (req: Request, res: Response) => {
    try {
      console.log("getOrders");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { userId } = req.session.user;

      const orderInclude: object[] = [
        {
          model: User,
          as: "user",
          attributes: ["profilePic", "firstName", "lastName"],
        },
        {
          model: OrderItem,
          required: false,
        },
        {
          model: Client,
          as: "client",
        },
      ];

      let orders;

      if (req.session.user.isAdmin) {
        orders = await Order.findAll({
          order: [["updatedAt", "DESC"]],
          include: orderInclude,
        });
      } else {
        orders = await Order.findAll({
          where: { userId },
          order: [["updatedAt", "DESC"]],
          include: orderInclude,
        });
      }

      if (orders) {
        res.send(orders);
      } else {
        res.status(400).send("No orders found");
      }
    } catch (error) {
      console.error("Error getting orders:", error);
      res.status(500).send("Internal server error");
    }
  },
  newOrder: async (req: Request, res: Response) => {
    try {
      console.log("newOrder");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { clientId } = req.body;

      const order = await Order.create({
        userId: req.session.user.userId,
        clientId,
      });

      if (!order) {
        res.status(400).send("No order found");
        return;
      }

      if (order) {
        res.status(200).send(order);
      } else {
        res.status(400).send("No order found");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).send("Internal server error");
    }
  },
  getOrder: async (req: Request, res: Response) => {
    try {
      console.log("getOrder");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { orderId } = req.params;

      const order = await Order.findOne({ where: { orderId } });

      if (order.userId !== req.session.user.userId) {
        if (!req.session.user.isAdmin) {
          res.status(401).send("User is not allowed to view this order!");
          return;
        }
      }

      const orderItems = await OrderItem.findAll({
        where: { orderId },
      });

      // const itemsWithProducts = await Promise.all(
      //   items.map(async (item) => {
      //     const itemData = item.toJSON();
      //     const product = await Product.findOne({
      //       where: { productId: item.productId },
      //       include: [
      //         {
      //           model: UserProductCommission,
      //           where: { userId: sheet?.userId },
      //           required: false,
      //         },
      //       ],
      //     });
      //     return {
      //       ...itemData,
      //       product,
      //     };
      //   }),
      // );

      const orderWithItems = {
        ...order?.dataValues,
        orderItems,
      };

      if (orderWithItems) {
        res.send(orderWithItems);
      } else {
        res.status(400).send("No order found");
      }
    } catch (error) {
      console.error("Error getting order:", error);
      res.status(500).send("Internal server error");
    }
  },
  updateOrder: async (req: Request, res: Response) => {
    try {
      console.log("updateOrder");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { orderId, fieldName, value } = req.body;

      const order = await Order.findOne({ where: { orderId } });

      if (!order) {
        res.status(400).send("No order found");
        return;
      }

      // if (value === "paid") {
      //   const items = await CommissionItem.findAll({ where: { sheetId } });
      //   await Promise.all(
      //     items.map(async (item) => {
      //       if (!item.productId) return;
      //       const product = await Product.findOne({
      //         where: { productId: item.productId },
      //       });
      //       const client = await Client.findOne({
      //         where: { clientId: item.clientId },
      //       });
      //       await item.update({
      //         productNameSnapshot: product?.productName,
      //         defaultPriceSnapshot: product?.defaultPrice,
      //         commissionRateSnapshot: product?.commissionRate,
      //         spiffSnapshot: product?.spiff ?? 0,
      //         costSnapshot: product?.cost,
      //         clientNameSnapshot: client?.clientName,
      //         priceSnapshot: item.price ?? product?.defaultPrice,
      //       });
      //     }),
      //   );
      // }

      await order?.update({ [fieldName]: value });

      if (order) {
        res.send(order);
      } else {
        res.status(400).send("No order found");
      }
    } catch (error) {
      console.error("Error getting order:", error);
      res.status(500).send("Internal server error");
    }
  },
  updateOrderItem: async (req: Request, res: Response) => {
    try {
      console.log("updateOrderItem");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { itemId, fieldName, value } = req.body;
      let newProduct;
      let payload;

      const orderItem = await OrderItem.findOne({ where: { itemId } });

      if (!orderItem) {
        res.status(400).send("No order item found");
        return;
      }

      await orderItem?.update({ [fieldName]: value });

      if (fieldName === "productId") {
        newProduct = await Product.findOne({
          where: { productId: value },
        });
        payload = { ...orderItem.toJSON(), newProduct };
      } else payload = orderItem.toJSON();

      if (orderItem) {
        res.send(payload);
      } else {
        res.status(400).send("No item found");
      }
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
  newOrderItem: async (req: Request, res: Response) => {
    try {
      console.log("newOrderItem");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { orderId } = req.body;

      const order = await Order.findOne({ where: { orderId } });

      if (!order) {
        res.status(400).send("No order found");
        return;
      }
      const item = await OrderItem.create({ orderId });

      if (!item) {
        res.status(400).send("Error creating item");
        return;
      }

      if (item) {
        res.send(item);
      } else {
        res.status(400).send("No order found");
      }
    } catch (error) {
      console.error("Error getting order:", error);
      res.status(500).send("Internal server error");
    }
  },
  deleteOrderItem: async (req: Request, res: Response) => {
    try {
      console.log("deleteOrderItem");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { itemId } = req.body;

      const item = await OrderItem.findOne({ where: { itemId } });

      if (!item) {
        res.status(400).send("No item found");
        return;
      }

      await item.destroy();

      res.status(200).send("Item deleted successfully");
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
  deleteOrder: async (req: Request, res: Response) => {
    try {
      console.log("deleteOrder");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { orderId } = req.body;

      const order = await Order.findOne({ where: { orderId } });

      if (!order) {
        res.status(400).send("No order found");
        return;
      }

      if (order.userId !== req.session.user.userId) {
        res.status(401).send("You do not have permission to delete this sheet");
        return;
      }

      await order.destroy();

      res.status(200).send("Order deleted successfully");
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
};
