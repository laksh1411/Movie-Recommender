import pandas as pd
import numpy as np
import ast, os, re

DATA_PATH = os.path.join(os.path.dirname(__file__), "movies_enriched.csv")

_df: pd.DataFrame | None = None


def _load() -> pd.DataFrame:
    global _df
    if _df is None:
        _df = pd.read_csv(DATA_PATH)
        # cast column stored as string list
        _df["cast"] = _df["cast"].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) and x.startswith("[") else [])
        _df["imdb_rating"] = pd.to_numeric(_df["imdb_rating"], errors="coerce").fillna(0)
        _df["genres"] = _df["genres"].fillna("")
    return _df


def recommend(genres: list[str], min_imdb: float, watched_ids: list[int], top_n: int = 20) -> list[dict]:
    df = _load()
    result = df.copy()

    # Filter by IMDB rating
    result = result[result["imdb_rating"] >= min_imdb]

    # Filter by genre (any selected genre must appear in the movie's genres)
    if genres:
        pattern = "|".join(re.escape(g) for g in genres)
        result = result[result["genres"].str.contains(pattern, case=False, na=False)]

    # Exclude watched movies
    if watched_ids:
        result = result[~result["tmdb_id"].isin(watched_ids)]

    # Sort by IMDB rating descending
    result = result.sort_values("imdb_rating", ascending=False)
    return result.head(top_n).to_dict(orient="records")


def related(tmdb_id: int) -> dict:
    from tmdb_client import get_related_movies
    df = _load()
    return get_related_movies(tmdb_id, df)
