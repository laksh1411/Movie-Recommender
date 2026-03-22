"""
generate_dataset.py — Run this script to create movies_enriched.csv for the backend.

Usage:
    cd backend
    python generate_dataset.py

Requirements:
    - Set TMDB_API_KEY in backend/.env
    - pip install requests pandas python-dotenv
"""

import os, time, ast
import requests
import urllib3
import pandas as pd
from dotenv import load_dotenv

urllib3.disable_warnings()

load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_BASE = "https://api.themoviedb.org/3"

# How many popular movies to fetch (each page = 20 movies)
PAGES_TO_FETCH = 25  # 500 movies total


def fetch_popular_movies(pages: int) -> list[dict]:
    movies = []
    for page in range(1, pages + 1):
        r = requests.get(
            f"{TMDB_BASE}/movie/popular",
            params={"api_key": TMDB_API_KEY, "language": "en-US", "page": page},
            timeout=10,
            verify=False,
        )
        data = r.json().get("results", [])
        movies.extend(data)
        print(f"  Fetched page {page}/{pages} ({len(data)} movies)...")
        time.sleep(0.25)
    return movies


def enrich_movie(movie: dict) -> dict | None:
    movie_id = movie["id"]
    try:
        detail = requests.get(
            f"{TMDB_BASE}/movie/{movie_id}",
            params={"api_key": TMDB_API_KEY, "append_to_response": "credits"},
            timeout=8,
        ).json()
        director = next(
            (p["name"] for p in detail.get("credits", {}).get("crew", []) if p["job"] == "Director"),
            "N/A",
        )
        cast = [p["name"] for p in detail.get("credits", {}).get("cast", [])[:8]]
        genres_list = [g["name"] for g in detail.get("genres", [])]
        poster_path = movie.get("poster_path", "")
        return {
            "tmdb_id": movie_id,
            "title": movie.get("title", ""),
            "release_year": (movie.get("release_date") or "")[:4],
            "genres": "|".join(genres_list),
            "imdb_rating": round(movie.get("vote_average", 0), 1),
            "vote_count": movie.get("vote_count", 0),
            "overview": detail.get("overview", ""),
            "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else "",
            "director": director,
            "cast": cast,
        }
    except Exception as e:
        print(f"  Error enriching movie {movie_id}: {e}")
        return None


def main():
    if not TMDB_API_KEY or TMDB_API_KEY == "your_tmdb_api_key_here":
        print("ERROR: Please set TMDB_API_KEY in backend/.env before running this script.")
        return

    print(f"Fetching {PAGES_TO_FETCH * 20} popular movies from TMDB...")
    raw_movies = fetch_popular_movies(PAGES_TO_FETCH)

    print(f"\nEnriching {len(raw_movies)} movies with detailed info...")
    enriched = []
    for i, m in enumerate(raw_movies):
        result = enrich_movie(m)
        if result:
            enriched.append(result)
        if (i + 1) % 50 == 0:
            print(f"  Processed {i+1}/{len(raw_movies)}...")
        time.sleep(0.15)

    df = pd.DataFrame(enriched)

    # Filter out low vote count movies (too obscure)
    df = df[df["vote_count"] >= 100].reset_index(drop=True)

    out_path = os.path.join(os.path.dirname(__file__), "movies_enriched.csv")
    df.to_csv(out_path, index=False)
    print(f"\nDone! Saved {len(df)} movies to {out_path}")
    print(df[["title", "genres", "imdb_rating", "director"]].head(10))


if __name__ == "__main__":
    main()
