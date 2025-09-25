import express from "express";
import { analyzeFace, getRecommendations } from "../controllers/faceAnalysisController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure router to handle large payloads
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ limit: '50mb', extended: true }));

// @route   POST /api/face-analysis/analyze
// @desc    Analyze face and get skincare recommendations
// @access  Public
router.route("/analyze").post(analyzeFace);

// @route   GET /api/face-analysis/recommendations
// @desc    Get product recommendations based on analysis
// @access  Private
router.route("/recommendations").get(protect, getRecommendations);

export default router;
