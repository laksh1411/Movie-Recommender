import pandas as pd
import json

# Load existing enriched movies
existing_df = pd.read_csv('movies_enriched.csv')
existing_titles = set(existing_df['title'].str.lower())

# Load TMDB 5000 movies
tmdb_df = pd.read_csv('tmdb_5000_movies.csv')

def parse_genres(genre_str):
    try:
        genres = json.loads(genre_str)
        return "|".join([g['name'] for g in genres])
    except:
        return ""

new_movies = []
for _, row in tmdb_df.iterrows():
    title = str(row['title'])
    if title.lower() in existing_titles:
        continue # Skip if already in our dataset

    # Extract genres
    genres = parse_genres(row['genres'])

    # Extract release year
    release_date = str(row['release_date'])
    release_year = release_date[:4] if len(release_date) >= 4 and release_date != 'nan' else ""

    new_movie = {
        'tmdb_id': row['id'],
        'title': title,
        'overview': str(row['overview']) if not pd.isna(row['overview']) else "",
        'genres': genres,
        'imdb_rating': row['vote_average'],
        'vote_count': row['vote_count'],
        'cast': "[]",
        'release_year': release_year,
        'director': "N/A",
        'poster_url': ""
    }
    
    # Only keep popular movies to keep the dataset high quality
    if row['vote_count'] >= 1000 and row['vote_average'] > 6.0:
        new_movies.append(new_movie)

new_df = pd.DataFrame(new_movies)
print(f"Adding {len(new_df)} new movies.")

# Append to existing
combined_df = pd.concat([existing_df, new_df], ignore_index=True)
combined_df.to_csv('movies_enriched.csv', index=False)
print("Finished saving increased dataset.")
