import { Vendor, VendorField, VendorProduct, Product } from "../model.js";
import { Request, Response } from "express";

export default {
  getVendors: async (req: Request, res: Response) => {
    console.log("getVendors");
    try {
      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const vendors = await Vendor.findAll({
        include: [
          {
            model: VendorProduct,
            include: [
              {
                model: VendorField,
              },
            ],
          },
        ],
      });

      res.status(200).send(vendors);
    } catch (err) {
      console.log("getting vendors error:", err);
      res.status(500).json({ message: "Failed to get vendors" });
    }
  },
  getVendor: async (req: Request, res: Response) => {
    console.log("getVendor");
    try {
      if (!req.session.user) {
        res.status(401).send("user not logged in / no session set up");
        return;
      }

      const { vendorId } = req.params;

      const vendor = await Vendor.findOne({
        where: {
          vendorId,
        },
        include: [
          {
            model: VendorProduct,
            include: [
              {
                model: VendorField,
              },
              {
                model: Product,
              },
            ],
          },
        ],
      });

      res.status(200).send(vendor);
    } catch (err) {
      console.log("getting vendors error:", err);
      res.status(500).json({ message: "Failed to get vendors" });
    }
  },
};
