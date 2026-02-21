import { motion } from "framer-motion";
import MovieCard from "../components/MovieCard";
import { Heart, Settings, Camera, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

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
    avatar: string;
    setAvatar: (avatar: string) => void;
}

export default function Profile({ likedMovies, setLikedMovies, avatar, setAvatar }: Props) {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/user/profile");
            if (res.data.avatar) {
                setAvatar(res.data.avatar);
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
            // If 401, we might want to redirect to login
            // For now, we'll just log it as the user reported it
        }
    };

    const toggleLike = (movie: Movie) => {
        const updated = likedMovies.filter(m => m.id !== movie.id);
        setLikedMovies(updated);
        localStorage.setItem("likedMovies", JSON.stringify(updated));
    };

    const changeAvatar = async () => {
        const newSeed = Math.random().toString(36).substring(7);
        const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`;

        setLoading(true);
        try {
            await api.patch("/user/profile/avatar", { avatar: newAvatar });
            setAvatar(newAvatar);
        } catch (err) {
            console.error("Failed to update avatar", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload(); // Refresh to clear state
    };

    return (
        <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center gap-8"
            >
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 shadow-2xl relative">
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        {loading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={changeAvatar}
                        disabled={loading}
                        className="absolute bottom-0 right-0 p-2 bg-indigo-500 rounded-full text-white shadow-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
                    >
                        <Camera size={18} />
                    </button>
                </div>

                <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 justify-center md:justify-start">
                        Cinematic Enthusiast
                        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md uppercase tracking-wider">Premium</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Personalizing your movie journey since today.</p>

                    <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <span className="block text-2xl font-bold text-white">{likedMovies.length}</span>
                            <span className="text-xs text-gray-500 uppercase font-semibold">Liked Films</span>
                        </div>
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <span className="block text-2xl font-bold text-white">24</span>
                            <span className="text-xs text-gray-500 uppercase font-semibold">Discovery Score</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <button className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                        <Settings className="text-gray-400" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-colors group"
                        title="Logout"
                    >
                        <LogOut className="text-red-400 group-hover:text-red-300" />
                    </button>
                </div>
            </motion.div>

            {/* Liked Movies Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <Heart className="text-red-500 fill-red-500" size={24} />
                    <h2 className="text-2xl font-bold text-white">Your Collection</h2>
                </div>

                {likedMovies.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {likedMovies.map((movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                isLiked={true}
                                toggleLike={toggleLike}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-gray-500 text-lg italic">Your collection is empty. Start liking movies to see them here!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

