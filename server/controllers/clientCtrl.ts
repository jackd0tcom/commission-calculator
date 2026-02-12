import { CommissionSheet, CommissionItem, Product, Client } from "../model";
import { Request, Response } from "express";

export default {
  getClients: async (req: Request, res: Response) => {
    try {
      console.log("getClients");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { userId } = req.session.user;

      const clients = await Client.findAll({ where: { userId } });

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
};
