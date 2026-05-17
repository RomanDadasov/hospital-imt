import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { verifyTwoFactor, resendTwoFactor } from "../../api/authApi";
import useTokenStore from "../../stores/tokenStore";

const TwoFactorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens } = useTokenStore();

  const email = location.state?.email || "";
  const rememberMe = location.state?.rememberMe || false;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(300); 
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) { navigate("/login"); return; }
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newCode = [...code];
    newCode[i] = val.slice(-1);
    setCode(newCode);
    setError("");
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    if (newCode.every((c) => c !== "")) handleVerify(newCode.join(""));
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (fullCode) => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await verifyTwoFactor({ email, code: fullCode });
      const data = res.data.data;
      setTokens(
        data.accessToken,
        data.refreshToken,
        data.expiresAt,
        data.refreshTokenExpiresAt,
        rememberMe
      );
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Yanlış kod. Yenidən cəhd edin.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendTwoFactor({ email });
      setCountdown(300);
      setCode(["", "", "", "", "", ""]);
      setError("");
      inputRefs.current[0]?.focus();
    } catch {
      setError("Kod göndərilə bilmədi");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

         
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🔐
            </div>
            <h1 className="text-white font-black text-2xl">Two-Factor Authentication</h1>
            <p className="text-emerald-100 text-sm mt-2">
              <span className="font-semibold">{email}</span> A code was sent to the address
            </p>
          </div>

          <div className="px-8 py-8 space-y-6">

           
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Code validity period</p>
              <span className={`text-2xl font-black font-mono ${countdown < 60 ? "text-rose-500" : "text-emerald-600"}`}>
                {formatTime(countdown)}
              </span>
            </div>

            
            <div>
              <p className="text-xs font-semibold text-slate-500 text-center mb-4 uppercase tracking-wider">
               Enter the 6-digit code
              </p>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-xl font-black rounded-xl border-2 outline-none transition-all
                      ${error ? "border-rose-300 bg-rose-50 text-rose-600" :
                        digit ? "border-emerald-400 bg-emerald-50 text-emerald-700" :
                        "border-gray-200 bg-gray-50 text-slate-700 focus:border-emerald-400 focus:bg-white"}`}
                  />
                ))}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-500 text-xs text-center mt-3 font-medium"
                >
                  ⚠️ {error}
                </motion.p>
              )}
            </div>

      
            <button
              onClick={() => handleVerify(code.join(""))}
              disabled={loading || code.some((c) => !c)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 hover:shadow-emerald-200 disabled:opacity-50 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                 Being checked...
                </div>
              ) : "✓ Confirm"}
            </button>

            
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-slate-400">
                  Send the code again — <span className="font-semibold text-slate-600">{formatTime(countdown)}</span> later
                </p>
              ) : (
                <button onClick={handleResend} disabled={resending}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2 disabled:opacity-50">
                  {resending ? "Sent..." : "🔄 Resend the code"}
                </button>
              )}
            </div>

            
            <button onClick={() => navigate("/login")}
              className="w-full py-2.5 border border-gray-200 text-slate-400 text-sm rounded-xl hover:bg-gray-50 transition-colors">
              ← Go back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TwoFactorPage;