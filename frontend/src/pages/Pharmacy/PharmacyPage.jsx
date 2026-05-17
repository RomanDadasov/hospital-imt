import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPrescriptionByQr, dispensePrescription } from "../../api/prescriptionApi";

export default function PharmacyPage() {
  const [qrInput, setQrInput] = useState("");
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    setLoading(true);
    setError("");
    setPrescription(null);
    setSuccess(false);
    try {
      const res = await getPrescriptionByQr(qrInput.trim());
      setPrescription(res.data.data);
    } catch {
      setError("Resept tapılmadı. QR kodu yoxlayın.");
    } finally { setLoading(false); }
  };

  const handleDispense = async () => {
    if (!prescription) return;
    setDispensing(true);
    try {
      await dispensePrescription(prescription.qrCode);
      setPrescription({ ...prescription, isDispensed: true });
      setSuccess(true);
    } catch {
      setError("Resept verilə bilmədi");
    } finally { setDispensing(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            💊
          </div>
          <h1 className="text-3xl font-black text-white">Pharmacy System</h1>
          <p className="text-teal-300 mt-2">E-Prescription verification and issuance portal</p>
        </div>

        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <label className="block text-xs font-semibold text-teal-300 uppercase tracking-wider">
              QR Code or Prescription Code
            </label>
            <div className="flex gap-3">
              <input
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Enter the QR code..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-teal-400/60 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition-all font-mono text-sm"
              />
              <button type="submit" disabled={loading || !qrInput.trim()}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all active:scale-95">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : "🔍 Search"}
              </button>
            </div>
          </form>

          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-rose-500/20 border border-rose-400/30 text-rose-300 px-4 py-3 rounded-xl text-sm">
              ⚠️ {error}
            </motion.div>
          )}
        </div>

       
        <AnimatePresence>
          {prescription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Status banner */}
              <div className={`px-6 py-3 flex items-center gap-2 ${prescription.isDispensed ? "bg-emerald-500" : "bg-amber-500"}`}>
                <span className="text-white font-bold text-sm">
                  {prescription.isDispensed ? "✅ This prescription has already been given" : "⏳ The prescription is pending — it has not been given"}
                </span>
                {prescription.dispensedAt && (
                  <span className="text-white/70 text-xs ml-auto">
                    {new Date(prescription.dispensedAt).toLocaleDateString("az-AZ")}
                  </span>
                )}
              </div>

              <div className="p-6 space-y-5">
             
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">👤 Patient</p>
                    <p className="font-bold text-slate-800">{prescription.patientName}</p>
                    <p className="text-xs text-slate-400 mt-1">{prescription.patientEmail}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">👨‍⚕️ Doctor</p>
                    <p className="font-bold text-slate-800">Dr. {prescription.doctorName}</p>
                    <p className="text-xs text-slate-400 mt-1">{prescription.doctorSpecialization}</p>
                  </div>
                </div>

               
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">🩺 Diagnosis</p>
                  <p className="font-bold text-slate-800">{prescription.diagnosis}</p>
                </div>

                
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">💊 Medicines</p>
                  <div className="space-y-2">
                    {prescription.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-black flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-sm">{item.medicineName}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-slate-500 bg-white border border-gray-100 px-2 py-0.5 rounded-lg">
                              {item.dosage}
                            </span>
                            <span className="text-xs text-slate-500 bg-white border border-gray-100 px-2 py-0.5 rounded-lg">
                              {item.frequency}
                            </span>
                            <span className="text-xs text-slate-500 bg-white border border-gray-100 px-2 py-0.5 rounded-lg">
                              {item.durationDays} gün
                            </span>
                          </div>
                          {item.instructions && (
                            <p className="text-xs text-slate-400 mt-1 italic">{item.instructions}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

            
                {prescription.notes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-amber-600 mb-1">📝 Doctor's Notes</p>
                    <p className="text-sm text-slate-600 italic">{prescription.notes}</p>
                  </div>
                )}

           
                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-gray-100 pt-4">
                  <span>📅 Prescription date: {new Date(prescription.prescribedAt).toLocaleDateString("az-AZ")}</span>
                  <span className="font-mono text-slate-300">{prescription.qrCode.slice(0, 16)}...</span>
                </div>

                
                {!prescription.isDispensed && (
                  <AnimatePresence>
                    {success ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                        <p className="text-emerald-600 font-bold">✅ The prescription was successfully given!</p>
                      </motion.div>
                    ) : (
                      <button onClick={handleDispense} disabled={dispensing}
                        className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-teal-200 hover:shadow-teal-300 disabled:opacity-60 transition-all active:scale-95">
                        {dispensing ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Given and marked...
                          </div>
                        ) : "💊 Give the recipe"}
                      </button>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-teal-600/40 text-xs">© 2025 MedCare Hospital · Aptek Portalı</p>
      </div>
    </div>
  );
}