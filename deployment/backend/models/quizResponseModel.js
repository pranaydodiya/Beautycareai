import mongoose from "mongoose";

const quizResponseSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null, // Can be null for anonymous users
    },
    sessionId: {
      type: String,
      required: true,
    },
    responses: {
      skinType: {
        type: String,
        required: true,
        enum: ["oily", "dry", "combination", "sensitive", "normal"],
      },
      concerns: [{
        type: String,
        enum: ["acne", "aging", "dark-spots", "dryness", "oiliness", "sensitivity", "dullness", "uneven-tone", "pores", "hydration", "fine-lines", "hyperpigmentation"],
      }],
      finishPreference: [{
        type: String,
        enum: ["matte", "dewy", "natural", "satin", "glowy"],
      }],
      lifestyle: [{
        type: String,
        enum: ["minimal", "moderate", "extensive", "professional", "casual", "night-out", "workout", "travel"],
      }],
      budget: {
        type: String,
        required: true,
        enum: ["budget", "mid-range", "premium", "luxury"],
      },
      skinTone: {
        type: String,
        enum: ["fair", "light", "medium", "olive", "tan", "deep"],
      },
      ageRange: {
        type: String,
        enum: ["18-25", "26-35", "36-45", "46-55", "55+"],
      },
    },
    analysis: {
      primaryConcerns: [String],
      recommendedProducts: [{
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        reason: String,
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
        },
      }],
      skinCareRoutine: {
        morning: [String],
        evening: [String],
        weekly: [String],
      },
      tips: [String],
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const QuizResponse = mongoose.model("QuizResponse", quizResponseSchema);

export default QuizResponse;
