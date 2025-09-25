import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useDispatch } from "react-redux";
import { likeSkincareTip } from "../actions/skincareTipActions";

const SkincareTipModal = ({ tip, onClose, darkMode }) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (modalRef.current) {
      // Animate modal in
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      gsap.fromTo(
        contentRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, delay: 0.1, ease: "back.out(1.7)" }
      );
    }
  }, []);

  const handleLike = () => {
    dispatch(likeSkincareTip(tip._id));
  };

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      handleClose();
    }
  };

  const handleClose = () => {
    gsap.to(contentRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    });

    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getSkinTypeColor = (skinType) => {
    switch (skinType) {
      case "oily":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "dry":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "combination":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "sensitive":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      case "normal":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={contentRef}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${
          darkMode ? "dark" : ""
        }`}
      >
        {/* Modal Header */}
        <div className="relative h-64 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 overflow-hidden">
          {tip.image ? (
            <img
              src={tip.image}
              alt={tip.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-8xl opacity-50">{tip.icon || "✨"}</div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            ✕
          </button>

          {/* Featured Badge */}
          {tip.featured && (
            <div className="absolute top-4 left-4 bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              ⭐ Featured Tip
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {/* Title and Meta */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              {tip.title}
            </h1>

            {/* Meta Tags */}
            <div className="flex flex-wrap gap-3 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(tip.difficulty)}`}
              >
                {tip.difficulty}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getSkinTypeColor(tip.skinType)}`}
              >
                {tip.skinType === "all" ? "All Skin Types" : tip.skinType}
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                {tip.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                {tip.duration}
              </span>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {tip.description}
            </p>
          </div>

          {/* Full Content */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Detailed Guide
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {tip.fullContent}
              </p>
            </div>
          </div>

          {/* Concerns */}
          {tip.concerns && tip.concerns.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                Addresses These Concerns:
              </h3>
              <div className="flex flex-wrap gap-2">
                {tip.concerns.map((concern, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 rounded-full text-sm font-medium"
                  >
                    {concern.replace("-", " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tip.tags && tip.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                Related Topics:
              </h3>
              <div className="flex flex-wrap gap-2">
                {tip.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats and Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <span className="text-lg">👁️</span>
                {tip.views || 0} views
              </span>
              <span className="flex items-center gap-2">
                <span className="text-lg">❤️</span>
                {tip.likes || 0} likes
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                ❤️ Like This Tip
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full font-semibold transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkincareTipModal;
