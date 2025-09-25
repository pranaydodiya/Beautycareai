import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../actions/cartActions';
import { useNavigate } from 'react-router-dom';
import { 
  FaCamera, 
  FaUpload, 
  FaSpinner, 
  FaCheckCircle, 
  FaShoppingCart,
  FaStar,
  FaEye,
  FaSmile,
  FaPalette,
  FaMagic
} from 'react-icons/fa';
import Meta from '../components/Meta';

const FaceAnalysisScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Removed authentication requirement for face analysis

  const handleImageSelect = (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setError('');
    setSelectedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleImageSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const analyzeFace = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target.result;
        
        try {
          const response = await fetch('/api/face-analysis/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64Image, fast: true })
          });
          
          const data = await response.json();
          
          if (data.success) {
            setAnalysis(data.analysis);
            setRecommendations(data.recommendations);
            if (data.annotatedImage) {
              setPreviewUrl(data.annotatedImage);
            }
          } else {
            setError(data.message || 'Analysis failed. Please try again.');
          }
        } catch (err) {
          setError('Network error. Please check your connection and try again.');
        }
      };
      
      reader.readAsDataURL(selectedImage);
    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToCartHandler = (productId) => {
    dispatch(addToCart(productId, 1));
  };

  const buyNowHandler = (productId) => {
    dispatch(addToCart(productId, 1));
    navigate('/cart');
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setRecommendations([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      <Meta title="Face Analysis - MetizCare" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mb-4">
            <FaSmile className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI-Powered Face Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a selfie to get personalized skincare recommendations based on your skin tone, 
            undertone, texture, and specific concerns.
          </p>
        </div>

        {/* Upload Section */}
        {!analysis && (
          <div className="max-w-2xl mx-auto mb-12">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-pink-400 bg-pink-50' 
                  : 'border-pink-300 bg-white/70 hover:border-pink-400 hover:bg-pink-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {!previewUrl ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full">
                    <FaCamera className="text-white text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Upload Your Selfie
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Drag and drop your image here, or click to browse
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <FaUpload className="text-pink-400" />
                      <span>JPG, PNG up to 5MB</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-48 h-48 object-cover rounded-2xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <FaCamera className="text-white text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Image Selected
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Click to change or drag a new image
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {previewUrl && (
              <div className="mt-6 text-center">
                <button
                  onClick={analyzeFace}
                  disabled={isAnalyzing}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Analyzing Your Face...
                    </>
                  ) : (
                    <>
                      <FaMagic className="mr-2" />
                      Analyze My Face
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="max-w-6xl mx-auto">
            {/* Analysis Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg">
              <div className="flex items-center mb-6">
                <FaCheckCircle className="text-green-500 text-2xl mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Analysis Complete</h2>
              </div>
              
              {/* Annotated Image */}
              {previewUrl && (
                <div className="flex justify-center mb-6">
                  <img
                    src={previewUrl}
                    alt="Analysis annotated"
                    className="w-72 h-72 object-cover rounded-2xl shadow-md"
                  />
                </div>
              )}
              
              <div className="grid md:grid-cols-6 lg:grid-cols-6 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
                  <FaPalette className="text-pink-500 text-2xl mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">Skin Tone</h3>
                  <p className="text-pink-600 capitalize">{analysis.skin_tone}</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <FaEye className="text-purple-500 text-2xl mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">Undertone</h3>
                  <p className="text-purple-600 capitalize">{analysis.undertone}</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <FaSmile className="text-blue-500 text-2xl mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">Emotion</h3>
                  <p className="text-blue-600 capitalize">{analysis.emotion}</p>
                  {analysis.emotion_confidence !== undefined && (
                    <p className="text-xs text-gray-500">{Math.round((analysis.emotion_confidence || 0) * 100) / 100}%</p>
                  )}
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl">
                  <h3 className="font-semibold text-gray-800">Acne</h3>
                  <p className="text-rose-600">
                    {analysis?.stats?.acne?.count ?? 0} spots
                  </p>
                  <p className="text-xs text-gray-600">
                    {analysis?.stats?.acne?.coverage_percent ?? 0}% area
                  </p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                  <h3 className="font-semibold text-gray-800">Wrinkles</h3>
                  <p className="text-amber-600">
                    {analysis?.stats?.wrinkles?.count ?? 0} regions
                  </p>
                  <p className="text-xs text-gray-600">
                    {analysis?.stats?.wrinkles?.coverage_percent ?? 0}% area
                  </p>
              </div>

                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                  <h3 className="font-semibold text-gray-800">Redness</h3>
                  <p className="text-red-600">
                    {analysis?.stats?.redness?.count ?? 0} regions
                  </p>
                  <p className="text-xs text-gray-600">
                    {analysis?.stats?.redness?.coverage_percent ?? 0}% area
                  </p>
                  </div>
                
                </div>

              

              <div className="mt-6 text-center">
                <button
                  onClick={resetAnalysis}
                  className="px-6 py-2 border border-pink-300 text-pink-600 rounded-full hover:bg-pink-50 transition-colors"
                >
                  Analyze Another Photo
                </button>
              </div>
            </div>

            {/* Product Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                  Recommended Products for You
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recommendations.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                            <FaStar className="text-yellow-400 text-sm" />
                            <span className="text-sm font-medium text-gray-700">
                              {product.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="mb-3">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-pink-600 font-semibold">
                            ₹{product.price}
                          </p>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        
                        {product.explanation && (
                          <div className="mb-4 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
                            <p className="text-sm text-gray-700 italic">
                              💡 {product.explanation}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => addToCartHandler(product._id)}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300"
                          >
                            <FaShoppingCart className="mr-2" />
                            Add to Cart
                          </button>
                          <button
                            onClick={() => buyNowHandler(product._id)}
                            className="flex-1 flex items-center justify-center px-4 py-2 border border-pink-500 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceAnalysisScreen;

