import React, { useEffect, useRef } from "react";
// GSAP removed for minimal transitions
import { Link } from "react-router-dom";

const QuizResults = ({ data }) => {
  const resultsRef = useRef(null);
  const cardsRef = useRef([]);
  const analysisRef = useRef(null);

  useEffect(() => {}, []);

  const { analysis, responses } = data.data || data;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-pink-500";
      case "medium":
        return "bg-pink-400";
      case "low":
        return "bg-pink-300";
      default:
        return "bg-pink-400";
    }
  };

  // Convert USD to INR (approximate rate: 1 USD = 83 INR)
  const convertToINR = (priceLike) => {
    const num = typeof priceLike === 'number' ? priceLike : parseFloat(String(priceLike).toString().replace(/[^0-9.]/g, '')) || 0;
    const inrPrice = Math.round(num * 83);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(inrPrice || 0);
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "Must Have";
      case "medium":
        return "Recommended";
      case "low":
        return "Optional";
      default:
        return "Recommended";
    }
  };

  // Save brief summary for Beauty Assistant gating
  try {
    const summary = {
      skinType: responses?.skinType,
      concerns: analysis?.primaryConcerns || [],
      budget: responses?.budget,
    };
    localStorage.setItem('quiz:summary', JSON.stringify(summary));
  } catch {}

  return (
    <div className="min-h-screen bg-pink-50 pt-24">
      <div ref={resultsRef} className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-pink-600 mb-4">
            Your Skin Analysis
          </h1>
          <p className="text-xl text-pink-500 max-w-2xl mx-auto">
            Based on your responses, here's your personalized skincare routine
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analysis Section */}
          <div ref={analysisRef} className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h3 className="text-2xl font-bold text-pink-600 mb-4">Your Skin Profile</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-pink-500 font-semibold">Skin Type:</span>
                  <p className="text-lg text-pink-700 capitalize">{responses.skinType}</p>
                </div>
                
                <div>
                  <span className="text-sm text-pink-500 font-semibold">Main Concerns:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.primaryConcerns.map((concern, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                      >
                        {concern.replace("-", " ")}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-pink-500 font-semibold">Budget Range:</span>
                  <p className="text-lg text-pink-700 capitalize">{responses.budget}</p>
                </div>
              </div>
            </div>

            {/* Skincare Routine */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h3 className="text-2xl font-bold text-pink-600 mb-4">Your Routine</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-pink-700 mb-2">Morning</h4>
                  <ul className="space-y-1">
                    {analysis.skinCareRoutine.morning.map((step, index) => (
                      <li key={index} className="text-pink-600 flex items-center">
                        <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-pink-700 mb-2">Evening</h4>
                  <ul className="space-y-1">
                    {analysis.skinCareRoutine.evening.map((step, index) => (
                      <li key={index} className="text-pink-600 flex items-center">
                        <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {analysis.skinCareRoutine.weekly.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-pink-700 mb-2">Weekly</h4>
                    <ul className="space-y-1">
                      {analysis.skinCareRoutine.weekly.map((step, index) => (
                        <li key={index} className="text-pink-600 flex items-center">
                          <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-pink-600 mb-4">
                Personalized Tips
                {analysis.enhancedByAI && (
                  <span className="ml-2 text-sm bg-pink-500 text-white px-3 py-1 rounded-full">
                    ✨ AI Enhanced
                  </span>
                )}
              </h3>
              <ul className="space-y-3">
                {analysis.tips.map((tip, index) => (
                  <li key={index} className="text-pink-600 flex items-start">
                    <span className="text-pink-400 mr-3 mt-1">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional AI Insights */}
            {analysis.additionalInsights && (
              <div className="bg-pink-100 rounded-xl p-6 shadow-md">
                <h3 className="text-2xl font-bold text-pink-600 mb-4 flex items-center">
                  <span className="mr-2">🤖</span>
                  AI-Powered Insights
                </h3>
                
                {analysis.additionalInsights.skinCondition && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-pink-700 mb-2">Skin Condition Analysis</h4>
                    <p className="text-pink-600">{analysis.additionalInsights.skinCondition}</p>
                  </div>
                )}

                {analysis.additionalInsights.recommendedFocus && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-pink-700 mb-2">Recommended Focus</h4>
                    <p className="text-pink-600">{analysis.additionalInsights.recommendedFocus}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.additionalInsights.avoidIngredients && (
                    <div>
                      <h4 className="text-lg font-semibold text-pink-700 mb-2">Avoid These Ingredients</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.additionalInsights.avoidIngredients.map((ingredient, index) => (
                          <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.additionalInsights.seekIngredients && (
                    <div>
                      <h4 className="text-lg font-semibold text-pink-700 mb-2">Look For These Ingredients</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.additionalInsights.seekIngredients.map((ingredient, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recommended Products */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-pink-600 mb-2">Recommended Products</h3>
              <p className="text-pink-500">Curated just for your skin type and concerns</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.recommendedProducts.map((item, index) => (
                <div
                  key={index}
                  ref={(el) => (cardsRef.current[index] = el)}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                >
                  {/* Product Image Placeholder */}
                  <div className="w-full h-36 bg-pink-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.product?.name || `Product ${index+1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-4xl text-pink-400">✨</div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-bold text-pink-700 line-clamp-1">
                        {item.product?.name || `Product ${index + 1}`}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getPriorityColor(
                          item.priority
                        )}`}
                      >
                        {getPriorityText(item.priority)}
                      </span>
                    </div>
                    
                    <p className="text-pink-600 text-sm mb-1 line-clamp-2">
                      {item.product?.description || "Perfect for your skin type and concerns"}
                    </p>
                    
                    <p className="text-pink-500 text-sm font-medium">
                      {item.reason}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xl font-bold text-pink-600">
                      {convertToINR(item.product?.price || 25.99)}
                    </span>
                    <button className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-semibold hover:bg-pink-600 transition-all duration-200">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/skincare-tips"
                className="px-8 py-3 bg-white text-pink-600 border-2 border-pink-300 rounded-full font-semibold hover:bg-pink-50 hover:border-pink-400 transition-all duration-300 text-center"
              >
                View All Skincare Tips
              </Link>
              
              <Link
                to="/products"
                className="px-8 py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all duration-200 text-center"
              >
                Shop All Products
              </Link>
              
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-pink-100 text-pink-600 rounded-full font-semibold hover:bg-pink-200 transition-all duration-300"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
