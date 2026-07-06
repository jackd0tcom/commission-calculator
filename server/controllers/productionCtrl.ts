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
// import { formatMonthlySheetTitle } from "../commissionSheets.ts";
// import { getOrCreateMonthlySheetForUser } from "../helpers.ts";
import { Op } from "sequelize";

export default {
  getProductionOrderItems: async (req: Request, res: Response) => {
    try {
      console.log("getProductionOrderItems");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const orders = await OrderItem.findAll({
        where: {
          itemStatus: {
            [Op.ne]: "complete",
          },
        },
        include: [
          {
            model: Product,
            required: false,
            include: [{ model: UserProductCommission, required: false }],
          },
          {
            model: Link,
            required: false,
          },
          {
            model: Delivery,
            required: false,
          },
          {
            model: Vendor,
            as: "vendor",
          },
          {
            model: Order,
            include: [
              {
                model: Client,
                as: "client",
              },
              {
                model: User,
                as: "salesPersonUser",
                attributes: ["userId", "firstName", "lastName", "profilePic"],
              },
            ],
          },
        ],
      });

      if (orders) {
        res.send(orders);
      } else {
        res.status(400).send("No orders found");
      }
    } catch (error) {
      console.error("Error getting order:", error);
      res.status(500).send("Internal server error");
    }
  },
};
