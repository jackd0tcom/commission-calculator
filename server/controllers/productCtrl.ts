import { Product } from "../model";
import { Request, Response } from "express";

export default {
  getProducts: async (req: Request, res: Response) => {
    try {
      console.log("getProducts");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const products = await Product.findAll({ where: { isArchived: false } });

      if (products) {
        res.send(products);
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
