import { CommissionSheet, CommissionItem, Product, Client } from "../model";
import { Request, Response } from "express";
import { Op } from "sequelize";

export default {
  getClients: async (req: Request, res: Response) => {
    try {
      console.log("getClients");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { userId } = req.session.user;

      const clients = await Client.findAll({
        where: { userId, isArchived: false },
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
  getClientSheets: async (req: Request, res: Response) => {
    try {
      console.log("getClientSheets");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { clientId } = req.params;

      const items = await CommissionItem.findAll({ where: { clientId } });

      const sheetIds = [...new Set(items.map((item) => item.sheetId))];

      const sheets = await CommissionSheet.findAll({
        where: { sheetId: { [Op.in]: sheetIds } },
      });

      if (sheets.length) {
        res.send(sheets);
      } else {
        res.status(400).send("No sheets found");
      }
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
};
