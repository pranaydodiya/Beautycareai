import asyncHandler from "express-async-handler";
import SkincareTip from "../models/skincareTipModel.js";

// @desc    Get all skincare tips
// @route   GET /api/skincare-tips
// @access  Public
const getSkincareTips = asyncHandler(async (req, res) => {
  const {
    skinType = "all",
    concerns = "",
    category = "",
    search = "",
    difficulty = "",
    featured = "",
    page = 1,
    limit = 12,
  } = req.query;

  // Build filter using $and so search does not overwrite other criteria
  const base = { isActive: true };
  const andConditions = [];

  if (skinType && skinType !== "all") {
    andConditions.push({ $or: [ { skinType }, { skinType: "all" } ] });
  }

  if (concerns) {
    const concernArray = concerns.split(",").filter(c => c.trim());
    if (concernArray.length > 0) {
      andConditions.push({ concerns: { $in: concernArray } });
    }
  }

  if (category) {
    andConditions.push({ category });
  }

  if (difficulty) {
    andConditions.push({ difficulty });
  }

  if (featured === "true") {
    andConditions.push({ featured: true });
  }

  if (search) {
    andConditions.push({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ],
    });
  }

  const filter = andConditions.length > 0 ? { $and: [base, ...andConditions] } : base;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const tips = await SkincareTip.find(filter)
    .sort({ featured: -1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await SkincareTip.countDocuments(filter);

  res.json({
    tips,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// @desc    Get single skincare tip
// @route   GET /api/skincare-tips/:id
// @access  Public
const getSkincareTipById = asyncHandler(async (req, res) => {
  const tip = await SkincareTip.findById(req.params.id);

  if (tip && tip.isActive) {
    // Increment view count
    tip.views += 1;
    await tip.save();
    
    res.json(tip);
  } else {
    res.status(404);
    throw new Error("Skincare tip not found");
  }
});

// @desc    Create new skincare tip
// @route   POST /api/skincare-tips
// @access  Private/Admin
const createSkincareTip = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    fullContent,
    skinType,
    concerns,
    category,
    difficulty,
    duration,
    image,
    icon,
    tags,
    featured,
  } = req.body;

  const tip = new SkincareTip({
    title,
    description,
    fullContent,
    skinType: skinType || "all",
    concerns: concerns || [],
    category,
    difficulty: difficulty || "beginner",
    duration,
    image: image || "",
    icon: icon || "",
    tags: tags || [],
    featured: featured || false,
  });

  const createdTip = await tip.save();
  res.status(201).json(createdTip);
});

// @desc    Update skincare tip
// @route   PUT /api/skincare-tips/:id
// @access  Private/Admin
const updateSkincareTip = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    fullContent,
    skinType,
    concerns,
    category,
    difficulty,
    duration,
    image,
    icon,
    tags,
    featured,
    isActive,
  } = req.body;

  const tip = await SkincareTip.findById(req.params.id);

  if (tip) {
    tip.title = title || tip.title;
    tip.description = description || tip.description;
    tip.fullContent = fullContent || tip.fullContent;
    tip.skinType = skinType || tip.skinType;
    tip.concerns = concerns || tip.concerns;
    tip.category = category || tip.category;
    tip.difficulty = difficulty || tip.difficulty;
    tip.duration = duration || tip.duration;
    tip.image = image !== undefined ? image : tip.image;
    tip.icon = icon !== undefined ? icon : tip.icon;
    tip.tags = tags || tip.tags;
    tip.featured = featured !== undefined ? featured : tip.featured;
    tip.isActive = isActive !== undefined ? isActive : tip.isActive;

    const updatedTip = await tip.save();
    res.json(updatedTip);
  } else {
    res.status(404);
    throw new Error("Skincare tip not found");
  }
});

// @desc    Delete skincare tip
// @route   DELETE /api/skincare-tips/:id
// @access  Private/Admin
const deleteSkincareTip = asyncHandler(async (req, res) => {
  const tip = await SkincareTip.findById(req.params.id);

  if (tip) {
    await SkincareTip.deleteOne({ _id: tip._id });
    res.json({ message: "Skincare tip removed" });
  } else {
    res.status(404);
    throw new Error("Skincare tip not found");
  }
});

// @desc    Like a skincare tip
// @route   POST /api/skincare-tips/:id/like
// @access  Public
const likeSkincareTip = asyncHandler(async (req, res) => {
  const tip = await SkincareTip.findById(req.params.id);

  if (tip && tip.isActive) {
    tip.likes += 1;
    await tip.save();
    res.json({ likes: tip.likes });
  } else {
    res.status(404);
    throw new Error("Skincare tip not found");
  }
});

// @desc    Get skincare tip categories
// @route   GET /api/skincare-tips/categories
// @access  Public
const getSkincareTipCategories = asyncHandler(async (req, res) => {
  const categories = await SkincareTip.distinct("category", { isActive: true });
  res.json(categories);
});

// @desc    Get skincare tip concerns
// @route   GET /api/skincare-tips/concerns
// @access  Public
const getSkincareTipConcerns = asyncHandler(async (req, res) => {
  const concerns = await SkincareTip.distinct("concerns", { isActive: true });
  const flatConcerns = concerns.flat();
  const uniqueConcerns = [...new Set(flatConcerns)];
  res.json(uniqueConcerns);
});

export {
  getSkincareTips,
  getSkincareTipById,
  createSkincareTip,
  updateSkincareTip,
  deleteSkincareTip,
  likeSkincareTip,
  getSkincareTipCategories,
  getSkincareTipConcerns,
};
