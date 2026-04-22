import {
  CommissionSheet,
  Product,
  Order,
  OrderItem,
  User,
  Link,
  Client,
  UserProductCommission,
  Delivery,
  Vendor,
} from "../model.ts";
import { Request, Response } from "express";
import { formatMonthlySheetTitle } from "../commissionSheets.ts";

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
          include: [
            {
              model: Delivery,
              required: false,
            },
          ],
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
  getSheetOrderItems: async (req: Request, res: Response) => {
    try {
      console.log("getSheetOrderItems");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { userId } = req.session.user;

      const { sheetId } = req.params;

      const orderInclude: object[] = [
        {
          model: User,
          as: "user",
          attributes: ["profilePic", "firstName", "lastName"],
        },
        {
          model: Order,
        },
        {
          model: Client,
          as: "client",
        },
        {
          model: Product,
        },
      ];

      const items = await OrderItem.findAll({
        where: { sheetId },
        order: [["updatedAt", "DESC"]],
        include: orderInclude,
      });

      if (!items) {
        res.send(404).send("No items found");
        return;
      }

      if (items) {
        res.send(items);
      } else {
        res.status(400).send("No order items found");
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

      const client = await Client.findOne({ where: { clientId } });

      const order = await Order.create({
        userId: req.session.user.userId,
        clientId,
        salesPerson: client?.userId,
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
  newCalculatorOrder: async (req: Request, res: Response) => {
    try {
      console.log("newCalculatorOrder");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { cart } = req.body;
      const order = await Order.create({
        userId: req.session.user.userId,
      });
      if (!order) {
        res.status(400).send("No order found");
        return;
      }
      const itemPromises = cart.flatMap((product: any, index: number) =>
        Array.from({ length: product.quantity }, (_, i) =>
          OrderItem.create({
            orderId: order.orderId,
            orderIndex: Number(`${index}.00${i}`),
            productId: product.productId,
            price: product.price,
          }),
        ),
      );
      const items = await Promise.all(itemPromises);
      const orderData = order.toJSON();
      const payload = {
        ...orderData,
        items,
      };
      if (order) {
        res.status(200).send(payload);
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

      const order = await Order.findOne({
        where: { orderId },
        include: [
          {
            model: Client,
            as: "client",
          },
        ],
      });

      if (!order) {
        res.status(404).send("Order not found");
        return;
      }

      if (order.userId !== req.session.user.userId) {
        if (!req.session.user.isAdmin) {
          res.status(401).send("User is not allowed to view this order!");
          return;
        }
      }

      const orderItemRows = await OrderItem.findAll({
        where: { orderId },
        include: [
          {
            model: Product,
            required: false,
            include: [{ model: UserProductCommission, required: false }],
          },
          {
            model: Delivery,
            required: false,
          },
        ],
      });

      const plainItems = orderItemRows.map((row) => row.get({ plain: true }));

      const byGroup = new Map<string, typeof plainItems>();
      for (const item of plainItems) {
        const key =
          item.groupId == null ? "__ungrouped__" : String(item.groupId);
        const bucket = byGroup.get(key);
        if (bucket) bucket.push(item);
        else byGroup.set(key, [item]);
      }

      const sortedGroupKeys = [...byGroup.keys()].sort((a, b) => {
        if (a === "__ungrouped__") return 1;
        if (b === "__ungrouped__") return -1;
        return Number(a) - Number(b);
      });

      const orderItemGroups = sortedGroupKeys.map((key) => ({
        groupId: key === "__ungrouped__" ? null : Number(key),
        items: (byGroup.get(key) ?? []).sort(
          (x, y) => (x.itemId as number) - (y.itemId as number),
        ),
      }));

      const orderItems = orderItemGroups.flatMap((g) => g.items);

      const orderWithItems = {
        ...order?.dataValues,
        orderItems,
        orderItemGroups,
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
  updateOrderItemProduct: async (req: Request, res: Response) => {
    try {
      console.log("updateOrderItem");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { itemId, productType, id } = req.body;
      let newProduct;
      let payload;

      const orderItem = await OrderItem.findOne({ where: { itemId } });

      if (!orderItem) {
        res.status(400).send("No order item found");
        return;
      }

      if (productType === "product") {
        await orderItem?.update({ productType, productId: id, linkId: null });
        newProduct = await Product.findOne({
          where: { productId: id },
        });
      } else {
        await orderItem?.update({ productType, productId: id, linkId: null });
        newProduct = await Link.findOne({ where: { linkId: id } });
      }
      payload = { ...orderItem.toJSON(), newProduct };

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
  updateOrderStatus: async (req: Request, res: Response) => {
    try {
      console.log("updateOrderStatus");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { item } = req.body;

      const orderItem = await OrderItem.findOne({
        where: { itemId: item.itemId },
      });

      if (!orderItem) {
        res.status(400).send("No order item found");
        return;
      }

      if (item.itemStatus === "in progress") {
        await orderItem?.update({
          itemStatus: item.itemStatus,
        });
        await Delivery.destroy({
          where: {
            itemId: item.itemId,
          },
        });
      }

      const order = await Order.findOne({ where: { orderId: item.orderId } });

      if (item.itemStatus === "ordered") {
        await orderItem?.update({
          itemStatus: item.itemStatus,
          productNameSnapshot: item.product?.productName ?? null,
          priceSnapshot: item.price ?? item.product?.defaultPrice ?? null,
          defaultPriceSnapshot: item.product?.defaultPrice ?? null,
          commissionRateSnapshot:
            item.product?.user_product_commissions?.length > 0
              ? (item.commissionRateSnapshot ??
                item.product?.user_product_commissions[0].commissionRate)
              : (item.commissionRateSnapshot ?? item.product?.commissionRate),
          spiffSnapshot: item.product?.spiff ?? null,
          costSnapshot: item.product?.cost,
        });
        await Delivery.destroy({
          where: {
            itemId: item.itemId,
          },
        });
      } else if (item.itemStatus === "complete") {
        if (!item.productNameSnapshot) {
          await orderItem?.update({
            productNameSnapshot: item.product?.productName ?? null,
            priceSnapshot: item.price ?? item.product?.defaultPrice ?? null,
            defaultPriceSnapshot: item.product?.defaultPrice ?? null,
            commissionRateSnapshot:
              item.product?.user_product_commissions?.length > 0
                ? (item.commissionRateSnapshot ??
                  item.product?.user_product_commissions[0].commissionRate)
                : (item.commissionRateSnapshot ?? item.product?.commissionRate),
            spiffSnapshot: item.product?.spiff ?? null,
            costSnapshot: item.product?.cost,
          });
        }

        const currentSheet = await CommissionSheet.findOne({
          where: {
            userId: order?.salesPerson,
            sheetTitle: formatMonthlySheetTitle(
              new Date(),
              process.env.COMMISSION_SHEET_TIMEZONE,
            ),
          },
        });
        await orderItem.update({
          sheetId: currentSheet?.sheetId,
          itemStatus: item.itemStatus,
        });
        await Delivery.create({
          itemId: item.itemId,
          sheetId: currentSheet?.sheetId ?? null,
          deliveredQuantity: 1,
        });
      } else {
        await orderItem?.update({
          itemStatus: item.itemStatus,
          sheetId: null,
        });
        await Delivery.destroy({
          where: {
            itemId: item.itemId,
          },
        });
      }

      // updates order status based on orderItems

      const orderItems = await OrderItem.findAll({
        where: { orderId: item.orderId },
      });

      let newOrderStatus;

      const undeliveredItems = orderItems.filter(
        (item: any) => item.itemStatus !== "complete",
      );
      if (undeliveredItems.length > 0) {
        const deliveredItems = orderItems.filter(
          (item: any) => item.itemStatus === "complete",
        );
        if (deliveredItems.length > 0) {
          newOrderStatus = "partial";
        } else newOrderStatus = "in progress";
      } else newOrderStatus = "delivered";

      await order?.update({
        orderStatus: newOrderStatus,
      });

      // get and send products

      const product = await Product.findOne({
        where: { productId: item.product.productId },
        include: [{ model: UserProductCommission, required: false }],
      });

      const itemData = orderItem.toJSON();
      const payload = {
        ...itemData,
        product: product,
      };

      if (payload) {
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

      const interiorVendor = await Vendor.findOne({
        where: { vendorName: "Interior" },
      });

      const orderItemsCount = await OrderItem.count({
        where: { orderId: order.orderId },
      });

      const item = await OrderItem.create({
        orderId,
        productType: "product",
        vendorId: interiorVendor?.vendorId ?? null,
        orderIndex: orderItemsCount + 1,
      });

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
  duplicateOrderItem: async (req: Request, res: Response) => {
    try {
      console.log("duplicateOrderItem");

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

      const itemCopy = item.toJSON();

      delete itemCopy.itemId;
      delete itemCopy.createdAt;
      delete itemCopy.updatedAt;
      itemCopy.itemStatus = "staged";
      itemCopy.orderIndex = Number(item.orderIndex + 0.01);

      console.log(itemCopy);

      const newItem = await OrderItem.create(itemCopy);

      let payload = { ...newItem.toJSON() };

      if (newItem.productId) {
        const currentProduct = await Product.findOne({
          where: { productId: newItem.productId },
        });
        payload = {
          ...payload,
          product: currentProduct,
        };
      }

      res.status(200).send(payload);
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
