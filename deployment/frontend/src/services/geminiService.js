// Gemini AI Service for enhanced skincare recommendations
class GeminiService {
  constructor() {
    // Fallback to provided key if env var isn't set
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyDqepatWNj5NcFQqXCoAOVlkU_hMnRsAW8";
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async generateSkincareAnalysis(quizResponses) {
    try {
      const prompt = this.createAnalysisPrompt(quizResponses);
      const response = await this.callGeminiAPI(prompt);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Error generating skincare analysis:', error);
      throw error;
    }
  }

  async chat(messages) {
    // Call backend proxy (avoids CORS and keeps key server-side)
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    if (!response.ok) throw new Error(`AI proxy error: ${response.status}`);
    const data = await response.json();
    return data.reply || '';
  }

  async generateProductRecommendations(quizResponses, availableProducts) {
    try {
      const prompt = this.createProductRecommendationPrompt(quizResponses, availableProducts);
      const response = await this.callGeminiAPI(prompt);
      return this.parseProductRecommendations(response);
    } catch (error) {
      console.error('Error generating product recommendations:', error);
      throw error;
    }
  }

  async generatePersonalizedTips(quizResponses) {
    try {
      const prompt = this.createTipsPrompt(quizResponses);
      const response = await this.callGeminiAPI(prompt);
      return this.parseTipsResponse(response);
    } catch (error) {
      console.error('Error generating personalized tips:', error);
      throw error;
    }
  }

  createAnalysisPrompt(quizResponses) {
    const { skinType, concerns, finishPreference, lifestyle, budget, skinTone, ageRange } = quizResponses;
    
    return `As a professional dermatologist and skincare expert, analyze this skin profile and provide detailed recommendations:

SKIN PROFILE:
- Skin Type: ${skinType}
- Main Concerns: ${concerns.join(', ')}
- Finish Preference: ${finishPreference.join(', ')}
- Lifestyle: ${lifestyle.join(', ')}
- Budget Range: ${budget}
- Skin Tone: ${skinTone}
- Age Range: ${ageRange}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "skinAnalysis": {
    "primaryConcerns": ["top 3 concerns"],
    "skinCondition": "detailed description",
    "recommendedFocus": "main areas to focus on"
  },
  "routineRecommendations": {
    "morning": ["step 1", "step 2", "step 3"],
    "evening": ["step 1", "step 2", "step 3"],
    "weekly": ["treatment 1", "treatment 2"]
  },
  "productGuidelines": {
    "avoidIngredients": ["ingredient 1", "ingredient 2"],
    "seekIngredients": ["ingredient 1", "ingredient 2"],
    "texturePreferences": "recommended textures"
  },
  "lifestyleTips": [
    "tip 1",
    "tip 2",
    "tip 3",
    "tip 4",
    "tip 5"
  ]
}

Focus on practical, actionable advice that matches their budget and lifestyle.`;
  }

  createProductRecommendationPrompt(quizResponses, availableProducts) {
    const { skinType, concerns, budget, finishPreference } = quizResponses;
    
    return `Based on this skin profile, recommend the best products from the available options:

SKIN PROFILE:
- Skin Type: ${skinType}
- Concerns: ${concerns.join(', ')}
- Budget: ${budget}
- Finish Preference: ${finishPreference.join(', ')}

AVAILABLE PRODUCTS:
${availableProducts.map(product => 
  `- ${product.name}: $${product.price} - ${product.description} - Category: ${product.category}`
).join('\n')}

Please recommend 6 products in JSON format:
{
  "recommendations": [
    {
      "productName": "exact product name",
      "priority": "high/medium/low",
      "reason": "why this product is perfect for them",
      "usage": "when and how to use",
      "expectedResults": "what results to expect"
    }
  ]
}

Prioritize products that match their budget range and address their main concerns.`;
  }

  createTipsPrompt(quizResponses) {
    const { skinType, concerns, lifestyle, ageRange } = quizResponses;
    
    return `Generate 5 personalized skincare tips for this profile:

SKIN PROFILE:
- Skin Type: ${skinType}
- Concerns: ${concerns.join(', ')}
- Lifestyle: ${lifestyle.join(', ')}
- Age Range: ${ageRange}

Provide tips in JSON format:
{
  "tips": [
    {
      "title": "tip title",
      "description": "detailed explanation",
      "category": "routine/ingredients/lifestyle/prevention"
    }
  ]
}

Make tips specific to their skin type, concerns, and lifestyle. Include practical advice they can implement immediately.`;
  }

  async callGeminiAPI(prompt) {
    const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
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
    return data.candidates[0].content.parts[0].text;
  }

  parseAnalysisResponse(response) {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      // Return fallback analysis
      return {
        skinAnalysis: {
          primaryConcerns: ["General skin health"],
          skinCondition: "Based on your responses, focus on maintaining healthy skin",
          recommendedFocus: "Consistent routine and proper product selection"
        },
        routineRecommendations: {
          morning: ["Gentle cleanser", "Moisturizer", "Sunscreen"],
          evening: ["Makeup remover", "Cleanser", "Moisturizer"],
          weekly: ["Exfoliating treatment"]
        },
        productGuidelines: {
          avoidIngredients: ["Harsh sulfates", "Alcohol"],
          seekIngredients: ["Hyaluronic acid", "Niacinamide"],
          texturePreferences: "Lightweight, non-comedogenic"
        },
        lifestyleTips: [
          "Stay hydrated throughout the day",
          "Get adequate sleep for skin repair",
          "Use sunscreen daily",
          "Eat a balanced diet rich in antioxidants",
          "Manage stress levels"
        ]
      };
    }
  }

  parseProductRecommendations(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing product recommendations:', error);
      return {
        recommendations: []
      };
    }
  }

  parseTipsResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing tips response:', error);
      return {
        tips: []
      };
    }
  }
}

const geminiServiceInstance = new GeminiService();
export default geminiServiceInstance;
