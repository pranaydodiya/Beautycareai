import React from "react";
import { gsap } from "gsap";
import { useDispatch } from "react-redux";
import { likeSkincareTip } from "../actions/skincareTipActions";

const SkincareTipCard = ({ tip, onClick, darkMode }) => {
  const cardRef = React.useRef(null);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (cardRef.current) {
      const card = cardRef.current;
      
      const handleMouseEnter = () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  // difficulty badge removed in redesign (function kept previously is no longer needed)

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
      ref={cardRef}
      onClick={onClick}
      className={`group cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700`}
    >
      {/* Card Header */}
      <div className="relative h-44 bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {(
          () => {
            const src = tip.image && (tip.image.startsWith('http') ? tip.image : `${process.env.REACT_APP_BACKEND_URL || ''}${tip.image}`);
            return src ? (
              <img
                src={src}
                alt={tip.title}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e)=>{ e.currentTarget.src = '/images/sample.webp'; }}
              />
            ) : null;
          }
        )() || (
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl opacity-50">{tip.icon || "✨"}</div>
          </div>
        )}
        
        {/* Optional badges removed for cleaner look */}
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {tip.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
          {tip.description}
        </p>

        {/* Meta Information */}
        <div className="space-y-3">
          {/* Skin Type */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Skin Type:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getSkinTypeColor(tip.skinType)}`}
            >
              {tip.skinType === "all" ? "All Types" : tip.skinType}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {tip.category}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Duration:</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {tip.duration}
            </span>
          </div>

          {/* Concerns */}
          {tip.concerns && tip.concerns.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tip.concerns.slice(0, 3).map((concern, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 text-xs"
                >
                  {concern.replace("-", " ")}
                </span>
              ))}
              {tip.concerns.length > 3 && (
                <span className="px-2 py-0.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 text-xs">
                  +{tip.concerns.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">👁️ {tip.views || 0}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); dispatch(likeSkincareTip(tip._id)); }}
              className="flex items-center gap-1 text-pink-600 hover:text-pink-700"
              aria-label="Like this tip"
            >
              ❤️ {tip.likes || 0}
            </button>
          </div>
          <div className="text-gray-900 dark:text-gray-100 font-medium text-sm">
            Read More →
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkincareTipCard;
