import { User } from "../model.js";
import { Request, Response } from "express";

export default {
  syncAuth0User: async (req: Request, res: Response) => {
    console.log("syncUser");
    try {
      const { auth0Id, email, name, picture } = req.body;

      // Check if user exists by auth0Id
      let user = await User.findOne({ where: { auth0Id } });
      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        // Create new user from Auth0 data
        const [firstName, ...lastNameParts] = name.split(" ");

        // Check if this is an admin user (support multiple emails)
        const adminEmails = process.env.ADMIN_EMAIL
          ? process.env.ADMIN_EMAIL.split(",").map((e) => e.trim())
          : [];
        const isAdmin = adminEmails.includes(email);

        console.log(`🔍 Admin check for ${email}:`);
        console.log(`   ADMIN_EMAIL env var: "${process.env.ADMIN_EMAIL}"`);
        console.log(
          `   Parsed admin emails: [${adminEmails.map((e) => `"${e}"`).join(", ")}]`,
        );
        console.log(`   Is admin: ${isAdmin}`);
        const userCount = await User.count();
        const isFirstUser = userCount === 0;

        user = await User.create({
          auth0Id,
          firstName,
          lastName: lastNameParts.join(" ") || "",
          email,
          profilePic: picture,
          isAdmin: isAdmin,
          isAllowed: isAdmin || isFirstUser, // Admin emails or first user gets access
        });

        if (isAdmin || isFirstUser) {
          console.log(
            `🎉 Admin user created: ${email} (${isAdmin ? "configured admin" : "first user"})`,
          );
        }
      }

      // Always sync user to session, let frontend handle access control
      console.log(
        `User synced: ${email} (${user.userId}) - Allowed: ${user.isAllowed}`,
      );

      // Set up session with your local user data
      req.session.user = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        profilePic: user.profilePic,
        isAllowed: user.isAllowed,
      };

      res.status(200).json({ user: req.session.user });
    } catch (err) {
      console.log("Sync Auth0 user error:", err);
      res.status(500).json({ message: "Failed to sync user" });
    }
  },
  getUsers: async (req: Request, res: Response) => {
    try {
      console.log("getUsers");

      if (!req.session.user) {
        res.status(401).send("No user signed in!");
        return;
      }

      const users = await User.findAll();

      if (users) {
        res.send(users);
      } else {
        res.status(400).send("No sheets found");
      }
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
  updateAdmin: async (req: Request, res: Response) => {
    try {
      console.log("getUsers");

      if (!req.session.user) {
        res.status(401).send("No user signed in!");
        return;
      }

      const { userId } = req.body;

      const user = await User.findOne({ where: { userId } });

      if (user.isAdmin) {
        await user?.update({ isAdmin: false });
      } else await user?.update({ isAdmin: true });

      if (user) {
        res.send(user);
      } else {
        res.status(400).send("No sheets found");
      }
    } catch (error) {
      console.error("Error getting sheets:", error);
      res.status(500).send("Internal server error");
    }
  },
};
