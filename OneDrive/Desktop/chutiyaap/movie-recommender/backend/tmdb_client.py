import pandas as pd
import numpy as np
import requests
import os
from dotenv import load_dotenv

load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_BASE = "https://api.themoviedb.org/3"

def search_movie_tmdb(title: str) -> dict:
    """Search TMDB for a movie by title and return enriched data."""
    try:
        r = requests.get(
            f"{TMDB_BASE}/search/movie",
            params={"api_key": TMDB_API_KEY, "query": title, "language": "en-US"},
            timeout=5,
        )
        results = r.json().get("results", [])
        if not results:
            return {}
        movie = results[0]
        movie_id = movie["id"]
        # Get detailed info
        detail = requests.get(
            f"{TMDB_BASE}/movie/{movie_id}",
            params={"api_key": TMDB_API_KEY, "append_to_response": "credits"},
            timeout=5,
        ).json()
        director = next(
            (p["name"] for p in detail.get("credits", {}).get("crew", []) if p["job"] == "Director"),
            "N/A",
        )
        cast = [p["name"] for p in detail.get("credits", {}).get("cast", [])[:5]]
        poster_path = movie.get("poster_path", "")
        return {
            "tmdb_id": movie_id,
            "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else "",
            "imdb_rating": round(movie.get("vote_average", 0), 1),
            "director": director,
            "cast": cast,
            "overview": detail.get("overview", ""),
            "release_year": (movie.get("release_date") or "")[:4],
        }
    except Exception as e:
        print(f"TMDB error for '{title}': {e}")
        return {}


def get_related_movies(movie_id: int, df: pd.DataFrame) -> dict:
    """Return movies related by genre, director, cast."""
    row = df[df["tmdb_id"] == movie_id]
    if row.empty:
        return {"by_genre": [], "by_director": [], "by_cast": []}

    genre = row.iloc[0]["genres"]
    director = row.iloc[0]["director"]
    cast = row.iloc[0]["cast"] if isinstance(row.iloc[0]["cast"], list) else []

    def to_list(df_slice):
        return df_slice.head(10).to_dict(orient="records")

    by_genre = to_list(df[(df["genres"] == genre) & (df["tmdb_id"] != movie_id)])
    by_director = to_list(df[(df["director"] == director) & (df["tmdb_id"] != movie_id)])
    by_cast = to_list(df[df["cast"].apply(lambda c: bool(set(cast) & set(c if isinstance(c, list) else []))) & (df["tmdb_id"] != movie_id)])

    return {"by_genre": by_genre, "by_director": by_director, "by_cast": by_cast}
