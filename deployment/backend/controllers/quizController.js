import asyncHandler from "express-async-handler";
import QuizResponse from "../models/quizResponseModel.js";
import Product from "../models/productModel.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

// @desc    Submit quiz responses and get analysis
// @route   POST /api/quiz/submit
// @access  Public
const submitQuiz = asyncHandler(async (req, res) => {
  const { responses, userId = null } = req.body;
  
  // Generate session ID if not provided
  const sessionId = req.body.sessionId || uuidv4();

  // Validate required fields
  if (!responses || !responses.skinType || !responses.budget) {
    res.status(400);
    throw new Error("Missing required quiz responses");
  }

  // Generate analysis based on responses
  const analysis = generateSkinAnalysis(responses);

  // Get recommended products (include full product fields needed for UI)
  const recommendedProducts = await getRecommendedProducts(responses, analysis);

  // Enhance analysis with Gemini AI if available
  let enhancedAnalysis = analysis;
  try {
    if (process.env.GEMINI_API_KEY) {
      enhancedAnalysis = await enhanceWithGeminiAI(responses, analysis);
    }
  } catch (error) {
    console.log('Gemini AI enhancement failed, using basic analysis:', error.message);
  }

  // Create quiz response
  const quizResponse = new QuizResponse({
    userId,
    sessionId,
    responses,
    analysis: {
      ...enhancedAnalysis,
      recommendedProducts,
    },
  });

  const savedResponse = await quizResponse.save();

  res.status(201).json({
    success: true,
    data: savedResponse,
    analysis: {
      ...enhancedAnalysis,
      recommendedProducts,
    },
  });
});

// @desc    Get quiz response by session ID
// @route   GET /api/quiz/:sessionId
// @access  Public
const getQuizResponse = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const quizResponse = await QuizResponse.findOne({ 
    sessionId, 
    isActive: true 
  }).populate('analysis.recommendedProducts.productId');

  if (!quizResponse) {
    res.status(404);
    throw new Error("Quiz response not found");
  }

  res.json({
    success: true,
    data: quizResponse,
  });
});

// @desc    Get quiz statistics
// @route   GET /api/quiz/stats
// @access  Public
const getQuizStats = asyncHandler(async (req, res) => {
  const stats = await QuizResponse.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalResponses: { $sum: 1 },
        skinTypes: {
          $push: "$responses.skinType"
        },
        concerns: {
          $push: "$responses.concerns"
        },
        budgets: {
          $push: "$responses.budget"
        }
      }
    }
  ]);

  // Process the data
  const processedStats = {
    totalResponses: stats[0]?.totalResponses || 0,
    skinTypeDistribution: getDistribution(stats[0]?.skinTypes || []),
    topConcerns: getTopConcerns(stats[0]?.concerns || []),
    budgetDistribution: getDistribution(stats[0]?.budgets || []),
  };

  res.json({
    success: true,
    data: processedStats,
  });
});

// Helper function to generate skin analysis
const generateSkinAnalysis = (responses) => {
  const { skinType, concerns, finishPreference, lifestyle, budget, skinTone, ageRange } = responses;

  // Primary concerns analysis
  const primaryConcerns = concerns.slice(0, 3); // Top 3 concerns

  // Generate skincare routine based on responses
  const skinCareRoutine = generateSkinCareRoutine(skinType, concerns, ageRange);

  // Generate personalized tips
  const tips = generatePersonalizedTips(skinType, concerns, lifestyle, ageRange);

  return {
    primaryConcerns,
    skinCareRoutine,
    tips,
  };
};

// Helper function to get recommended products
const getRecommendedProducts = async (responses, analysis) => {
  const { skinType, concerns, budget, finishPreference } = responses;
  
  // Build query based on responses
  const query = { isActive: true };
  
  // Add budget filter
  const budgetRanges = {
    budget: { $lte: 25 },
    "mid-range": { $gte: 26, $lte: 75 },
    premium: { $gte: 76, $lte: 150 },
    luxury: { $gte: 151 },
  };
  
  if (budgetRanges[budget]) {
    query.price = budgetRanges[budget];
  }

  // Get products that match the criteria
  const products = await Product.find(query).limit(20);

  // Score and rank products based on responses
  const scoredProducts = products.map(product => ({
    productId: product._id,
    score: calculateProductScore(product, responses, analysis),
    product: product,
  }));

  // Sort by score and take top 6
  const topProducts = scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item, index) => ({
      productId: item.productId,
      product: {
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        description: item.product.description,
        image: item.product.image,
        category: item.product.category,
      },
      reason: generateProductReason(item.product, responses, analysis),
      priority: index < 3 ? "high" : index < 5 ? "medium" : "low",
    }));

  return topProducts;
};

// Helper function to calculate product score
const calculateProductScore = (product, responses, analysis) => {
  let score = 0;
  const { skinType, concerns, finishPreference } = responses;

  // Base score
  score += 10;

  // Skin type match
  if (product.category && product.category.toLowerCase().includes(skinType)) {
    score += 20;
  }

  // Concerns match
  concerns.forEach(concern => {
    if (product.description && product.description.toLowerCase().includes(concern)) {
      score += 15;
    }
  });

  // Price appropriateness
  const price = product.price || 0;
  if (responses.budget === "budget" && price <= 25) score += 10;
  else if (responses.budget === "mid-range" && price >= 26 && price <= 75) score += 10;
  else if (responses.budget === "premium" && price >= 76 && price <= 150) score += 10;
  else if (responses.budget === "luxury" && price >= 151) score += 10;

  return score;
};

