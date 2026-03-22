import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Film, Compass, LogOut, Home } from "lucide-react";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
              <Film size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Cine<span className="text-green-400">Sync</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-2">
            <Link
              to="/home"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/home")
                  ? "bg-green-500/20 text-green-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Home size={16} />
              Home
            </Link>
            <Link
              to="/discover"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/discover")
                  ? "bg-green-500/20 text-green-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Compass size={16} />
              Discover
            </Link>
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              {currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
