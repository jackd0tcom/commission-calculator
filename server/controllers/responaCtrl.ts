import {
  createPlacement,
  deleteResponaOrder,
  launchResponaOrder,
  removeResponaPlacement,
} from "../services/responaService.js";
import {
  getOrder as getResponaOrder,
  getPlacement,
  ResponaApiError,
} from "../integrations/responaClient.js";
import { Order, OrderItem, Client } from "../model.js";
import { Request, Response } from "express";
import { verify } from "../helpers.js";
import type { ResponaWebhookPayload } from "../integrations/responaTypes.js";

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
  pushResponaOrder: async (req: Request, res: Response) => {
    try {
      console.log("pushResponaOrder");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { orderId } = req.body;

      const order = await Order.findOne({
        where: { orderId: item?.orderId },
        include: [{ model: Client, as: "client" }],
      });

      if (!order) {
        res.status(404).send("order not found");
        return;
      }

      const responaPayload = await launchResponaOrder(order);
      res.status(200).json(responaPayload);
    } catch (error) {
      console.error("Error launching order:", error);
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
      const secret = process.env.RESPONA_WEBHOOK_SECRET;
      const signatureHeader = req.headers["x-respona-signature"];
      const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;

      if (
        !secret ||
        typeof signatureHeader !== "string" ||
        !rawBody ||
        !verify(secret, signatureHeader, rawBody)
      ) {
        console.log("RESPONA WEBHOOK: could not verify signature");
        res.status(401).send("could not verify respona signature");
        return;
      }

      const { event, data } = req.body as ResponaWebhookPayload;
      const deliveryId = req.headers["x-respona-delivery-id"];
      console.log(`RESPONA WEBHOOK: ${event} delivery=${deliveryId}`);

      if (event === "placement.status_changed" && data.placement_id) {
        const item = await OrderItem.findOne({
          where: { responaItemId: data.placement_id },
        });
        if (!item) {
          console.log("RESPONA WEBHOOK: item not found from respona", data);
          res.sendStatus(200);
          return;
        }

        const placement = await getPlacement(data.order_id, data.placement_id);
        await item.update({
          responaItemStatus: placement.status,
          ...(placement.publisher_url
            ? { responaPublishedUrl: placement.publisher_url }
            : {}),
          ...(placement.price != null ? { cost: placement.price / 100 } : {}),
        });
        console.log(
          `RESPONA WEBHOOK: item ${item.itemId} -> ${placement.status}`,
        );
        res.sendStatus(200);
        return;
      }

      if (event === "order.status_changed") {
        const order = await Order.findOne({
          where: { responaOrderId: data.order_id },
        });

        if (!order) {
          console.log("RESPONA WEBHOOK: order not found from respona", data);
          res.sendStatus(200);
          return;
        }

        const responaOrder = await getResponaOrder(data.order_id);
        await order.update({
          responaOrderStatus: responaOrder.status,
          responaAmount: responaOrder.price,
        });
        console.log(
          `RESPONA WEBHOOK: order ${order.orderId} -> ${responaOrder.status}`,
        );
        res.sendStatus(200);
        return;
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Error handling Respona webhook:", error);
      if (!res.headersSent) {
        res.status(500).send("Internal server error");
      }
    }
  },
};
