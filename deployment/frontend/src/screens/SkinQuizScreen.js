import React, { useState, useMemo, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../actions/cartActions";
import Meta from "../components/Meta";
import gemini from "../services/geminiService";

const SkinQuizScreen = () => {
  const [messages, setMessages] = useState(() => {
    const raw = localStorage.getItem('quiz:summary');
    let intro = "Hi! I am your Beauty Assistant. Tell me about your skin and goals.";
    if (raw) {
      try {
        const q = JSON.parse(raw);
        const concerns = Array.isArray(q.concerns) ? q.concerns.join(', ') : '';
        intro = `Hi! I reviewed your quiz: skin type ${q.skinType || 'unknown'}, concerns: ${concerns || 'none'}${q.budget ? `, budget: ${q.budget}` : ''}. Tell me more about your goals or symptoms.`;
      } catch {}
    }
    return [{ role: 'assistant', content: intro }];
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [recs, setRecs] = useState([]);
  const [recBusy, setRecBusy] = useState(false);
  const recsRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Inline quick quiz state (shown if no summary yet)
  const existingSummary = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('quiz:summary') || 'null'); } catch { return null; }
  }, []);
  const [quiz, setQuiz] = useState({
    skinType: '',
    concerns: [],
    budget: '',
    sensitivity: '',
    goals: [],
    routineTime: '',
    fragrance: '',
    allergies: '',
    preferredTypes: [],
  });
  const [step, setStep] = useState(1);
  const [quizSubmitted, setQuizSubmitted] = useState(!!existingSummary);
  const pinkBox = "bg-pink-50 border border-pink-200";
  const pinkAccent = "text-pink-600";
  const pinkBtn = "bg-pink-600 hover:bg-pink-700 text-white";
  const apiBase = process.env.REACT_APP_BACKEND_URL || '';

  const allConcerns = [
    'Acne', 'Aging', 'Dark spots', 'Dryness', 'Dullness', 'Hydration', 'Oiliness', 'Pores', 'Sensitivity', 'Uneven tone'
  ];
  const allGoals = [
    'Clear acne', 'Fade dark spots', 'Anti-aging', 'Hydration boost', 'Reduce oil', 'Glow/brightness', 'Even tone', 'Soothing/calming'
  ];
  const productTypes = ['Cleanser','Moisturizer','Serum','Sunscreen','Toner','Mask','Eye Cream','Exfoliant'];

  const submitQuiz = async (e) => {
    e.preventDefault();
    const summary = {
      skinType: quiz.skinType,
      concerns: quiz.concerns,
      budget: quiz.budget,
      sensitivity: quiz.sensitivity,
      goals: quiz.goals,
      routineTime: quiz.routineTime,
      fragrance: quiz.fragrance,
      allergies: quiz.allergies,
      preferredTypes: quiz.preferredTypes,
    };
    try { localStorage.setItem('quiz:summary', JSON.stringify(summary)); } catch {}
    setQuizSubmitted(true);
    // Seed assistant intro and fetch initial recommendations
    const concernsStr = quiz.concerns.join(', ');
    const intro = `Thanks! Based on your quiz: skin type ${quiz.skinType || 'unknown'}, concerns: ${concernsStr || 'none'}${quiz.budget ? `, budget: ${quiz.budget}` : ''}. Ask me anything or get a routine.`;
    setMessages([{ role: 'assistant', content: intro }]);
    // Get recommendations immediately
    try {
      setRecBusy(true);
      const res = await fetch(`${apiBase}/api/products`);
      const all = await res.json();
      const list = Array.isArray(all.products || all) ? (all.products || all) : [];
      const kw = [quiz.skinType, ...quiz.concerns, ...quiz.goals, ...quiz.preferredTypes]
        .filter(Boolean).map(s => s.toLowerCase());
      const filtered = kw.length
        ? list.filter(p => {
            const txt = `${p.name} ${p.description} ${p.brand} ${p.category}`.toLowerCase();
            return kw.some(k => txt.includes(k));
          })
        : list;
      setRecs(filtered.slice(0, 6));
    } catch {
      setRecs([]);
    } finally {
      setRecBusy(false);
      setTimeout(() => { try { recsRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch {} }, 50);
    }
  };

  // Helper to fetch recommendations (shared by button and auto-load)
  const fetchRecommendations = async () => {
    setRecBusy(true);
    try {
      let keywords = [];
      try {
        const raw = localStorage.getItem('quiz:summary');
        if (raw) {
          const q = JSON.parse(raw);
          keywords = (q.concerns || []).slice(0, 5);
        }
      } catch {}
      if (keywords.length === 0) {
        const kw = await gemini.chat([
          ...messages,
          { role: 'user', content: 'From our chat, list up to 5 product search keywords (comma separated). Output only the keywords.' }
        ]);
        keywords = (kw || '').split(',').map(s => s.trim()).filter(Boolean);
      }
      const res = await fetch(`${apiBase}/api/products`);
      const all = await res.json();
      const list = Array.isArray(all.products || all) ? (all.products || all) : [];
      let filtered = keywords.length
        ? list.filter(p => {
            const txt = `${p.name} ${p.description} ${p.brand} ${p.category}`.toLowerCase();
            return keywords.some(k => txt.includes(k.toLowerCase()));
          })
        : list;
      if (!filtered || filtered.length === 0) filtered = list;
      setRecs((filtered || []).slice(0, 6));
    } catch (e) {
      setRecs([]);
    } finally {
      setRecBusy(false);
    }
  };

  // Auto-load recs when quiz already submitted but none present yet
  useEffect(() => {
    if (quizSubmitted && recs.length === 0 && !recBusy) {
      fetchRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizSubmitted]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const next = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const style = {
        role: 'user',
        content:
          'Please answer as a Beauty Assistant in concise bullets with emojis. Use short headings, numbered steps for routines, and 4-8 bullets max. Prefer formats like: \n\n**Routine**\n1) Cleanser … 🧼\n2) Treatment … ✨\n3) Moisturizer … 💧\n4) Sunscreen … ☀️\n\nKeep sentences short. Avoid large paragraphs. Bold key product types. Include simple do/dont tips. If user asks for routine, output stepwise list only.'
      };
      const reply = await gemini.chat([style, ...next]);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([...next, { role: "assistant", content: "Sorry, I had trouble responding. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24">
      <Meta title="Beauty Assistant" />
      {!quizSubmitted && (
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-extrabold ${pinkAccent} mb-2`}>Beauty Assistant</h1>
            <p className="text-gray-600">Quick quiz to personalize your routine.</p>
          </div>
          <form onSubmit={submitQuiz} className={`rounded-2xl p-6 ${pinkBox}`}>
            {/* Progress */}
            <div className="flex items-center justify-between mb-4 text-sm text-pink-700">
              <span>Step {step} of 3</span>
              <div className="flex-1 mx-3 h-1 bg-pink-100 rounded"><div className="h-1 bg-pink-500 rounded" style={{ width: `${(step/3)*100}%` }} /></div>
            </div>

            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skin type</label>
                  <select
                    value={quiz.skinType}
                    onChange={(e) => setQuiz(q => ({ ...q, skinType: e.target.value }))}
                    className="w-full border border-pink-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="">Select…</option>
                    <option>Oily</option>
                    <option>Dry</option>
                    <option>Combination</option>
                    <option>Normal</option>
                    <option>Sensitive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                  <select
                    value={quiz.budget}
                    onChange={(e) => setQuiz(q => ({ ...q, budget: e.target.value }))}
                    className="w-full border border-pink-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="">Select…</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sensitivity</label>
                  <select
                    value={quiz.sensitivity}
                    onChange={(e) => setQuiz(q => ({ ...q, sensitivity: e.target.value }))}
                    className="w-full border border-pink-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="">Select…</option>
                    <option>Low</option>
                    <option>Moderate</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary concerns</label>
                <div className="flex flex-wrap gap-2">
                  {allConcerns.map((c) => {
                    const active = quiz.concerns.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setQuiz(q => ({
                          ...q,
                          concerns: active ? q.concerns.filter(x => x !== c) : [...q.concerns, c]
                        }))}
                        className={`px-3 py-1 rounded-full border ${active ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-700 border-pink-200 hover:bg-pink-50'}`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
                <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Goals</label>
                <div className="flex flex-wrap gap-2">
                  {allGoals.map((g) => {
                    const active = quiz.goals.includes(g);
                    return (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setQuiz(q => ({
                          ...q,
                          goals: active ? q.goals.filter(x => x !== g) : [...q.goals, g]
                        }))}
                        className={`px-3 py-1 rounded-full border ${active ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-700 border-pink-200 hover:bg-pink-50'}`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Routine time (daily)</label>
                  <select
                    value={quiz.routineTime}
                    onChange={(e) => setQuiz(q => ({ ...q, routineTime: e.target.value }))}
                    className="w-full border border-pink-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="">Select…</option>
                    <option>Under 5 min</option>
                    <option>5-10 min</option>
                    <option>10-20 min</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fragrance preference</label>
                  <select
                    value={quiz.fragrance}
                    onChange={(e) => setQuiz(q => ({ ...q, fragrance: e.target.value }))}
                    className="w-full border border-pink-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="">Select…</option>
                    <option>No fragrance</option>
                    <option>Mild</option>
                    <option>Any</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient allergies (optional)</label>
                  <input
                    value={quiz.allergies}
                    onChange={(e) => setQuiz(q => ({ ...q, allergies: e.target.value }))}
                    placeholder="e.g., salicylic acid, fragrance, alcohol"
                    className="w-full border border-pink-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred product types</label>
                  <div className="flex flex-wrap gap-2">
                    {productTypes.map((t) => {
                      const active = quiz.preferredTypes.includes(t);
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setQuiz(q => ({
                            ...q,
                            preferredTypes: active ? q.preferredTypes.filter(x => x !== t) : [...q.preferredTypes, t]
                          }))}
                          className={`px-3 py-1 rounded-full border ${active ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-700 border-pink-200 hover:bg-pink-50'}`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button type="button" onClick={() => setStep(s => Math.max(1, s-1))} className="px-4 py-2 rounded-lg border border-pink-300 text-pink-700" disabled={step===1}>Back</button>
              {step < 3 ? (
                <button type="button" onClick={() => setStep(s => Math.min(3, s+1))} className={`px-5 py-2 rounded-lg ${pinkBtn}`} disabled={step===1 && !quiz.skinType}>Next</button>
              ) : (
                <button type="submit" className={`px-5 py-2 rounded-lg ${pinkBtn}`} disabled={!quiz.skinType || quiz.concerns.length===0}>See recommendations</button>
              )}
            </div>
          </form>
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className={`text-4xl font-extrabold ${pinkAccent} mb-2`}>Beauty Assistant</h1>
          <p className="text-gray-600 mb-3">{quizSubmitted ? 'Personalized by your quiz. Get routines, product ideas, and tips.' : 'Please complete the quick quiz to personalize your experience.'}</p>
          <button
            type="button"
            onClick={() => {
              try { localStorage.removeItem('quiz:summary'); } catch {}
              setQuiz({ skinType:'', concerns:[], budget:'', sensitivity:'', goals:[], routineTime:'', fragrance:'', allergies:'', preferredTypes:[] });
              setStep(1);
              setQuizSubmitted(false);
              setRecs([]);
              setMessages([{ role:'assistant', content: 'Let\'s start with a quick quiz to tailor advice for you.' }]);
            }}
            className="px-4 py-2 rounded-lg border border-pink-300 text-pink-700 hover:bg-pink-50"
          >
            {quizSubmitted ? 'Retake Quiz' : 'Start Quiz'}
          </button>
        </div>

        {quizSubmitted && (
          <div className="border border-pink-200 rounded-lg h-[60vh] overflow-y-auto p-4 bg-pink-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`mb-3 ${m.role === "user" ? "text-right" : "text-left"}`}>
                <div className={`inline-block px-3 py-2 rounded-lg ${m.role === "user" ? "bg-pink-600 text-white" : "bg-white text-gray-900 border border-pink-200"}`}>
                  {m.content}
                </div>
            </div>
            ))}
            {busy && (
              <div className="text-left mb-3">
                <div className="inline-block px-3 py-2 rounded-lg bg-white text-gray-900 border border-pink-200">Typing…</div>
            </div>
            )}
          </div>
        )}

        {quizSubmitted && (
        <form onSubmit={send} className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about skincare…"
            className="flex-1 px-3 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button type="submit" className={`px-4 py-2 rounded-lg ${pinkBtn}`} disabled={busy}>
            {busy ? 'Sending…' : 'Send'}
          </button>
        </form>
        )}

        {/* Recommendations */}
        <div ref={recsRef} className="mt-6">
          <button
            onClick={async () => {
              setRecBusy(true);
              try {
                // If we have quiz concerns, prefer them; else derive from chat
                let keywords = [];
                try {
                  const raw = localStorage.getItem('quiz:summary');
                  if (raw) {
                    const q = JSON.parse(raw);
                    keywords = (q.concerns || []).slice(0, 5);
                  }
                } catch {}
                if (keywords.length === 0) {
                  const kw = await gemini.chat([
                    ...messages,
                    { role: 'user', content: 'From our chat, list up to 5 product search keywords (comma separated). Output only the keywords.' }
                  ]);
                  keywords = (kw || '').split(',').map(s => s.trim()).filter(Boolean);
                }
                const res = await fetch(`${apiBase}/api/products`);
                const all = await res.json();
                const list = Array.isArray(all.products || all) ? (all.products || all) : [];
                let filtered = keywords.length
                  ? list.filter(p => {
                      const txt = `${p.name} ${p.description} ${p.brand} ${p.category}`.toLowerCase();
                      return keywords.some(k => txt.includes(k.toLowerCase()));
                    })
                  : list;
                if (!filtered || filtered.length === 0) {
                  filtered = list;
                }
                setRecs((filtered || []).slice(0, 6));
              } catch (e) {
                setRecs([]);
              } finally {
                setRecBusy(false);
              }
            }}
            className="px-4 py-2 rounded-lg border border-pink-300 hover:bg-pink-50 text-pink-700"
            disabled={recBusy}
          >
            {recBusy ? 'Finding products…' : 'Get product recommendations'}
          </button>

          {recs.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recs.map((p) => (
                <div key={p._id || p.id} className="border border-pink-200 rounded-xl p-3 bg-white">
                  <div className="w-full h-36 bg-pink-50 rounded mb-2 overflow-hidden">
                    {(() => {
                      const img = p.image || '';
                      const base = process.env.REACT_APP_BACKEND_URL || '';
                      const src = img
                        ? (/^https?:/i.test(img) ? img : `${base}${img?.startsWith('/') ? img : '/' + img}`)
                        : '/images/sample.webp';
                      return <img src={src} alt={p.name} className="w-full h-full object-cover" onError={(e)=>{e.currentTarget.src='/images/sample.webp';}} />;
                    })()}
                  </div>
                  <div className="font-semibold text-gray-900 line-clamp-1">{p.name}</div>
                  <div className="text-sm text-gray-600 line-clamp-2">{p.description}</div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => dispatch(addToCart(p._id || p.id, 1))}
                      className="px-3 py-1 rounded-lg border border-pink-300 text-pink-700 hover:bg-pink-50"
                    >
                      Add to cart
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try { await dispatch(addToCart(p._id || p.id, 1)); } catch {}
                        navigate(`/pay?productId=${encodeURIComponent(p._id || p.id)}&qty=1`);
                      }}
                      className="px-3 py-1 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
                    >
                      Buy now
                    </button>
                  </div>
          </div>
        ))}
            </div>
          )}
          </div>
      </div>
    </div>
  );
};

export default SkinQuizScreen;
