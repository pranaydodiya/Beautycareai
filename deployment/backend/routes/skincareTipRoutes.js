import express from "express";
const router = express.Router();
import {
  getSkincareTips,
  getSkincareTipById,
  createSkincareTip,
  updateSkincareTip,
  deleteSkincareTip,
  likeSkincareTip,
  getSkincareTipCategories,
  getSkincareTipConcerns,
} from "../controllers/skincareTipController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router.route("/").get(getSkincareTips).post(protect, admin, createSkincareTip);
router.route("/categories").get(getSkincareTipCategories);
router.route("/concerns").get(getSkincareTipConcerns);
router.route("/:id/like").post(likeSkincareTip);
router
  .route("/:id")
  .get(getSkincareTipById)
  .put(protect, admin, updateSkincareTip)
  .delete(protect, admin, deleteSkincareTip);

export default router;
