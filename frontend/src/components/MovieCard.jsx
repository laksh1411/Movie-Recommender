import { useState } from "react";
import { Star, User, Calendar, Tag } from "lucide-react";

const PLACEHOLDER = "https://via.placeholder.com/500x750/1a1a2e/4ade80?text=No+Poster";

export default function MovieCard({ movie, onClick }) {
  const [imgError, setImgError] = useState(false);

  const {
    title = "Unknown",
    poster_url = "",
    imdb_rating = 0,
    genres = "",
    director = "N/A",
    release_year = "",
    overview = "",
    cast = [],
  } = movie;

  const displayGenres = typeof genres === "string"
    ? genres.split("|").slice(0, 2).join(" • ")
    : "";

  return (
    <div
      onClick={() => onClick && onClick(movie)}
      className="group relative flex-shrink-0 w-44 cursor-pointer rounded-xl overflow-hidden bg-gray-900 border border-white/5 hover:border-green-500/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300"
    >
      {/* Poster */}
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img
          src={!imgError && poster_url ? poster_url : PLACEHOLDER}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-white">{Number(imdb_rating).toFixed(1)}</span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          {overview && (
            <p className="text-xs text-gray-300 line-clamp-4 mb-2">{overview}</p>
          )}
          {cast.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <User size={10} />
              <span className="truncate">{cast.slice(0, 2).join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5 space-y-1">
        <h3 className="font-semibold text-sm text-white line-clamp-1">{title}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          {release_year && (
            <>
              <Calendar size={10} />
              <span>{release_year}</span>
              <span className="mx-1">·</span>
            </>
          )}
          {displayGenres && (
            <>
              <Tag size={10} />
              <span className="truncate">{displayGenres}</span>
            </>
          )}
        </div>
        {director && director !== "N/A" && (
          <p className="text-xs text-green-400 font-medium truncate">{director}</p>
        )}
      </div>
    </div>
  );
}
