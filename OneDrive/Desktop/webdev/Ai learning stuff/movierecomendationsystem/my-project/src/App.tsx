import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

interface Movie {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  popularity: number;
}

export default function App() {
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
  const [avatar, setAvatar] = useState<string>(() => {
    return localStorage.getItem("userAvatar") || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";
  });
  const isAuthenticated = !!localStorage.getItem("token");

  // Load liked movies from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("likedMovies");
    if (saved) {
      try {
        setLikedMovies(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse likedMovies", e);
      }
    }
  }, []);

  // Persist avatar
  const handleSetAvatar = (newAvatar: string) => {
    setAvatar(newAvatar);
    localStorage.setItem("userAvatar", newAvatar);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0f1e] text-slate-200 selection:bg-indigo-500/30">
        <Navbar avatar={avatar} />

        <main>
          <Routes>
            <Route
              path="/"
              element={<Home likedMovies={likedMovies} setLikedMovies={setLikedMovies} />}
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <Profile
                    likedMovies={likedMovies}
                    setLikedMovies={setLikedMovies}
                    avatar={avatar}
                    setAvatar={handleSetAvatar}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>



        <footer className="py-12 text-center text-gray-600 text-sm border-t border-white/5 mt-20">
          <p>© 2024 MovieMind AI. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}
