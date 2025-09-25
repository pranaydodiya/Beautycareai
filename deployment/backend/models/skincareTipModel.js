import mongoose from "mongoose";

const skincareTipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    fullContent: {
      type: String,
      required: true,
    },
    skinType: {
      type: String,
      required: true,
      enum: ["all", "oily", "dry", "combination", "sensitive", "normal"],
      default: "all",
    },
    concerns: [{
      type: String,
      enum: ["acne", "aging", "dark-spots", "dryness", "oiliness", "sensitivity", "dullness", "uneven-tone", "pores", "hydration"],
    }],
    category: {
      type: String,
      required: true,
      enum: ["cleansing", "moisturizing", "protection", "treatment", "lifestyle", "ingredients"],
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    duration: {
      type: String, // e.g., "5 minutes", "10-15 minutes"
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const SkincareTip = mongoose.model("SkincareTip", skincareTipSchema);

export default SkincareTip;
