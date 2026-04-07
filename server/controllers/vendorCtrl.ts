import { Vendor, VendorField } from "../model.js";
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
            model: VendorField,
          },
        ],
      });

      res.status(200).send(vendors);
    } catch (err) {
      console.log("getting vendors error:", err);
      res.status(500).json({ message: "Failed to get vendors" });
    }
  },
};
