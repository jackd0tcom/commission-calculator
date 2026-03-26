import { Delivery, CommissionSheet, OrderItem } from "../model";
import { Request, Response } from "express";
import { formatMonthlySheetTitle } from "../commissionSheets";

export default {
  newDelivery: async (req: Request, res: Response) => {
    try {
      console.log("newDelivery");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { itemId } = req.body;

      const orderItem = await OrderItem.findOne({
        where: { itemId: itemId },
      });

      if (!orderItem) {
        res.status(400).send("No order item found");
        return;
      }

      const currentSheet = await CommissionSheet.findOne({
        where: {
          userId: req.session.user.userId,
          sheetTitle: formatMonthlySheetTitle(
            new Date(),
            process.env.COMMISSION_SHEET_TIMEZONE,
          ),
        },
      });

      const delivery = await Delivery.create({
        itemId,
        sheetId: currentSheet?.sheetId ?? null,
        deliveredQuantity: 1,
      });

      if (delivery) {
        res.send(delivery);
      } else {
        res.status(400).send("No item found");
      }
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
  deleteDelivery: async (req: Request, res: Response) => {
    try {
      console.log("deleteDelivery");

      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { delivery } = req.body;

      const currentDelivery = await Delivery.findOne({
        where: {
          deliveryId: delivery.deliveryId,
        },
      });

      if (!currentDelivery) {
        res.status(404).send("no delivery found");
        return;
      }

      await currentDelivery?.destroy();

      res.status(200).send("Delivery deleted successfully");
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
};
