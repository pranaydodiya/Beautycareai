import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import { createClerkClient } from "@clerk/backend";
import jwt from "jsonwebtoken";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    // First try: JWT from our app
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("Not authorized");
    }
    req.user = user;
    return next();
  } catch (_) {
    // Fallback: Clerk session token
    try {
      const session = await clerk.sessions.verifySessionToken(token);
      let user = await User.findOne({ email: session?.claims?.email });
      if (!user) {
        user = await User.create({
          name: session?.claims?.first_name || "User",
          email: session?.claims?.email,
          password: Math.random().toString(36).slice(2),
        });
      }
      req.user = user;
      return next();
    } catch (e) {
      res.status(401);
      throw new Error("Not authorized");
    }
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as admin");
  }
};

export { protect, admin };
