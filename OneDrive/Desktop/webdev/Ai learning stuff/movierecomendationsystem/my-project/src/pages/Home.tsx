import { useState } from "react";
import SearchBar from "../components/SearchBar";
import MovieCard from "../components/MovieCard";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import api from "../api";

interface Movie {
    id: number;
    title: string;
    overview: string;
    vote_average: number;
    popularity: number;
}

interface Props {
    likedMovies: Movie[];
    setLikedMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
}

export default function Home({ likedMovies, setLikedMovies }: Props) {
    const [movie, setMovie] = useState<string>("");
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getRecommendations = async () => {
        if (!movie.trim()) return;

        setLoading(true);
        setResults([]);
        setError(null);

        try {
            const res = await api.get(`/recommend`, {
                params: { movie: movie.trim() }
            });

            if (res.data.recommendations) {
                setResults(res.data.recommendations);
                if (res.data.error) {
                    setError(res.data.error);
                }
            } else {
                setError("No recommendations found.");
            }
        } catch (err: any) {
            console.error("API error", err);
            setError(err.response?.data?.error || "Failed to fetch recommendations. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const toggleLike = (movie: Movie) => {
        setLikedMovies(prev => {
            const isAlreadyLiked = prev.some(m => m.id === movie.id);
            if (isAlreadyLiked) {
                const updated = prev.filter(m => m.id !== movie.id);
                localStorage.setItem("likedMovies", JSON.stringify(updated));
                return updated;
            } else {
                const updated = [...prev, movie];
                localStorage.setItem("likedMovies", JSON.stringify(updated));
                return updated;
            }
        });
    };

    return (
        <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                    Discover Your Next Favorite
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Hyper-personalized movie recommendations powered by advanced machine learning.
                    Enter a movie you love and let MovieMind do the magic.
                </p>
            </motion.div>

            <div className="max-w-3xl mx-auto mb-16">
                <SearchBar
                    movie={movie}
                    setMovie={setMovie}
                    onSearch={getRecommendations}
                />
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader />
                    <p className="mt-4 text-indigo-400 font-medium animate-pulse">Analyzing Cinematic Universe...</p>
                </div>
            )}

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center"
                >
                    {error}
                </motion.div>
            )}

            {results.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                >
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
                        <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium border border-indigo-500/30">
                            {results.length} results
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {results.map((item) => (
                            <MovieCard
                                key={item.id}
                                movie={item}
                                isLiked={likedMovies.some(m => m.id === item.id)}
                                toggleLike={toggleLike}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {!loading && results.length === 0 && !movie && (
                <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-gray-500 text-xl">Search for a movie to see recommendations</p>
                </div>
            )}
        </div>
    );
}