// Helper function to generate product reason
const generateProductReason = (product, responses, analysis) => {
  const { skinType, concerns } = responses;
  const reasons = [];

  if (product.category && product.category.toLowerCase().includes(skinType)) {
    reasons.push(`Perfect for ${skinType} skin`);
  }

  concerns.slice(0, 2).forEach(concern => {
    if (product.description && product.description.toLowerCase().includes(concern)) {
      reasons.push(`Addresses ${concern.replace("-", " ")}`);
    }
  });

  if (reasons.length === 0) {
    reasons.push("Recommended based on your skin profile");
  }

  return reasons.join(", ");
};

// Helper function to generate skincare routine
const generateSkinCareRoutine = (skinType, concerns, ageRange) => {
  const routines = {
    morning: [],
    evening: [],
    weekly: [],
  };

  // Base routine for all skin types
  routines.morning = ["Gentle cleanser", "Moisturizer", "Sunscreen SPF 30+"];
  routines.evening = ["Makeup remover", "Cleanser", "Moisturizer"];

  // Add specific steps based on skin type
  if (skinType === "oily") {
    routines.morning.push("Oil-free moisturizer");
    routines.evening.push("Exfoliating treatment");
  } else if (skinType === "dry") {
    routines.morning.push("Hydrating serum");
    routines.evening.push("Rich night cream");
  } else if (skinType === "sensitive") {
    routines.morning = ["Gentle cleanser", "Soothing moisturizer", "Mineral sunscreen"];
    routines.evening = ["Gentle makeup remover", "Gentle cleanser", "Calming moisturizer"];
  }

  // Add weekly treatments
  if (concerns.includes("acne")) {
    routines.weekly.push("Salicylic acid treatment");
  }
  if (concerns.includes("aging") || ageRange === "36+") {
    routines.weekly.push("Retinol treatment");
  }
  if (concerns.includes("dullness")) {
    routines.weekly.push("Vitamin C treatment");
  }

  return routines;
};

// Helper function to generate personalized tips
const generatePersonalizedTips = (skinType, concerns, lifestyle, ageRange) => {
  const tips = [];

  // Skin type specific tips
  if (skinType === "oily") {
    tips.push("Use oil-free products to prevent clogged pores");
    tips.push("Don't skip moisturizer - your skin still needs hydration");
  } else if (skinType === "dry") {
    tips.push("Apply moisturizer while skin is still damp for better absorption");
    tips.push("Consider using a humidifier at night");
  } else if (skinType === "sensitive") {
    tips.push("Always patch test new products before full application");
    tips.push("Avoid products with fragrance and harsh chemicals");
  }

  // Concern specific tips
  if (concerns.includes("acne")) {
    tips.push("Be consistent with your routine - results take 4-6 weeks");
    tips.push("Don't over-exfoliate as it can worsen acne");
  }
  if (concerns.includes("aging")) {
    tips.push("Sunscreen is your best anti-aging product");
    tips.push("Start with retinol gradually to avoid irritation");
  }

  // Lifestyle tips
  if (lifestyle.includes("workout")) {
    tips.push("Cleanse your face immediately after working out");
  }
  if (lifestyle.includes("travel")) {
    tips.push("Keep your routine simple when traveling");
  }

  return tips.slice(0, 5); // Return top 5 tips
};

// Helper functions for statistics
const getDistribution = (array) => {
  const distribution = {};
  array.forEach(item => {
    distribution[item] = (distribution[item] || 0) + 1;
  });
  return distribution;
};

const getTopConcerns = (concernsArray) => {
  const concernCount = {};
  concernsArray.flat().forEach(concern => {
    concernCount[concern] = (concernCount[concern] || 0) + 1;
  });
  
  return Object.entries(concernCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([concern, count]) => ({ concern, count }));
};

// Helper function to enhance analysis with Gemini AI
const enhanceWithGeminiAI = async (responses, basicAnalysis) => {
  try {
    const prompt = `As a professional dermatologist, enhance this skincare analysis:

SKIN PROFILE:
- Skin Type: ${responses.skinType}
- Concerns: ${responses.concerns.join(', ')}
- Finish Preference: ${responses.finishPreference.join(', ')}
- Lifestyle: ${responses.lifestyle.join(', ')}
- Budget: ${responses.budget}
- Skin Tone: ${responses.skinTone}
- Age Range: ${responses.ageRange}

CURRENT ANALYSIS:
${JSON.stringify(basicAnalysis, null, 2)}

Please provide an enhanced analysis in JSON format with more detailed, personalized recommendations:
{
  "primaryConcerns": ["enhanced concern analysis"],
  "skinCareRoutine": {
    "morning": ["detailed morning steps"],
    "evening": ["detailed evening steps"],
    "weekly": ["weekly treatments"]
  },
  "tips": ["5 personalized tips based on their profile"],
  "additionalInsights": {
    "skinCondition": "detailed skin condition analysis",
    "recommendedFocus": "specific areas to focus on",
    "avoidIngredients": ["ingredients to avoid"],
    "seekIngredients": ["beneficial ingredients"]
  }
}

Make the recommendations more specific to their skin type, age, and lifestyle.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const enhancedData = JSON.parse(jsonMatch[0]);
      return {
        ...basicAnalysis,
        ...enhancedData,
        enhancedByAI: true
      };
    }
    
    return basicAnalysis;
  } catch (error) {
    console.error('Gemini AI enhancement error:', error);
    return basicAnalysis;
  }
};

export {
  submitQuiz,
  getQuizResponse,
  getQuizStats,
};
