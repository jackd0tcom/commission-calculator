import { CommissionSheet, Order, OrderItem, Client } from "../model";
import { Request, Response } from "express";
import { Op } from "sequelize";

export default {
  getClients: async (req: Request, res: Response) => {
    try {
      console.log("getClients");

      if (!req.session.user) {
        res.status(401).send("No user signed in!");
        console.log("user not logged in / no session set up");
        return;
      }

      const clients = await Client.findAll({
        where: { isArchived: false },
        order: [["clientName", "ASC"]],
      });

      if (clients) {
        res.send(clients);
      } else {
        res.status(400).send("No sheets found");
      }
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
  updateClient: async (req: Request, res: Response) => {
    try {
      console.log("updateClient");

      if (!req.session.user) {
        res.status(401).send("No user signed in!");
        console.log("user not logged in / no session set up");
        return;
      }

      const { clientId, fieldName, value } = req.body;

      const client = await Client.findOne({ where: { clientId } });

      if (!client) {
        res.status(400).send("No products found");
      }

      await client?.update({ [fieldName]: value });

      res.send(client);
    } catch (error) {
      console.error("Error getting clients:", error);
      res.status(500).send("Internal server error");
    }
  },
  deleteClient: async (req: Request, res: Response) => {
    try {
      console.log("deleteClient");

      if (!req.session.user) {
        res.status(401).send("No user signed in!");
        console.log("user not logged in / no session set up");
        return;
      }

      const { clientId } = req.body;

      const client = await Client.findOne({ where: { clientId } });

      if (!client) {
        res.status(400).send("No client found");
      }

      await client?.update({ isArchived: true });

      res.status(200).send(client);
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).send("Internal server error");
    }
  },
  newClient: async (req: Request, res: Response) => {
    try {
      console.log("newClient");

      if (!req.session.user) {
        res.status(401).send("No user signed in!");
        console.log("user not logged in / no session set up");
        return;
      }

      const client = await Client.create({
        userId: req.session.user.userId,
      });

      if (!client) {
        res.status(400).send("No client found");
      }

      res.status(200).send(client);
    } catch (error) {
      console.error("Error getting clients:", error);
      res.status(500).send("Internal server error");
    }
  },
  addNewClient: async (req: Request, res: Response) => {
    try {
      console.log("addNewClient");

      if (!req.session.user) {
        res.status(401).send("No user signed in!");
        console.log("user not logged in / no session set up");
        return;
      }

      const { clientName } = req.body;

      const client = await Client.create({
        userId: req.session.user.userId,
        clientName,
      });

      if (!client) {
        res.status(400).send("No client found");
      }

      res.status(200).send(client);
    } catch (error) {
      console.error("Error getting clients:", error);
      res.status(500).send("Internal server error");
    }
  },
  getClientOrders: async (req: Request, res: Response) => {
    try {
      console.log("getClientOrders");

      if (!req.session.user) {
        res.status(401).send("No user signed in!");
        console.log("user not logged in / no session set up");
        return;
      }

      const { clientId } = req.params;

      const orders = await Order.findAll({ where: { clientId } });

      if (orders) {
        res.send(orders);
      } else {
        res.status(400).send("No sheets found");
      }
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
};
