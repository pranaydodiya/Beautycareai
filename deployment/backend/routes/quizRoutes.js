import express from "express";
const router = express.Router();
import {
  submitQuiz,
  getQuizResponse,
  getQuizStats,
} from "../controllers/quizController.js";

router.route("/submit").post(submitQuiz);
router.route("/stats").get(getQuizStats);
router.route("/:sessionId").get(getQuizResponse);

export default router;
