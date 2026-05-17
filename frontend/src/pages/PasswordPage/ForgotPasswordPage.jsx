import { useState } from "react";
import { forgotPassword } from "../../api/authApi";
import medicalSnake from "../../assets/img/medical-logo.jpg";
import { useTranslation } from "react-i18next";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState({ error: "", success: "", loading: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setFormState({ error: t("EmailRequired"), success: "", loading: false });
      return;
    }
    setFormState({ error: "", success: "", loading: true });
    try {
      await forgotPassword({ email });
      setFormState({
        error: "",
        success: t("ResetLinkSent"),
        loading: false
      });
      setEmail("");
    } catch (err) {
      const data = err.response?.data;
      setFormState({
        error: data?.message || t("ErrorOccurred"),
        success: "",
        loading: false
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
      <div className="absolute inset-0">
        <img src="src/assets/img/indir (4).jpg" alt="bg" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/70 via-teal-900/60 to-cyan-950/50 mix-blend-multiply" />
      </div>
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.25),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(45,212,191,0.20),transparent_50%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-6 backdrop-blur-2xl bg-white/5 border border-emerald-500/20 rounded-3xl shadow-2xl p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-600/40 mb-4">
            <img src={medicalSnake} alt="logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white">{t("ForgotPassword")}</h1>
          <p className="text-teal-200/80 text-center mt-2">
            {t("ForgotPasswordDesc")}
          </p>
        </div>

        {formState.error && (
          <div className="bg-red-900/40 border border-red-600/40 text-red-200 px-5 py-4 rounded-2xl text-center mb-6">
            {formState.error}
          </div>
        )}

        {formState.success && (
          <div className="bg-emerald-900/40 border border-emerald-600/40 text-emerald-200 px-5 py-4 rounded-2xl text-center mb-6">
            {formState.success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div>
            <label className="block text-sm font-semibold text-emerald-300 mb-3 uppercase tracking-wider">Email</label>
            <input
              type="text"
              placeholder="doctor@hospital.az"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="new-password"
              className="w-full px-6 py-5 rounded-2xl bg-white/10 border border-emerald-500/30 text-white placeholder-teal-300/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40 outline-none transition-all text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={formState.loading}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xl shadow-xl shadow-emerald-700/30 hover:shadow-2xl transition-all duration-300 disabled:opacity-60">
            {formState.loading ? t("Sending") : t("SendLink")}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/login" className="text-emerald-400 hover:text-emerald-300 text-sm transition">
            ← {t("BackToLogin")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;