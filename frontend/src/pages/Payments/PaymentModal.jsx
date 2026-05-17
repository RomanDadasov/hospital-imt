import { useState } from "react";
import { processPayment } from "../../api/paymentApi";
import { useTranslation } from "react-i18next";

const formatCardNumber = (value) => {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
};

const getCardType = (number) => {
  const clean = number.replace(/\s/g, "");
  if (clean.startsWith("4")) return "visa";
  if (clean.startsWith("5")) return "mastercard";
  if (clean.startsWith("3")) return "amex";
  return "unknown";
};

const PaymentModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    cardNumber: "", cardHolderName: "", expiryMonth: "", expiryYear: "", cvv: ""
  });
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState("form");

  if (!isOpen) return null;

  const amount = appointment?.doctorConsultationFee || 0;
  const cardType = getCardType(form.cardNumber);
  const expiry = `${form.expiryMonth || "MM"}/${form.expiryYear || "YY"}`;
  const displayNumber = form.cardNumber || "•••• •••• •••• ••••";
  const displayName = form.cardHolderName || "AD SOYAD";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep("processing");
    try {
      await new Promise((r) => setTimeout(r, 2500));
      const res = await processPayment({
        appointmentId: appointment.id,
        amount: amount,
        cardNumber: form.cardNumber.replace(/\s/g, ""),
        cardHolderName: form.cardHolderName,
        expiryMonth: form.expiryMonth,
        expiryYear: form.expiryYear,
        cvv: form.cvv,
      });
      setResult(res.data.data);
      setStep("result");
    } catch {
      setResult({ status: "Failed", failureReason: t("ConnectionError") });
      setStep("result");
    }
  };

  const handleClose = () => {
    setStep("form");
    setResult(null);
    setForm({ cardNumber: "", cardHolderName: "", expiryMonth: "", expiryYear: "", cvv: "" });
    if (result?.status === "Paid") onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">💳 {t("Payment")}</h2>
              <p className="text-slate-400 text-xs mt-0.5">{appointment?.patientName} — {appointment?.doctorName}</p>
            </div>
            <button onClick={handleClose} className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all">✕</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">

         
          {step === "form" && (
            <>
         
              <div className="mb-6" style={{ perspective: "1000px" }}>
                <div
                  className="relative w-full h-44 transition-all duration-700"
                  style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                >
               
                  <div className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between overflow-hidden"
                    style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md opacity-90" />
                      {cardType === "visa" && <span className="text-white font-black text-xl italic">VISA</span>}
                      {cardType === "mastercard" && (
                        <div className="flex">
                          <div className="w-7 h-7 bg-red-500 rounded-full opacity-90" />
                          <div className="w-7 h-7 bg-yellow-400 rounded-full -ml-3 opacity-90" />
                        </div>
                      )}
                      {cardType === "unknown" && <div className="w-10 h-6 bg-white/10 rounded" />}
                    </div>
                    <div>
                      <p className="text-white font-mono text-lg tracking-widest mb-3">{displayNumber}</p>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">{t("CardHolder")}</p>
                          <p className="text-white text-sm font-semibold tracking-wider">{displayName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">{t("Expiry")}</p>
                          <p className="text-white text-sm font-semibold">{expiry}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-2xl pointer-events-none" />
                  </div>

               
                  <div className="absolute inset-0 rounded-2xl overflow-hidden"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
                    <div className="w-full h-10 bg-slate-700 mt-6" />
                    <div className="px-5 mt-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-9 bg-slate-200 rounded" />
                        <div className="w-14 h-9 bg-white rounded flex items-center justify-center">
                          <p className="text-slate-800 font-mono font-bold text-sm">{form.cvv || "•••"}</p>
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs mt-2 text-right">CVV</p>
                    </div>
                  </div>
                </div>
              </div>

             
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{t("CardNumber")}</label>
                  <input
                    type="text" placeholder="1234 5678 9012 3456"
                    value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                    required maxLength={19}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{t("CardHolderName")}</label>
                  <input
                    type="text" placeholder="AD SOYAD"
                    value={form.cardHolderName}
                    onChange={(e) => setForm({ ...form, cardHolderName: e.target.value.toUpperCase() })}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{t("Month")}</label>
                    <select value={form.expiryMonth} onChange={(e) => setForm({ ...form, expiryMonth: e.target.value })} required
                      className="w-full px-3 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none">
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{t("Year")}</label>
                    <select value={form.expiryYear} onChange={(e) => setForm({ ...form, expiryYear: e.target.value })} required
                      className="w-full px-3 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none">
                      <option value="">YY</option>
                      {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i).slice(-2)).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">CVV</label>
                    <input
                      type="text" placeholder="•••"
                      value={form.cvv}
                      onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      onFocus={() => setFlipped(true)}
                      onBlur={() => setFlipped(false)}
                      required maxLength={4}
                      className="w-full px-3 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

          
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{t("Amount")}</span>
                    <span className="text-emerald-400 font-black text-2xl">{amount} ₼</span>
                  </div>
                </div>

           
                <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                  <p className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wider">{t("TestCards")}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400"><span className="text-emerald-400 font-mono">4242 4242 4242 4242</span> → {t("AlwaysSuccess")}</p>
                    <p className="text-xs text-slate-400"><span className="text-rose-400 font-mono">4000 0000 0000 0002</span> → {t("AlwaysDecline")}</p>
                    <p className="text-xs text-slate-400"><span className="text-amber-400 font-mono">4000 0000 0000 0069</span> → {t("ExpiredCard")}</p>
                  </div>
                </div>

                <button type="submit"
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/30 hover:-translate-y-0.5">
                  💳 {amount} ₼ {t("Pay")}
                </button>
              </form>
            </>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-3xl">💳</div>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">{t("Processing")}</p>
                <p className="text-slate-400 text-sm mt-1">{t("ProcessingDesc")}</p>
              </div>
              <div className="flex gap-2">
                {[t("Checking"), t("Confirming"), t("Completing")].map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                    <span className="text-slate-400 text-xs">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

         
          {step === "result" && result && (
            <div className="flex flex-col items-center py-8 gap-5">
              {result.status === "Paid" ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-emerald-400 font-black text-xl">{t("PaymentSuccess")}</p>
                    <p className="text-slate-400 text-sm mt-1">{t("PaymentSuccessDesc")}</p>
                  </div>
                  <div className="w-full bg-slate-800 rounded-xl p-4 space-y-2 border border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t("Patient")}</span>
                      <span className="text-white font-semibold">{appointment?.patientName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t("Doctor")}</span>
                      <span className="text-white font-semibold">{appointment?.doctorName}</span>
                    </div>
                    <div className="border-t border-slate-700 pt-2 mt-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t("Amount")}</span>
                      <span className="text-emerald-400 font-black text-lg">{result.amount} ₼</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t("Card")}</span>
                      <span className="text-white font-mono">•••• {result.cardLast4}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t("TransactionId")}</span>
                      <span className="text-emerald-400 font-mono text-xs">{result.transactionId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t("Date")}</span>
                      <span className="text-white text-xs">{new Date(result.createdAt).toLocaleString("az-AZ")}</span>
                    </div>
                  </div>
                  <button onClick={handleClose}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all">
                    ✓ {t("Close")}
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-rose-400">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-rose-400 font-black text-xl">{t("PaymentFailed")}</p>
                    <p className="text-slate-400 text-sm mt-1">{result.failureReason || t("ErrorOccurred")}</p>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button onClick={() => { setStep("form"); setResult(null); }}
                      className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">
                      {t("TryAgain")}
                    </button>
                    <button onClick={handleClose}
                      className="flex-1 py-3 border border-slate-600 text-slate-400 hover:text-white font-bold rounded-xl transition-all">
                      {t("Close")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;