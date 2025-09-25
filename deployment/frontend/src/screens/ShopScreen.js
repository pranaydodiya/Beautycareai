import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listProducts } from "../actions/productActions";
import Product from "../components/Product";
import { formatINR } from "../utils/currency";

const ShopScreen = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((s) => s.productList);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState([0, 100000]);
  const [brand, setBrand] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("relevance");

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  const categories = useMemo(() => {
    const set = new Set((products || []).map((p) => p.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [products]);
  const brands = useMemo(() => {
    const set = new Set((products || []).map((p) => p.brand).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products || [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    }
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (brand !== "all") list = list.filter((p) => p.brand === brand);
    list = list.filter((p) => Number(p.price) >= price[0] && Number(p.price) <= price[1]);
    list = list.filter((p) => Number(p.rating || 0) >= Number(minRating));
    switch (sort) {
      case "price_asc":
        list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price_desc":
        list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "rating":
        list = [...list].sort((a, b) => Number(b.rating) - Number(a.rating));
        break;
      default:
        break;
    }
    return list;
  }, [products, query, category, price, sort]);

  return (
    <div className="mt-[80px] lg:px-24 md:px-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Shop</h1>

      <div className="grid md:grid-cols-4 grid-cols-1 gap-6">
        <aside className="md:col-span-1 border rounded-lg p-4 bg-white">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Search</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full border rounded-md px-3 py-2 outline-none" placeholder="Search products" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select className="w-full border rounded-md px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Brand</label>
            <select className="w-full border rounded-md px-3 py-2" value={brand} onChange={(e) => setBrand(e.target.value)}>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Price</label>
            <div className="flex items-center gap-2">
              <input type="number" min={0} value={price[0]} onChange={(e) => setPrice([Number(e.target.value), price[1]])} className="w-1/2 border rounded-md px-3 py-2" />
              <span>to</span>
              <input type="number" min={0} value={price[1]} onChange={(e) => setPrice([price[0], Number(e.target.value)])} className="w-1/2 border rounded-md px-3 py-2" />
            </div>
            <div className="text-xs text-gray-600 mt-1">{formatINR(price[0])} - {formatINR(price[1])}</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Minimum Rating</label>
            <select className="w-full border rounded-md px-3 py-2" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
              <option value={0}>All</option>
              <option value={1}>1+</option>
              <option value={2}>2+</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
              <option value={4.5}>4.5+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <select className="w-full border rounded-md px-3 py-2" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </aside>

        <main className="md:col-span-3">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
              {filtered.map((p) => (
                <Product key={p._id} product={p} />
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-gray-600">No products match your filters.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ShopScreen;


