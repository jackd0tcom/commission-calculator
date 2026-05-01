import {
  Delivery,
  Product,
  Link,
  OrderItem,
  Order,
  User,
  Client,
} from "../model";
import { Request, Response } from "express";
import { formatMonthlySheetTitle } from "../commissionSheets";
import { Op } from "sequelize";

export default {
  getDashboardStats: async (req: Request, res: Response) => {
    try {
      console.log("getDashboardStats");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const yearStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      );
      const yearEnd = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      );

      const yearsDeliveries = await Delivery.findAll({
        where: {
          createdAt: {
            [Op.between]: [yearStart, yearEnd],
          },
        },
        include: [{ model: OrderItem, required: false }],
      });

      const currentYearRevenue = (deliveries: any) => {
        return deliveries.reduce((acc: number, delivery: any) => {
          const total = delivery.order_item.priceSnapshot ?? 0;

          return acc + Number(total);
        }, 0);
      };

      const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      );
      const monthEnd = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      );

      const orders = await Order.findAll({
        where: {
          createdAt: {
            [Op.between]: [monthStart, monthEnd],
          },
        },
        include: [
          {
            model: OrderItem,
            required: false,
            include: [
              {
                model: Product,
                required: false,
              },
              {
                model: Link,
                required: false,
              },
            ],
          },
          {
            model: User,
            as: "user",
          },
          {
            model: Client,
            as: "client",
          },
        ],
      });

      const deliveries = await Delivery.findAll({
        where: {
          createdAt: {
            [Op.between]: [monthStart, monthEnd],
          },
        },
        include: [{ model: OrderItem, required: false }],
      });

      const payload = {
        orders: orders.flatMap((o: any) => o.get({ plain: true })),
        deliveries: deliveries.flatMap((d: any) => d.get({ plain: true })),
        yearRevenue: currentYearRevenue(yearsDeliveries),
      };

      res.status(200).send(payload);
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
};
