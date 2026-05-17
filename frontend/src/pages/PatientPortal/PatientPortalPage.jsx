import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getPortalData, payAppointment } from "../../api/patientPortalApi";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";

const statusColors = {
  Pending:   "bg-amber-50 text-amber-700 border-amber-100",
  Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Completed: "bg-sky-50 text-sky-700 border-sky-100",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  InQueue:   "bg-violet-50 text-violet-700 border-violet-100",
};

const statusLabels = {
  Pending:   "Pending",
  Confirmed: "Confirmed",
  Completed: "Completed",
  Cancelled: "Cancelled",
  InQueue:   "InQueue",
};

export default function PatientPortalPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [paidIds, setPaidIds] = useState([]);
  const [successId, setSuccessId] = useState(null);
  
  // Ödəniş forması üçün state-lər
  const [showPaymentForm, setShowPaymentForm] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) { setError(true); setLoading(false); return; }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const res = await getPortalData(token);
      setData(res.data.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (appointmentId) => {
    if (!cardNumber.trim() || !cardHolder.trim() || !expiryMonth.trim() || !expiryYear.trim() || !cvv.trim()) {
      toast.warning(t("Warning"), t("FillAllCardFields"));
      return;
    }
    
    setProcessing(true);
    try {
      await payAppointment(token, appointmentId);
      setPaidIds((prev) => [...prev, appointmentId]);
      setSuccessId(appointmentId);
      setShowPaymentForm(null);
      // Formu təmizlə
      setCardNumber("");
      setCardHolder("");
      setExpiryMonth("");
      setExpiryYear("");
      setCvv("");
      fetchData();
      setTimeout(() => setSuccessId(null), 3000);
      toast.success(t("Success"), t("PaymentSuccess"));
    } catch {
      toast.error(t("Error"), t("PaymentFailed"));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">{t("Loading")}</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 border border-rose-100">
          🔐
        </div>
        <h1 className="text-xl font-black text-slate-800 mb-2">{t("InvalidLink")}</h1>
        <p className="text-slate-400 text-sm">{t("InvalidLinkDesc")}</p>
      </div>
    </div>
  );

  const unpaidCount = data.appointments.filter(a => !a.isPaid && a.status !== "Cancelled" && a.status !== "Completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-emerald-100">
              🏥
            </div>
            <div>
              <p className="text-xs text-slate-400">Hospital Management</p>
              <p className="text-sm font-black text-slate-700">{t("PatientPortal")}</p>
            </div>
          </div>
          {unpaidCount > 0 && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-rose-600">{unpaidCount} {t("Unpaid")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Xəstə məlumatları */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-100">
              {data.patientName?.[0]}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800">{data.patientName}</h1>
              <p className="text-sm text-slate-400">{data.email}</p>
              {data.phone && <p className="text-sm text-slate-400">📞 {data.phone}</p>}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-slate-400">
            ⏱️ {t("PortalLinkValidUntil")}: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("az-AZ")}
          </div>
        </motion.div>

        {/* Randevular */}
        <div>
          <h2 className="text-sm font-black text-slate-600 uppercase tracking-wider mb-4 px-1">
            📅 {t("MyAppointments")} ({data.appointments.length})
          </h2>

          {data.appointments.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-slate-500 font-bold">{t("NoAppointments")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.appointments.map((apt, i) => {
                const isPaid = apt.isPaid || paidIds.includes(apt.id);
                const canPay = !isPaid && apt.status !== "Cancelled" && apt.status !== "Completed";

                return (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all ${successId === apt.id ? "border-emerald-300 shadow-emerald-100" : "border-gray-100"}`}
                  >
                    <AnimatePresence>
                      {successId === apt.id && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="bg-emerald-500 px-6 py-2 text-white text-xs font-bold text-center"
                        >
                          ✅ {t("PaymentSuccess")}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center text-lg">
                              👨‍⚕️
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800">{apt.doctorName}</p>
                              <p className="text-xs text-slate-400">{apt.department}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs text-slate-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 font-mono">
                              📅 {new Date(apt.appointmentDate).toLocaleString("az-AZ", {
                                day: "2-digit", month: "2-digit", year: "numeric",
                                hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${statusColors[apt.status] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
                              {t(statusLabels[apt.status] || apt.status)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <p className="text-xl font-black text-slate-800">{apt.consultationFee} ₼</p>

                          {isPaid ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                              ✅ {t("Paid")}
                            </span>
                          ) : canPay ? (
                            <div>
                              {showPaymentForm === apt.id ? (
                                <div className="mt-2 p-3 bg-slate-50 rounded-xl w-64">
                                  <input
                                    type="text"
                                    placeholder="4242 4242 4242 4242"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                                    className="w-full px-3 py-2 mb-2 border rounded-lg text-sm"
                                  />
                                  <input
                                    type="text"
                                    placeholder="KART SAHİBİ"
                                    value={cardHolder}
                                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                                    className="w-full px-3 py-2 mb-2 border rounded-lg text-sm"
                                  />
                                  <div className="flex gap-2 mb-2">
                                    <input
                                      type="text"
                                      placeholder="MM"
                                      maxLength={2}
                                      value={expiryMonth}
                                      onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                                      className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                                    />
                                    <input
                                      type="text"
                                      placeholder="YY"
                                      maxLength={2}
                                      value={expiryYear}
                                      onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
                                      className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                                    />
                                    <input
                                      type="password"
                                      placeholder="CVV"
                                      maxLength={4}
                                      value={cvv}
                                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                      className="w-1/3 px-3 py-2 border rounded-lg text-sm"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handlePay(apt.id)}
                                      disabled={processing}
                                      className="flex-1 bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                                    >
                                      {processing ? t("Processing") : t("Pay")}
                                    </button>
                                    <button
                                      onClick={() => setShowPaymentForm(null)}
                                      className="flex-1 border border-gray-300 py-2 rounded-lg text-sm"
                                    >
                                      {t("Cancel")}
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-2 text-center">
                                    Test kartı: 4242 4242 4242 4242
                                  </p>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowPaymentForm(apt.id)}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all"
                                >
                                  💳 {t("Pay")}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 font-medium">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-xs text-slate-300">© 2025 Hospital Management · {t("PatientPortal")}</p>
        </div>
      </div>
    </div>
  );
}