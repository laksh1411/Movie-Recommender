import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";

export default function MovieRow({ title, icon: Icon, movies = [], onMovieClick }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir * 600, behavior: "smooth" });
    }
  };

  if (!movies.length) return null;

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={20} className="text-green-400" />}
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{movies.length}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll(-1)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-green-500/20 hover:text-green-400 text-gray-400 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-green-500/20 hover:text-green-400 text-gray-400 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {movies.map((movie, i) => (
          <MovieCard key={movie.tmdb_id ?? i} movie={movie} onClick={onMovieClick} />
        ))}
      </div>
    </section>
  );
}
