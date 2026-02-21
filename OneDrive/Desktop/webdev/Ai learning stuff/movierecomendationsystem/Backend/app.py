# import pickle
# import pandas as pd
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from sklearn.metrics.pairwise import cosine_similarity

# app = FastAPI()

# # Allow React to call API
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Load pickle files
# df = pickle.load(open("df.pkl", "rb"))
# tfidf = pickle.load(open("tfidf.pkl", "rb"))
# tfidf_matrix = pickle.load(open("tfidf_matrix.pkl", "rb"))
# indices = pickle.load(open("indices.pkl", "rb"))

# def recommend(movie):
#     idx = indices[movie]
#     sim_scores = cosine_similarity(tfidf_matrix[idx], tfidf_matrix)[0]
#     movie_indices = sorted(
#         list(enumerate(sim_scores)),
#         key=lambda x: x[1],
#         reverse=True
#     )[1:6]
#     return df['title'].iloc[[i[0] for i in movie_indices]].tolist()

# @app.get("/recommend")
# def get_recommendations(movie: str):
#     return {
#         "movie": movie,
#         "recommendations": recommend(movie)
#     }






import pickle
import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics.pairwise import cosine_similarity

# -------------------- APP INIT --------------------
app = FastAPI(title="Movie Recommendation API")

# Allow React / Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- LOAD MODELS --------------------
df = pickle.load(open("df.pkl", "rb"))
tfidf = pickle.load(open("tfidf.pkl", "rb"))
tfidf_matrix = pickle.load(open("tfidf_matrix.pkl", "rb"))
indices = pickle.load(open("indices.pkl", "rb"))

# Create a case-insensitive mapping
indices_lower = {str(k).lower().strip(): v for k, v in indices.items()}

# -------------------- RECOMMEND FUNCTION --------------------
def recommend(movie: str):
    movie_clean = movie.strip().lower()

    if movie_clean not in indices_lower:
        return []

    idx = indices_lower[movie_clean]
    
    # Handle both single int and list of indices if applicable
    if isinstance(idx, (pd.Series, pd.Index, list)):
        idx = idx[0]

    sim_scores = cosine_similarity(
        tfidf_matrix[idx],
        tfidf_matrix
    )[0]

    movie_indices = sorted(
        list(enumerate(sim_scores)),
        key=lambda x: x[1],
        reverse=True
    )[1:21]

    recs = []
    for i in movie_indices:
        idx_recs = i[0]
        # Get specified columns and add 'id'
        movie_data = df.iloc[idx_recs][['title', 'overview', 'vote_average', 'popularity']].to_dict()
        movie_data['id'] = int(idx_recs)  # Add unique index as ID
        recs.append(movie_data)
    
    return recs

# -------------------- ROUTES --------------------

@app.get("/")
def root():
    return {"status": "MovieMind AI Backend is running 🚀"}

@app.get("/recommend")
def get_recommendations(movie: str = Query(..., example="Avatar")):
    recs = recommend(movie)

    if not recs:
        return {
            "movie": movie,
            "recommendations": [],
            "error": "Movie not found",
            "hint": "Check spelling or try another movie (e.g., 'Avatar', 'Toy Story')"
        }

    return {
        "movie": movie,
        "recommendations": recs
    }

