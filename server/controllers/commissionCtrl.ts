import { CommissionSheet, CommissionItem, Product } from "../model";
import { Request, Response } from "express";

export default {
  getCommissionSheets: async (req: Request, res: Response) => {
    try {
      console.log("getCommissionSheets");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
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
  getSheet: async (req: Request, res: Response) => {
    try {
      console.log("getSheet");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { sheetId } = req.params;

      const sheet = await CommissionSheet.findOne({ where: { sheetId } });

      const items = await CommissionItem.findAll({ where: { sheetId } });

      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const itemData = item.toJSON();
          const product = await Product.findOne({
            where: { productId: item.productId },
          });
          return {
            ...itemData,
            product,
          };
        }),
      );

      const sheetWithItems = {
        ...sheet?.dataValues,
        items: [...itemsWithProducts],
      };

      if (sheetWithItems) {
        res.send(sheetWithItems);
      } else {
        res.status(400).send("No sheet found");
      }
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
};
