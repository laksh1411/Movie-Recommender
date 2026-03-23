from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import recommender

app = FastAPI(title="Movie Recommendation API", version="1.0.0")
@app.get("/")
def home():
    return {"message": "Backend is working 🚀"}
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    genres: List[str] = []
    min_imdb: float = 6.0
    watched_ids: Optional[List[int]] = []
    top_n: int = 20


@app.get("/")
def root():
    return {"status": "Movie Recommendation API is running"}


@app.post("/recommend")
def get_recommendations(req: RecommendRequest):
    try:
        movies = recommender.recommend(
            genres=req.genres,
            min_imdb=req.min_imdb,
            watched_ids=req.watched_ids or [],
            top_n=req.top_n,
        )
        return {"results": movies, "count": len(movies)}
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Movie data not found. Please run the notebook to generate movies_enriched.csv first.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/movie/{tmdb_id}/related")
def get_related(tmdb_id: int):
    try:
        return recommender.related(tmdb_id)
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Movie data not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/genres")
def list_genres():
    """Return all unique genres available in the dataset."""
    try:
        import pandas as pd, ast, os
        df = pd.read_csv(os.path.join(os.path.dirname(__file__), "movies_enriched.csv"))
        all_genres: set = set()
        for g in df["genres"].dropna():
            for part in str(g).split("|"):
                all_genres.add(part.strip())
        return {"genres": sorted(all_genres)}
    except FileNotFoundError:
        return {"genres": [
            "Action", "Adventure", "Animation", "Comedy", "Crime",
            "Documentary", "Drama", "Fantasy", "Horror", "Musical",
            "Mystery", "Romance", "Sci-Fi", "Thriller", "Western",
        ]}
