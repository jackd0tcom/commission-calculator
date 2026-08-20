import { createPlacement } from "../services/responaService.js";
import { Order, OrderItem } from "../model.js";
import { Request, Response } from "express";

export default {
  newResponaPlacement: async (req: Request, res: Response) => {
    try {
      console.log("newResponaPlacement");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { itemId } = req.body;

      const item = await OrderItem.findByPk(itemId);

      if (!item) {
        res.status(404).send("item not found");
        return;
      }

      const order = await Order.findByPk(item?.orderId);

      if (!order) {
        res.status(404).send("order not found");
        return;
      }

      const responaPayload = await createPlacement(order, item);

      res.status(200).send(responaPayload);
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
};
