import Product from "../models/productModel.js";
import axios from "axios";

// @desc    Analyze face and get skincare recommendations
// @route   POST /api/face-analysis/analyze
// @access  Private
const analyzeFace = async (req, res) => {
  try {
    console.log("Face analysis request received");
    console.log("Request body size:", JSON.stringify(req.body).length, "characters");
    
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "No image provided"
      });
    }

    console.log("Image data length:", image.length, "characters");

    // Call Python service for face analysis
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:5001";
    
    console.log("Calling Python service at:", pythonServiceUrl);
    
    const analysisResponse = await axios.post(`${pythonServiceUrl}/analyze`, {
      image: image
    }, {
      timeout: 120000, // allow up to 2 minutes for first-run model downloads
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!analysisResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: analysisResponse.data.error
      });
    }

    const analysis = analysisResponse.data.analysis;

    // Get product recommendations based on analysis
    const recommendations = await getProductRecommendations(analysis);

    res.json({
      success: true,
      analysis: analysis,
      recommendations: recommendations
    });

  } catch (error) {
    console.error("Face analysis error:", error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(500).json({
        success: false,
        message: "Face analysis service is not available. Please try again later."
      });
    }
    
    if (error.response) {
      console.error("Python service error:", error.response.data);
      return res.status(500).json({
        success: false,
        message: error.response.data.error || "Face analysis failed. Please try again."
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Face analysis failed. Please try again."
    });
  }
};

// @desc    Get product recommendations based on face analysis
// @route   GET /api/face-analysis/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const { skinTone, undertone, concerns, age, gender } = req.query;

    const analysis = {
      skin_tone: skinTone,
      undertone: undertone,
      concerns: concerns ? concerns.split(',') : [],
      age: parseInt(age) || 25,
      gender: gender
    };

    const recommendations = await getProductRecommendations(analysis);

    res.json({
      success: true,
      recommendations: recommendations
    });

  } catch (error) {
    console.error("Recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get recommendations"
    });
  }
};

