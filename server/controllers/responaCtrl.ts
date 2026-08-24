import {
  createPlacement,
  deleteResponaOrder,
  removeResponaPlacement,
} from "../services/responaService.js";
import { ResponaApiError } from "../integrations/responaClient.js";
import { Order, OrderItem, Client } from "../model.js";
import { Request, Response } from "express";
import { verify } from "../helpers.js";
import { Op } from "sequelize";

export default {
  newResponaPlacement: async (req: Request, res: Response) => {
    try {
      console.log("newResponaPlacement");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { itemId } = req.body;

      const item = await OrderItem.findByPk(itemId);

      if (!item) {
        res.status(404).send("item not found");
        return;
      }

      const order = await Order.findOne({
        where: { orderId: item?.orderId },
        include: [{ model: Client, as: "client" }],
      });

      if (!order) {
        res.status(404).send("order not found");
        return;
      }

      const responaPayload = await createPlacement(order, item);
      res.status(200).json(responaPayload);
    } catch (error) {
      console.error("Error making respona placement:", error);
      if (error instanceof ResponaApiError) {
        res.status(error.status).json({
          message: error.message,
          code: error.code,
          requestId: error.requestId,
        });
        return;
      }
      res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },
  removeResponaPlacement: async (req: Request, res: Response) => {
    try {
      console.log("remove ResponaPlacement");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { itemId } = req.body;

      const item = await OrderItem.findByPk(itemId);

      if (!item) {
        res.status(404).send("item not found");
        return;
      }

      const order = await Order.findOne({
        where: { orderId: item?.orderId },
        include: [{ model: Client, as: "client" }],
      });

      if (!order) {
        res.status(404).send("order not found");
        return;
      }

      const responaPayload = await removeResponaPlacement(order, item);
      res.status(200).json(responaPayload);
    } catch (error) {
      console.error("Error making respona placement:", error);
      if (error instanceof ResponaApiError) {
        res.status(error.status).json({
          message: error.message,
          code: error.code,
          requestId: error.requestId,
        });
        return;
      }
      res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },
  deleteResponaOrder: async (req: Request, res: Response) => {
    try {
      console.log("deleteResponaOrder");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { orderId } = req.body;

      const order = await Order.findOne({
        where: { orderId },
      });

      if (!order) {
        res.status(404).send("order not found");
        return;
      }

      const responaPayload = await deleteResponaOrder(order);
      res.status(200).json(responaPayload);
    } catch (error) {
      console.error("Error making deleting order:", error);
      if (error instanceof ResponaApiError) {
        res.status(error.status).json({
          message: error.message,
          code: error.code,
          requestId: error.requestId,
        });
        return;
      }
      res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },
  newWebhookEvent: async (req: Request, res: Response) => {
    try {
      console.log("newWebhookEvent");

      const { event, data } = req.body;

      const verified = verify(secret);
      if (verified) {
        res.send(200);
      } else {
        res.status(401).send("could not verify respona signature");
        console.log(
          `RESPONA WEBHOOK: ERROR could not verify respona signature: ${req.body}`,
        );
        return;
      }

      if (event === "placement.status_changed") {
        const item = await OrderItem.findOne({
          where: { responaItemId: data.placement_id },
        });
        if (!item) {
          console.log(
            `RESPONA WEBHOOK: item not found from respona, respona data: ${data}`,
          );
          return;
        }
        await item.update({ responaItemStatus: data.status });
        console.log(
          `RESPONA WEBHOOK: item successfully updated, respona data: ${data}`,
        );
        return;
      }

      if (event.event === "order.status_changed") {
        const order = await Order.findOne({
          where: { responaOrderId: data?.order_id },
        });

        if (!order) {
          console.log(
            `RESPONA WEBHOOK: order not found from respona, respona data: ${data}`,
          );
          return;
        }
        await order.update({ responaOrderStatus: data.status });
        console.log(
          `RESPONA WEBHOOK: order successfully updated, respona data: ${data}`,
        );
        return;
      }
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
};
