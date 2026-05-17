import { useState, useRef, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Environment } from "@react-three/drei";
import { login } from "../../api/authApi";
import { getProfile } from "../../api/userApi";
import useTokenStore from "../../stores/tokenStore";
import medicalSnake from "../../assets/img/medical-logo.jpg";
import hospitalIcon from "../../assets/icons/hospital-svgrepo-com.svg";

const BrightFastStars = () => {
  const starsRef = useRef();
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.024;
      starsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.04) * 0.1;
      starsRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.03) * 0.05;
    }
  });
  return (
    <group ref={starsRef}>
      <Stars radius={70} depth={70} count={3500} factor={5.5} saturation={0.7} fade speed={2} />
    </group>
  );
};

const SoftLighting = () => (
  <>
    <ambientLight intensity={0.35} />
    <pointLight position={[5, 5, 5]} intensity={0.6} color="#10b981" />
    <pointLight position={[-5, 3, 4]} intensity={0.5} color="#14b8a6" />
    <pointLight position={[3, 4, 2]} intensity={0.4} color="#4facfe" />
    <directionalLight position={[2, 5, 3]} intensity={0.45} color="#ffffff" />
  </>
);

const navLinks = [
  { href: "/", icon: "🏠", label: "Home", desc: "Information about the clinic", color: "bg-white/5 border-white/10 hover:bg-white/10" },
  { href: "/our-doctors", icon: "👨‍⚕️", label: "Our Doctors", desc: "View our specialist doctors", color: "bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/20" },
  { href: "/symptom-checker", icon: "🩺", label: "Symptom Checker", desc: "Use without registration", color: "bg-teal-500/10 border-teal-500/30 hover:bg-teal-500/20" },
  { href: "/education", icon: "📚", label: "Medical Education", desc: "Free video lessons", color: "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" },
];

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formState, setFormState] = useState({ error: "", loading: false });
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { setTokens, setUser } = useTokenStore();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState({ error: "", loading: true });
    try {
      const res = await login({ email, password });
      const data = res.data.data;
      if (data.requiresTwoFactor) {
        navigate("/two-factor", { state: { email, rememberMe } });
        return;
      }
      setTokens(data.accessToken, data.refreshToken, rememberMe);
      const profileRes = await getProfile();
      setUser(profileRes.data.data);
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = data?.errors
        ? Object.values(data.errors).flat().join(" ")
        : data?.message || "An error occurred.";
      setFormState({ error: errorMsg, loading: false });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">

      
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950" />

      {/* Rəngli dairələr */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(16,185,129,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(20,184,166,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(79,172,254,0.15),transparent_50%)]" />
      </div>

      
      {!isMobile && (
        <div className="absolute inset-0 z-0">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 60 }}
            style={{ background: "transparent" }}
            gl={{ alpha: true, antialias: true }}
            onCreated={({ gl }) => {
              gl.setClearColor("#030712", 0);
            }}
          >
            <Suspense fallback={null}>
              <SoftLighting />
              <BrightFastStars />
              <Environment preset="night" />
            </Suspense>
          </Canvas>
        </div>
      )}

      
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/30 via-transparent to-gray-950/20 pointer-events-none z-[1]" />

      
      <div
        className="relative z-10 w-full max-w-5xl backdrop-blur-xl bg-black/30 border border-emerald-500/20 rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2"
        style={{
          transition: "opacity 0.8s ease",
          opacity: mounted ? 1 : 0,
        }}
      >

        
        <div
          className="hidden md:flex flex-col justify-between p-12 text-white relative overflow-hidden bg-black/30"
          style={{
            transition: "transform 0.9s cubic-bezier(0.34, 0.16, 0.3, 1), opacity 0.9s ease",
            transform: mounted ? "translateX(0)" : "translateX(-120%)",
            opacity: mounted ? 1 : 0,
          }}
        >
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-600/40 animate-gentle-bounce">
                <img src={medicalSnake} alt="logo" className="w-20 h-20 object-contain" />
              </div>
              <div>
                <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                  MHC
                </h2>
                <p className="text-emerald-200/80 text-lg">Smart Healthcare Management</p>
              </div>
            </div>

            <h3 className="text-5xl font-black leading-tight mb-6">
              Welcome<span className="text-emerald-400 animate-pulse-slow">.</span>
            </h3>

            <p className="text-xl text-white/80 max-w-md">
              Patient records, appointments, and medical processes are now smarter and more secure.
            </p>
          </div>

          <div className="mt-8 space-y-2">
            {navLinks.map((item) => (
              <a key={item.href} href={item.href}
                className={`flex items-center gap-3 ${item.color} border rounded-2xl px-5 py-3.5 transition-all duration-300 group backdrop-blur-sm hover:scale-[1.02]`}>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-white/80 font-semibold text-sm">{item.label}</p>
                  <p className="text-white/40 text-xs">{item.desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  className="ml-auto text-white/30 group-hover:translate-x-1 transition-transform shrink-0">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>

          <p className="text-sm text-white/50 mt-4">
            © {new Date().getFullYear()} MHC • Seamless & Intelligent Hospital Management
          </p>
        </div>

        {/* Sağ panel — sağdan gəlir */}
        <div
          className="flex items-center justify-center bg-black/30 backdrop-blur-xl p-6 md:p-16 relative"
          style={{
            transition: "transform 0.9s cubic-bezier(0.34, 0.16, 0.3, 1), opacity 0.9s ease",
            transitionDelay: "0.1s",
            transform: mounted ? "translateX(0)" : "translateX(120%)",
            opacity: mounted ? 1 : 0,
          }}
        >
          <div className="w-full max-w-md space-y-5">

            {/* Mobil logo */}
            <div className="flex md:hidden items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl overflow-hidden animate-gentle-bounce">
                <img src={medicalSnake} alt="logo" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">MHC</h2>
                <p className="text-emerald-200/80 text-xs">Smart Healthcare Management</p>
              </div>
            </div>

            {/* Başlıq */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
                Sign In
                <img src={hospitalIcon} alt="Hospital Logo" className="w-8 h-6 md:w-10 md:h-8 animate-gentle-bounce" />
              </h1>
              <p className="mt-1 text-teal-100/90 text-sm md:text-base">Sign in to your account</p>
            </div>

            {/* Error */}
            {formState.error && (
              <div className="bg-red-900/50 border border-red-600/50 text-red-200 px-4 py-3 rounded-2xl text-center text-sm animate-shake backdrop-blur-sm">
                {formState.error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  type="text"
                  placeholder="doctor@hospital.az"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/15 border border-emerald-500/40 text-white placeholder-teal-300/70 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40 outline-none transition-all duration-300 text-base hover:bg-white/20 focus:bg-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-300 mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/15 border border-emerald-500/40 text-white placeholder-teal-300/70 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 outline-none transition-all duration-300 text-base hover:bg-white/20 focus:bg-white/20"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-teal-200">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded" />
                  <span className="group-hover:text-emerald-300 transition text-xs">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-emerald-400 hover:text-emerald-300 transition text-xs">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={formState.loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg shadow-xl shadow-emerald-700/30 hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-60 active:scale-95"
              >
                {formState.loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>

            {/* Mobil nav linklər */}
            <div className="md:hidden flex flex-col gap-2 pt-2">
              <p className="text-xs text-white/30 text-center mb-1">Explore</p>
              {navLinks.map((item) => (
                <a key={item.href} href={item.href}
                  className={`flex items-center gap-3 ${item.color} border rounded-2xl px-4 py-3 transition-all duration-300 group backdrop-blur-sm hover:scale-[1.02]`}>
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/80 font-semibold text-sm">{item.label}</p>
                    <p className="text-white/40 text-xs truncate">{item.desc}</p>
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    className="ml-auto text-white/30 shrink-0 group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ))}
              <p className="text-xs text-white/20 text-center mt-1">
                © {new Date().getFullYear()} MHC • Smart Healthcare Management
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;