import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPrescription, getPrescriptionsByAppointment, downloadPrescriptionPdf } from "../../api/prescriptionApi";
import { useToast } from "../../context/ToastContext";
import { useTranslation } from "react-i18next";

const emptyItem = {
  medicineName: "",
  dosage: "",
  frequency: "",
  durationDays: 7,
  instructions: "",
};

const emptyForm = {
  diagnosis: "",
  notes: "",
  items: [{ ...emptyItem }],
};

export default function PrescriptionModal({ appointment, onClose }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [tab, setTab] = useState("new"); 
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (tab === "history") fetchHistory();
  }, [tab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await getPrescriptionsByAppointment(appointment.id);
      setPrescriptions(res.data.data);
    } catch { } finally { setLoadingHistory(false); }
  };

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));

  const removeItem = (i) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }));

  const updateItem = (i, key, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[i] = { ...items[i], [key]: value };
      return { ...prev, items };
    });
  };

  const handleSubmit = async () => {
    if (!form.diagnosis.trim()) { toast.warning(t("Warning"), t("DiagnosisRequired")); return; }
    if (form.items.some((i) => !i.medicineName.trim())) { toast.warning(t("Warning"), t("MedicineNameRequired")); return; }

    setSaving(true);
    try {
      await createPrescription({
        appointmentId: appointment.id,
        diagnosis: form.diagnosis,
        notes: form.notes,
        items: form.items,
      });
      toast.success(t("Success"), t("PrescriptionCreatedAndSent"));
      setForm(emptyForm);
      setTab("history");
      fetchHistory();
    } catch {
      toast.error(t("Error"), t("PrescriptionCreateFailed"));
    } finally { setSaving(false); }
  };

  const handleDownloadPdf = async (id) => {
    setDownloadingId(id);
    try {
      const res = await downloadPrescriptionPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error(t("Error"), t("PdfDownloadFailed"));
    } finally { setDownloadingId(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col z-10"
      >
      
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-xl">
              💊
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">{t("EPrescription")}</h2>
              <p className="text-xs text-slate-400">{appointment.patientName} · {appointment.doctorName}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-slate-400 hover:bg-gray-200 transition-colors text-sm">
            ✕
          </button>
        </div>

      
        <div className="flex border-b border-gray-100">
          <button onClick={() => setTab("new")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === "new" ? "text-teal-600 border-b-2 border-teal-500" : "text-slate-400 hover:text-slate-600"}`}>
            ✚ {t("NewPrescription")}
          </button>
          <button onClick={() => setTab("history")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === "history" ? "text-teal-600 border-b-2 border-teal-500" : "text-slate-400 hover:text-slate-600"}`}>
            📋 {t("History")}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">

          
          {tab === "new" && (
            <div className="space-y-5">

          
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">{t("Diagnosis")} *</label>
                <input
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder={t("DiagnosisPlaceholder")}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-teal-300 text-slate-700 transition-colors"
                />
              </div>

             
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("Medicines")} *</label>
                  <button onClick={addItem}
                    className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-semibold bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 hover:bg-teal-100 transition-all">
                    + {t("AddMedicine")}
                  </button>
                </div>

                <div className="space-y-3">
                  {form.items.map((item, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">#{i + 1} {t("Medicine")}</span>
                        {form.items.length > 1 && (
                          <button onClick={() => removeItem(i)}
                            className="w-6 h-6 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 flex items-center justify-center text-xs transition-colors">
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <input
                            value={item.medicineName}
                            onChange={(e) => updateItem(i, "medicineName", e.target.value)}
                            placeholder={t("MedicineNamePlaceholder")}
                            className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:border-teal-300 text-slate-700 transition-colors"
                          />
                        </div>
                        <input
                          value={item.dosage}
                          onChange={(e) => updateItem(i, "dosage", e.target.value)}
                          placeholder={t("DosagePlaceholder")}
                          className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:border-teal-300 text-slate-700 transition-colors"
                        />
                        <input
                          value={item.frequency}
                          onChange={(e) => updateItem(i, "frequency", e.target.value)}
                          placeholder={t("FrequencyPlaceholder")}
                          className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:border-teal-300 text-slate-700 transition-colors"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={item.durationDays}
                            onChange={(e) => updateItem(i, "durationDays", parseInt(e.target.value) || 1)}
                            min={1}
                            className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:border-teal-300 text-slate-700 transition-colors"
                          />
                          <span className="text-xs text-slate-400 whitespace-nowrap">{t("Days")}</span>
                        </div>
                        <input
                          value={item.instructions}
                          onChange={(e) => updateItem(i, "instructions", e.target.value)}
                          placeholder={t("InstructionsPlaceholder")}
                          className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:border-teal-300 text-slate-700 transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">{t("AdditionalNotes")}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={t("AdditionalNotesPlaceholder")}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-teal-300 text-slate-700 transition-colors resize-none"
                />
              </div>

              
              <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-xs text-teal-700">
                💊 {t("PrescriptionInfoText")}
              </div>

             
              <button onClick={handleSubmit} disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-teal-100 hover:shadow-teal-200 disabled:opacity-60 transition-all active:scale-95">
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("Creating")}...
                  </div>
                ) : `💊 ${t("CreateAndSendPrescription")}`}
              </button>
            </div>
          )}

        
          {tab === "history" && (
            <div className="space-y-3">
              {loadingHistory ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-4 space-y-2 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-48" />
                      <div className="h-3 bg-gray-100 rounded w-32" />
                    </div>
                  ))}
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl border border-gray-100">💊</div>
                  <p className="text-sm font-bold text-slate-500">{t("NoPrescriptions")}</p>
                  <p className="text-xs text-slate-400">{t("NoPrescriptionsDesc")}</p>
                </div>
              ) : (
                prescriptions.map((p) => (
                  <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-800">🩺 {p.diagnosis}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold border ${p.isDispensed ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                            {p.isDispensed ? `✓ ${t("Dispensed")}` : `⏳ ${t("Waiting")}`}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {p.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                              <span className="font-medium text-slate-700">{item.medicineName}</span>
                              <span>·</span>
                              <span>{item.dosage}</span>
                              <span>·</span>
                              <span>{item.frequency}</span>
                              <span>·</span>
                              <span>{item.durationDays} {t("Days")}</span>
                            </div>
                          ))}
                        </div>

                        {p.notes && (
                          <p className="text-xs text-slate-400 italic">{p.notes}</p>
                        )}

                        <p className="text-xs text-slate-300 font-mono">
                          📅 {new Date(p.prescribedAt).toLocaleDateString("az-AZ")}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDownloadPdf(p.id)}
                        disabled={downloadingId === p.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-100 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex-shrink-0"
                      >
                        {downloadingId === p.id ? (
                          <div className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        ) : "⬇ PDF"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}