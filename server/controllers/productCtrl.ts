import { Product, UserProductCommission, User, Link } from "../model";
import { Request, Response } from "express";
import { Order } from "sequelize";

export default {
  getProducts: async (req: Request, res: Response) => {
    try {
      console.log("getProducts");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { userId } = req.params;

      const products = await Product.findAll({
        where: { isArchived: false },
        include: [
          {
            model: UserProductCommission,
            where: { userId },
            required: false,
          },
        ],
        order: [["productId", "DESC"]],
      });

      const links = await Link.findAll();

      const payload = {
        products,
        links,
      };

      if (payload) {
        res.send(payload);
      } else {
        res.status(400).send("No products found");
      }
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).send("Internal server error");
    }
  },
  getAdminProducts: async (req: Request, res: Response) => {
    try {
      console.log("getAdminProducts");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const products = await Product.findAll({
        where: { isArchived: false },
        include: [
          {
            model: UserProductCommission,
            required: false,
          },
        ],
        order: [["productId", "DESC"]],
      });

      const users = await User.findAll();

      const payload = {
        products: products,
        users: users,
      };

      if (products) {
        res.send(payload);
      } else {
        res.status(400).send("No products found");
      }
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).send("Internal server error");
    }
  },
  updateProduct: async (req: Request, res: Response) => {
    try {
      console.log("updateProduct");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { productId, fieldName, value } = req.body;

      const product = await Product.findOne({ where: { productId } });

      if (!product) {
        res.status(400).send("No products found");
      }

      await product?.update({ [fieldName]: value });

      res.send(product);
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).send("Internal server error");
    }
  },
  updateUserCommissionRate: async (req: Request, res: Response) => {
    try {
      console.log("updateUserCommissionRate");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { id, productId, userId, commissionRate } = req.body;

      let commission;

      if (id) {
        commission = await UserProductCommission.findByPk(id);
      }

      if (!commission && productId && userId) {
        commission = await UserProductCommission.findOne({
          where: { productId, userId },
        });
      }

      if (!commission) {
        commission = await UserProductCommission.create({
          productId,
          userId,
          commissionRate,
        });
        console.log("🐸 new commission created");
        res.status(200).send(commission);
        return;
      }

      await commission.update({ commissionRate });

      res.send(commission);
    } catch (error) {
      console.error("Error getting commission:", error);
      res.status(500).send("Internal server error");
    }
  },
  deleteProduct: async (req: Request, res: Response) => {
    try {
      console.log("deleteProduct");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { productId } = req.body;

      const product = await Product.findOne({ where: { productId } });

      if (!product) {
        res.status(400).send("No products found");
      }

      await product?.update({ isArchived: true });

      res.status(200).send(product);
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).send("Internal server error");
    }
  },
  newProduct: async (req: Request, res: Response) => {
    try {
      console.log("addProduct");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const product = await Product.create();

      if (!product) {
        res.status(400).send("No products found");
      }

      res.status(200).send(product);
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).send("Internal server error");
    }
  },
};
