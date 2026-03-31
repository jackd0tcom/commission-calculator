import { User, Link } from "../model";
import { Request, Response } from "express";

export default {
  getLinks: async (req: Request, res: Response) => {
    try {
      console.log("getLinks");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const links = await Link.findAll({
        where: { isArchived: false },
        order: [["linkId", "DESC"]],
      });

      if (links) {
        res.send(links);
      } else {
        res.status(400).send("No links found");
      }
    } catch (error) {
      console.error("Error getting links:", error);
      res.status(500).send("Internal server error");
    }
  },
  getAdminLinks: async (req: Request, res: Response) => {
    try {
      console.log("getAdminLinks");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const links = await Link.findAll({
        where: { isArchived: false },
        order: [["linkId", "DESC"]],
      });

      const users = await User.findAll();

      const payload = {
        links: links,
        users: users,
      };

      if (links) {
        res.send(payload);
      } else {
        res.status(400).send("No links found");
      }
    } catch (error) {
      console.error("Error getting links:", error);
      res.status(500).send("Internal server error");
    }
  },
  updateLink: async (req: Request, res: Response) => {
    try {
      console.log("updateLink");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { linkId, fieldName, value } = req.body;

      const link = await Link.findOne({ where: { linkId } });

      if (!link) {
        res.status(400).send("No links found");
      }

      await link?.update({ [fieldName]: value });

      res.send(link);
    } catch (error) {
      console.error("Error getting links:", error);
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

      const { id, linkId, userId, commissionRate } = req.body;

      let commission;

      if (!commission && linkId && userId) {
        commission = await UserLinkCommission.findOne({
          where: { linkId, userId },
        });
      }

      if (!commission) {
        commission = await UserLinkCommission.create({
          linkId,
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
  deleteLink: async (req: Request, res: Response) => {
    try {
      console.log("deleteLink");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const { linkId } = req.body;

      const link = await Link.findOne({ where: { linkId } });

      if (!link) {
        res.status(400).send("No links found");
      }

      await link?.update({ isArchived: true });

      res.status(200).send(link);
    } catch (error) {
      console.error("Error getting links:", error);
      res.status(500).send("Internal server error");
    }
  },
  newLink: async (req: Request, res: Response) => {
    try {
      console.log("addLink");

      if (!req.session.user) {
        console.log("user not logged in / no session set up");
        return;
      }

      const link = await Link.create();

      if (!link) {
        res.status(400).send("No links found");
      }

      res.status(200).send(link);
    } catch (error) {
      console.error("Error getting links:", error);
      res.status(500).send("Internal server error");
    }
  },
};
