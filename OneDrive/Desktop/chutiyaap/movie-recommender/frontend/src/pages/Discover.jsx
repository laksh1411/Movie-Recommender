import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import {
  Search, SlidersHorizontal, X, Loader2, Film,
  ChevronDown, ChevronUp, Plus, CheckCircle
} from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const ALL_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "History",
  "Horror", "Music", "Mystery", "Romance", "Science Fiction",
  "Thriller", "War", "Western",
];

export default function Discover() {
  const { currentUser } = useAuth();

  // Form state
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minImdb, setMinImdb] = useState(6.0);
  const [watchedInput, setWatchedInput] = useState("");
  const [watchedTags, setWatchedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

  // Results state
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Saved confirmation
  const [saved, setSaved] = useState(false);

  function toggleGenre(g) {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  function addWatchedTag(e) {
    e.preventDefault();
    const val = watchedInput.trim();
    if (val && !watchedTags.includes(val)) {
      setWatchedTags((prev) => [...prev, val]);
    }
    setWatchedInput("");
  }

  function removeTag(tag) {
    setWatchedTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSearched(true);
    setSaved(false);

    try {
      const res = await fetch(`${BACKEND}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genres: selectedGenres,
          min_imdb: minImdb,
          watched_ids: watchedTags.map(tag => parseInt(tag)).filter(id => !isNaN(id)),
          top_n: 30,
        }),
      });
      const data = await res.json();
      console.log("Backend response:", data);
      
      if (!res.ok) throw new Error(data.detail || "Server error");
      
      const movies = data.results || [];
      setResults(movies);
      setLoading(false); // Set loading false as soon as we have results

      // Save to Firestore (don't let this block results display)
      console.log("Checking if we can save to Firestore. currentUser:", !!currentUser, "movies.length:", movies.length);
      if (currentUser && movies.length > 0) {
        try {
          console.log("Preparing Firestore update for user:", currentUser.uid);
          const currentUid = currentUser.uid;
          const recMovies = movies.slice(0, 10);
          const nextMovies = movies.slice(10, 20);
          
          const ref = doc(db, "users", currentUid);
          getDoc(ref).then(docSnap => {
            const existingRecs = docSnap.exists() ? (docSnap.data().recommended || []) : [];
            
            // Filter out duplicates by tmdb_id
            const existingIds = new Set(existingRecs.map(m => m.tmdb_id));
            const uniqueNewRecs = recMovies.filter(m => !existingIds.has(m.tmdb_id));
            
            const mergedRecs = [...existingRecs, ...uniqueNewRecs].slice(-50); // Keep max 50
            
            updateDoc(ref, {
              recommended: mergedRecs,
              watchNext: nextMovies,
            }).then(() => {
              console.log("Firestore updated successfully with manual merge");
              setSaved(true);
            }).catch(err => {
              console.error("Firestore update failed promise rejection:", err);
            });
          }).catch(err => {
            console.error("Error reading doc for merge:", err);
          });
        } catch (syncErr) {
          console.error("Firestore update failed synchronously:", syncErr);
        }
      } else {
        console.log("Skipping Firestore save. Missing currentUser or movies.");
      }

    } catch (err) {
      console.error("Search error:", err);
      setError(
        err.message.includes("fetch")
          ? "Cannot connect to backend. Make sure the server is available."
          : err.message
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Discover Movies</h1>
          <p className="text-gray-400 mt-1">
            Filter by genre and rating to find your next watch
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors mb-1"
          >
            <SlidersHorizontal size={16} />
            Filters
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showFilters && (
            <form onSubmit={handleSearch} className="mt-4 space-y-6">
              {/* Genre Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Genres
                  <span className="text-xs text-gray-500 ml-2">(leave empty for all)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedGenres.includes(g)
                          ? "bg-green-600 text-white shadow-lg shadow-green-600/30 scale-105"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* IMDB Rating Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Minimum IMDB Rating:{" "}
                  <span className="text-green-400 font-bold">{minImdb.toFixed(1)} ★</span>
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">0</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={minImdb}
                    onChange={(e) => setMinImdb(Number(e.target.value))}
                    className="flex-1 accent-green-500 h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10"
                  />
                  <span className="text-xs text-gray-500">10</span>
                </div>
              </div>

              {/* Previously Watched (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Previously Watched
                  <span className="text-xs text-gray-500 ml-2">(optional — enter TMDB movie ID and press Enter)</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Film size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={watchedInput}
                      onChange={(e) => setWatchedInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addWatchedTag(e)}
                      placeholder="e.g. 550"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addWatchedTag}
                    className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-green-400 hover:border-green-500/40 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Tags */}
                {watchedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {watchedTags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 bg-white/10 border border-white/10 text-sm text-gray-300 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-green-600/30 text-sm"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                {loading ? "Finding movies..." : "Get Recommendations"}
              </button>
            </form>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Saved notification */}
        {saved && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 text-green-400 text-sm">
            <CheckCircle size={16} />
            Recommendations saved to your profile!
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Results
                {results.length > 0 && (
                  <span className="text-sm text-gray-400 font-normal ml-2">
                    ({results.length} movies found)
                  </span>
                )}
              </h2>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Film size={40} className="mx-auto mb-3 opacity-30" />
                <p>No movies found for these filters. Try different genres or a lower IMDB rating.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((movie, i) => (
                  <div key={movie.tmdb_id ?? i} className="w-full">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
