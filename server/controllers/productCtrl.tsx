import { CommissionSheet, CommissionItem, Product } from "../model";
import { Request, Response } from "express";

export default {
  getProducts: async (req: Request, res: Response) => {
    try {
      console.log("getProducts");

      if (!req.session.user) {
        return;
      }

      const products = await Product.findAll();

      if (products) {
        res.send(products);
      } else {
        res.status(400).send("No sheets found");
      }
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
};
