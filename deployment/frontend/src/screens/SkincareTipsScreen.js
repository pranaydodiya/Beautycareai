import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Meta from "../components/Meta";
import Message from "../components/Message";
import Loader from "../components/Loader";
import SkincareTipCard from "../components/SkincareTipCard";
import SkincareTipModal from "../components/SkincareTipModal";
import {
  listSkincareTips,
  getSkincareTipCategories,
  getSkincareTipConcerns,
} from "../actions/skincareTipActions";

// Animations kept minimal; removed heavy GSAP styling

const SkincareTipsScreen = () => {
  const dispatch = useDispatch();
  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  const filtersRef = useRef(null);

  // Redux state
  const skincareTipList = useSelector((state) => state.skincareTipList);
  const { loading, error, tips = [], page = 1, pages = 1, total = 0 } = skincareTipList;

  const skincareTipCategories = useSelector((state) => state.skincareTipCategories);
  const { categories = [] } = skincareTipCategories;

  const skincareTipConcerns = useSelector((state) => state.skincareTipConcerns);
  const { concerns = [] } = skincareTipConcerns;

  // Local state
  const [filters, setFilters] = useState({
    skinType: "all",
    concerns: [],
    category: "",
    search: "",
    difficulty: "",
    featured: "",
  });
  const [selectedTip, setSelectedTip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  // Dark mode removed for this page to keep neutral theme

  // Load static lists on mount; tips are fetched in the filters effect
  useEffect(() => {
    dispatch(getSkincareTipCategories());
    dispatch(getSkincareTipConcerns());
  }, [dispatch]);

  // Load tips when filters change
  useEffect(() => {
    dispatch(listSkincareTips(filters));
  }, [dispatch, filters]);

  // GSAP animations
  useEffect(() => {
    // reserved for future light animations
  }, [tips]);

  

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleConcernToggle = (concern) => {
    setFilters((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter((c) => c !== concern)
        : [...prev.concerns, concern],
    }));
  };

  // Search handled on submit via searchInput -> filters.search

  const handleTipClick = (tip) => {
    setSelectedTip(tip);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTip(null);
  };

  const skinTypes = [
    { value: "all", label: "All Skin Types" },
    { value: "oily", label: "Oily" },
    { value: "dry", label: "Dry" },
    { value: "combination", label: "Combination" },
    { value: "sensitive", label: "Sensitive" },
    { value: "normal", label: "Normal" },
  ];

  const difficulties = [
    { value: "", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  return (
    <div className="min-h-screen bg-pink-50 pt-24">
      <Meta title="Skincare Tips | MetizCare" />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-pink-600">
            Skincare Tips
          </h1>
          <p className="text-base md:text-lg text-pink-700 mb-6 max-w-3xl mx-auto">
            Discover personalized skincare advice tailored to your skin type and concerns
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section ref={filtersRef} className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <form onSubmit={(e)=>{e.preventDefault(); handleFilterChange("search", searchInput.trim());}} className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search skincare tips..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-5 py-3 pl-12 text-base border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white text-gray-900"
              />
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-pink-400">
                🔍
              </div>
            </div>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {/* Skin Type Filter */}
            <select
              value={filters.skinType}
              onChange={(e) => handleFilterChange("skinType", e.target.value)}
              className="px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white text-gray-900"
            >
              {skinTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white text-gray-900"
            >
              <option value="">All Categories</option>
              {categories && categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
              className="px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white text-gray-900"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>

            {/* Featured Filter */}
            <select
              value={filters.featured}
              onChange={(e) => handleFilterChange("featured", e.target.value)}
              className="px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white text-gray-900"
            >
              <option value="">All Tips</option>
              <option value="true">Featured Only</option>
            </select>
          </div>

          {/* Concerns Filter */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3 text-pink-700">
              Skin Concerns
            </h3>
            <div className="flex flex-wrap gap-2">
              {concerns && concerns.map((concern) => (
                <button
                  key={concern}
                  onClick={() => handleConcernToggle(concern)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    filters.concerns.includes(concern)
                      ? "bg-pink-600 text-white border border-pink-600"
                      : "bg-white text-gray-700 border border-pink-300 hover:bg-pink-50"
                  }`}
                >
                  {concern.charAt(0).toUpperCase() + concern.slice(1).replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tips Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-pink-700">
                  {total} Skincare Tips Found
                </h2>
                <div className="text-sm text-pink-700">
                  Page {page} of {pages}
                </div>
              </div>

              <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tips && tips.map((tip) => (
                  <SkincareTipCard
                    key={tip._id}
                    tip={tip}
                    onClick={() => handleTipClick(tip)}
                  />
                ))}
              </div>

              {tips && tips.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No tips found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Try adjusting your filters to see more results
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal */}
      {showModal && selectedTip && (
        <SkincareTipModal
          tip={selectedTip}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default SkincareTipsScreen;
