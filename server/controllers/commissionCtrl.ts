import { CommissionSheet, CommissionItem } from "../model";
import { Request, Response } from "express";

export default {
  getCommissionSheets: async (req: Request, res: Response) => {
    try {
      console.log("getCommissionSheets");

      if (!req.session.user) {
        return;
      }

      const { userId } = req.session.user;

      const sheets = await CommissionSheet.findAll({ where: { userId } });

      if (sheets) {
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
