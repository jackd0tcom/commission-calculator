import {
  CommissionSheet,
  Product,
  Order,
  OrderItem,
  User,
  Client,
  Delivery,
} from "../model";
import { Request, Response } from "express";
import { formatMonthlySheetTitle } from "../commissionSheets";

export default {
  getCommissionSheets: async (req: Request, res: Response) => {
    try {
      console.log("getCommissionSheets");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { userId } = req.session.user;

      const sheetInclude: object[] = [
        {
          model: User,
          as: "user",
          attributes: ["profilePic", "firstName", "lastName"],
        },
        {
          model: Order,
          required: false,
        },
      ];

      let sheets;

      if (req.session.user.isAdmin) {
        sheets = await CommissionSheet.findAll({
          order: [["updatedAt", "DESC"]],
          include: sheetInclude,
        });
      } else {
        sheets = await CommissionSheet.findAll({
          where: { userId },
          order: [["updatedAt", "DESC"]],
          include: sheetInclude,
        });
      }

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
  getPendingSheets: async (req: Request, res: Response) => {
    try {
      console.log("getPendingCommissionSheets");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      if (!req.session.user?.isAdmin) {
        res.status(401).send("Current user is not an admin");
      }

      const { status } = req.body;

      const sheetInclude: object[] = [
        {
          model: User,
          as: "user",
          attributes: ["profilePic", "firstName", "lastName"],
        },
        {
          model: Order,
          required: false,
        },
      ];

      const sheets = await CommissionSheet.findAll({
        where: { sheetStatus: status },
        order: [["updatedAt", "DESC"]],
        include: sheetInclude,
      });

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
  newSheet: async (req: Request, res: Response) => {
    try {
      console.log("newSheet");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const sheetTitle = formatMonthlySheetTitle();

      const sheet = await CommissionSheet.create({
        sheetTitle,
        userId: req.session.user.userId,
      });

      if (!sheet) {
        res.status(400).send("No sheet found");
        return;
      }

      if (sheet) {
        res.send(sheet);
      } else {
        res.status(400).send("No sheet found");
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

      if (sheet.userId !== req.session.user.userId) {
        if (!req.session.user.isAdmin) {
          res.status(401).send("User is not allowed to view this sheet!");
          return;
        }
      }

      const orders = await Order.findAll({
        include: [
          {
            model: OrderItem,
            where: { sheetId },
            required: true,
            include: [
              {
                model: Delivery,
                required: true,
              },
            ],
          },
          {
            model: Client,
            as: "client",
            required: true,
          },
        ],
      });

      const sheetWithOrders = {
        ...sheet?.dataValues,
        orders,
      };

      if (sheetWithOrders) {
        res.send(sheetWithOrders);
      } else {
        res.status(400).send("No sheet found");
      }
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
  updateSheet: async (req: Request, res: Response) => {
    try {
      console.log("updateSheet");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { sheetId, fieldName, value } = req.body;

      const sheet = await CommissionSheet.findOne({ where: { sheetId } });

      if (!sheet) {
        res.status(400).send("No sheet found");
        return;
      }

      if (value === "submitted") {
        await sheet?.update({ submitDate: new Date() });
      }

      // if (value === "paid") {
      //   const items = await CommissionItem.findAll({ where: { sheetId } });
      //   await Promise.all(
      //     items.map(async (item) => {
      //       if (!item.productId) return;
      //       const product = await Product.findOne({
      //         where: { productId: item.productId },
      //       });
      //       const client = await Client.findOne({
      //         where: { clientId: item.clientId },
      //       });
      //       await item.update({
      //         productNameSnapshot: product?.productName,
      //         defaultPriceSnapshot: product?.defaultPrice,
      //         commissionRateSnapshot: product?.commissionRate,
      //         spiffSnapshot: product?.spiff ?? 0,
      //         costSnapshot: product?.cost,
      //         clientNameSnapshot: client?.clientName,
      //         priceSnapshot: item.price ?? product?.defaultPrice,
      //       });
      //     }),
      //   );
      // }

      await sheet?.update({ [fieldName]: value });

      if (sheet) {
        res.send(sheet);
      } else {
        res.status(400).send("No item found");
      }
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
  // updateSheetItem: async (req: Request, res: Response) => {
  //   try {
  //     console.log("updateSheetItem");

  //     if (!req.session.user) {
  //       console.log("user not logged in / no session set up");
  //       return;
  //     }

  //     const { itemId, fieldName, value } = req.body;
  //     let newProduct;
  //     let payload;

  //     const item = await CommissionItem.findOne({ where: { itemId } });

  //     if (!item) {
  //       res.status(400).send("No sheet found");
  //       return;
  //     }

  //     await item?.update({ [fieldName]: value });

  //     if (fieldName === "productId") {
  //       newProduct = await Product.findOne({
  //         where: { productId: value },
  //       });
  //       payload = { ...item.toJSON(), newProduct };
  //     } else payload = item.toJSON();

  //     if (item) {
  //       res.send(payload);
  //     } else {
  //       res.status(400).send("No item found");
  //     }
  //   } catch (error) {
  //     console.error("Error getting sheets:", error);
  //     res.status(500).send("Internal server error");
  //   }
  // },
  // newSheetItem: async (req: Request, res: Response) => {
  //   try {
  //     console.log("newSheetItem");

  //     if (!req.session.user) {
  //       console.log("user not logged in / no session set up");
  //       return;
  //     }

  //     const { sheetId } = req.body;

  //     const sheet = await CommissionSheet.findOne({ where: { sheetId } });

  //     if (!sheet) {
  //       res.status(400).send("No sheet found");
  //       return;
  //     }
  //     const item = await CommissionItem.create({ sheetId });

  //     if (!item) {
  //       res.status(400).send("Error creating item");
  //       return;
  //     }

  //     if (item) {
  //       res.send(item);
  //     } else {
  //       res.status(400).send("No sheet found");
  //     }
  //   } catch (error) {
  //     console.error("Error getting sheets:", error);
  //     res.status(500).send("Internal server error");
  //   }
  // },
  // deleteSheetItem: async (req: Request, res: Response) => {
  //   try {
  //     console.log("deleteSheetItem");

  //     if (!req.session.user) {
  //       console.log("user not logged in / no session set up");
  //       return;
  //     }

  //     const { itemId } = req.body;

  //     const item = await CommissionItem.findOne({ where: { itemId } });

  //     if (!item) {
  //       res.status(400).send("Error creating item");
  //       return;
  //     }

  //     await item.destroy();

  //     res.status(200).send("Item deleted successfully");
  //   } catch (error) {
  //     console.error("Error getting sheets:", error);
  //     res.status(500).send("Internal server error");
  //   }
  // },
  deleteSheet: async (req: Request, res: Response) => {
    try {
      console.log("deleteSheet");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { sheetId } = req.body;

      const sheet = await CommissionSheet.findOne({ where: { sheetId } });

      if (!sheet) {
        res.status(400).send("No sheet found");
        return;
      }

      if (sheet.userId !== req.session.user.userId) {
        res.status(401).send("You do not have permission to delete this sheet");
        return;
      }

      await sheet.destroy();

      res.status(200).send("Sheet deleted successfully");
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
  checkMonthlySheet: async (req: Request, res: Response) => {
    try {
      console.log("checkMonthlySheet");

      if (!req.session.user) {
        res.status(404).send("no user logged in");
        console.log("user not logged in / no session set up");
        return;
      }

      const sheetTitle = formatMonthlySheetTitle();

      const sheet = await CommissionSheet.findOne({
        where: { sheetTitle, userId: req.session.user.userId },
      });

      if (!sheet) {
        res.status(200).send("No sheet found");
        return;
      }

      res.status(200).send(sheet);
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
};