// Helper function to get product recommendations
const getProductRecommendations = async (analysis) => {
  try {
    const { skin_tone, undertone, concerns, age, gender } = analysis;
    
    // Define concern-based product mappings
    const concernMappings = {
      'acne': ['anti-acne', 'cleanser', 'toner', 'spot treatment'],
      'wrinkles': ['anti-aging', 'serum', 'moisturizer', 'eye cream'],
      'dullness': ['brightening', 'vitamin c', 'exfoliant', 'glow'],
      'redness': ['soothing', 'calming', 'anti-inflammatory', 'gentle'],
      'aging': ['anti-aging', 'firming', 'collagen', 'retinol']
    };

    // Define skin tone based recommendations
    const skinToneMappings = {
      'fair': ['light coverage', 'sheer', 'tinted moisturizer'],
      'light-medium': ['medium coverage', 'buildable'],
      'medium': ['full coverage', 'long-lasting'],
      'dark': ['rich pigmentation', 'deep tones']
    };

    // Define undertone based recommendations
    const undertoneMappings = {
      'warm': ['golden', 'peachy', 'warm undertones'],
      'cool': ['pink', 'cool undertones', 'blue-based'],
      'neutral': ['neutral', 'balanced']
    };

    // Build search criteria
    let searchCriteria = [];
    
    // Add concern-based keywords
    concerns.forEach(concern => {
      if (concernMappings[concern]) {
        searchCriteria = searchCriteria.concat(concernMappings[concern]);
      }
    });

    // Add skin tone keywords
    if (skinToneMappings[skin_tone]) {
      searchCriteria = searchCriteria.concat(skinToneMappings[skin_tone]);
    }

    // Add undertone keywords
    if (undertoneMappings[undertone]) {
      searchCriteria = searchCriteria.concat(undertoneMappings[undertone]);
    }

    // Get all products
    const allProducts = await Product.find({});

    // Score products based on relevance
    const scoredProducts = allProducts.map(product => {
      let score = 0;
      const productText = `${product.name} ${product.description} ${product.brand} ${product.category}`.toLowerCase();

      // Score based on concern keywords
      concerns.forEach(concern => {
        if (concernMappings[concern]) {
          concernMappings[concern].forEach(keyword => {
            if (productText.includes(keyword.toLowerCase())) {
              score += 3;
            }
          });
        }
      });

      // Score based on skin tone keywords
      if (skinToneMappings[skin_tone]) {
        skinToneMappings[skin_tone].forEach(keyword => {
          if (productText.includes(keyword.toLowerCase())) {
            score += 2;
          }
        });
      }

      // Score based on undertone keywords
      if (undertoneMappings[undertone]) {
        undertoneMappings[undertone].forEach(keyword => {
          if (productText.includes(keyword.toLowerCase())) {
            score += 2;
          }
        });
      }

      // Age-based scoring
      if (age > 30) {
        if (productText.includes('anti-aging') || productText.includes('firming') || productText.includes('wrinkle')) {
          score += 2;
        }
      }

      // Gender-based scoring (if applicable)
      if (gender && gender.toLowerCase() === 'man') {
        if (productText.includes('men') || productText.includes('beard') || productText.includes('grooming')) {
          score += 1;
        }
      }

      return { product, score };
    });

    // Sort by score and get top recommendations
    const topProducts = scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.product);

    // If we don't have enough scored products, add some general recommendations
    if (topProducts.length < 3) {
      const generalProducts = allProducts
        .filter(product => !topProducts.some(top => top._id.toString() === product._id.toString()))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3 - topProducts.length);
      
      topProducts.push(...generalProducts);
    }

    // Add explanation for each recommendation
    const recommendationsWithExplanations = topProducts.map(product => {
      const explanation = generateRecommendationExplanation(product, analysis);
      return {
        ...product.toObject(),
        explanation: explanation
      };
    });

    return recommendationsWithExplanations;

  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
};

// Helper function to generate explanation for each recommendation
const generateRecommendationExplanation = (product, analysis) => {
  const { skin_tone, undertone, concerns } = analysis;
  const productText = `${product.name} ${product.description}`.toLowerCase();
  
  let explanations = [];

  // Concern-based explanations
  if (concerns.includes('acne') && (productText.includes('anti-acne') || productText.includes('cleanser'))) {
    explanations.push("Perfect for acne-prone skin - helps control breakouts and clear blemishes");
  }
  
  if (concerns.includes('wrinkles') && (productText.includes('anti-aging') || productText.includes('firming'))) {
    explanations.push("Targets fine lines and wrinkles for a more youthful appearance");
  }
  
  if (concerns.includes('dullness') && (productText.includes('brightening') || productText.includes('glow'))) {
    explanations.push("Brightens dull skin and restores natural radiance");
  }
  
  if (concerns.includes('redness') && (productText.includes('soothing') || productText.includes('calming'))) {
    explanations.push("Soothes irritated skin and reduces redness");
  }

  // Skin tone based explanations
  if (skin_tone === 'fair' && productText.includes('light')) {
    explanations.push("Lightweight formula perfect for fair skin tones");
  }
  
  if (skin_tone === 'dark' && productText.includes('rich')) {
    explanations.push("Rich pigmentation ideal for deeper skin tones");
  }

  // Undertone based explanations
  if (undertone === 'warm' && (productText.includes('golden') || productText.includes('warm'))) {
    explanations.push("Warm undertones complement your golden complexion");
  }
  
  if (undertone === 'cool' && (productText.includes('cool') || productText.includes('pink'))) {
    explanations.push("Cool undertones enhance your natural pink undertones");
  }

  // Default explanation if no specific match
  if (explanations.length === 0) {
    explanations.push("Recommended based on your skin analysis and high customer ratings");
  }

  return explanations.join(". ");
};

export { analyzeFace, getRecommendations };
