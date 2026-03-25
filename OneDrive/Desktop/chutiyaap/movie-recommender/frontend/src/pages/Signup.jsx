import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Film, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      return setError("Passwords do not match.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    setLoading(true);
    try {
      console.log("Starting signup for:", email);
      const user = await signup(email, password, name);
      console.log("Signup successful, navigating home...");
      setLoading(false);
      navigate("/home", { replace: true });
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : err.message
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-950">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center mb-3 shadow-lg shadow-green-500/30">
              <Film size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create account</h1>
            <p className="text-gray-400 text-sm mt-1">Join CineSync today</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-5 text-sm text-red-400">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex justify-center items-center gap-2 text-sm mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
