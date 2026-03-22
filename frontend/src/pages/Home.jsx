import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import Navbar from "../components/Navbar";
import MovieRow from "../components/MovieRow";
import {
  Clock, Bookmark, Clapperboard, Drama, Users, Loader2, Compass
} from "lucide-react";
import { Link } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default function Home() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [related, setRelated] = useState(null);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Listen to user's Firestore doc
  useEffect(() => {
    if (!currentUser) return;
    const ref = doc(db, "users", currentUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setUserData(snap.data());
    });
    return unsub;
  }, [currentUser]);

  // When we have previously recommended movies, load related data for the latest
  useEffect(() => {
    const recommended = userData?.recommended ?? [];
    if (!recommended.length) return;
    const latest = recommended[recommended.length - 1];
    if (!latest?.tmdb_id) return;

    setLoadingRelated(true);
    fetch(`${BACKEND}/movie/${latest.tmdb_id}/related`)
      .then((r) => r.json())
      .then((data) => setRelated(data))
      .catch(console.error)
      .finally(() => setLoadingRelated(false));
  }, [userData]);

  const recommended = userData?.recommended ?? [];
  const watchNext = userData?.watchNext ?? [];
  const hasContent = recommended.length > 0;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            Hello, {userData?.name || currentUser?.email?.split("@")[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1">Here's what we've picked for you</p>
        </div>

        {/* Empty state */}
        {!hasContent ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">
              <Compass size={36} className="text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No recommendations yet</h2>
            <p className="text-gray-400 text-sm max-w-xs mb-6">
              Head to Discover to search for movies by genre and rating — your personalised dashboard will fill up here.
            </p>
            <Link
              to="/discover"
              className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Discover Movies
            </Link>
          </div>
        ) : (
          <>
            <MovieRow
              title="Previously Recommended"
              icon={Clock}
              movies={recommended}
            />

            {watchNext.length > 0 && (
              <MovieRow
                title="Watch Next"
                icon={Bookmark}
                movies={watchNext}
              />
            )}

            {loadingRelated && (
              <div className="flex items-center gap-2 text-gray-400 py-4">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading related movies...</span>
              </div>
            )}

            {related && (
              <>
                <MovieRow
                  title="From the Same Genre"
                  icon={Drama}
                  movies={related.by_genre}
                />
                <MovieRow
                  title="From the Same Director"
                  icon={Clapperboard}
                  movies={related.by_director}
                />
                <MovieRow
                  title="Featuring the Same Cast"
                  icon={Users}
                  movies={related.by_cast}
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
