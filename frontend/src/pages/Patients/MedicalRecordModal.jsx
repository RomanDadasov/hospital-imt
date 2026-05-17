import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  downloadPatientHistoryPdf,
} from "../../api/medicalRecordApi";
import { useToast } from "../../context/ToastContext";
import { useTranslation } from "react-i18next";

const emptyForm = {
  diagnosis: "",
  treatment: "",
  prescription: "",
  notes: "",
  doctorName: "",
  department: "",
  recordDate: new Date().toISOString().slice(0, 10),
};

export default function MedicalRecordModal({ patient, onClose }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getMedicalRecords(patient.id);
      setRecords(res.data.data);
    } catch {
      toast.error(t("Error"), t("MedicalRecordsLoadFailed"));
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.diagnosis.trim()) { toast.warning(t("Warning"), t("DiagnosisRequired")); return; }
    setSaving(true);
    try {
      if (editingRecord) {
        await updateMedicalRecord(editingRecord.id, { ...form, recordDate: new Date(form.recordDate).toISOString() });
        toast.success(t("Success"), t("RecordUpdated"));
      } else {
        await createMedicalRecord({ ...form, patientId: patient.id, recordDate: new Date(form.recordDate).toISOString() });
        toast.success(t("Success"), t("RecordCreated"));
      }
      setShowForm(false);
      setEditingRecord(null);
      setForm(emptyForm);
      fetchRecords();
    } catch {
      toast.error(t("Error"), t("OperationFailed"));
    } finally { setSaving(false); }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setForm({
      diagnosis: record.diagnosis || "",
      treatment: record.treatment || "",
      prescription: record.prescription || "",
      notes: record.notes || "",
      doctorName: record.doctorName || "",
      department: record.department || "",
      recordDate: record.recordDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMedicalRecord(id);
      toast.success(t("Success"), t("RecordDeleted"));
      setDeleteConfirm(null);
      fetchRecords();
    } catch {
      toast.error(t("Error"), t("DeleteFailed"));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecord(null);
    setForm(emptyForm);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await downloadPatientHistoryPdf(patient.id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("Xəta!", "PDF yüklənmədi");
    } finally { setDownloadingPdf(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-lg">
              {patient.fullName?.[0] || "X"}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">{patient.fullName}</h2>
              <p className="text-xs text-slate-400">{t("MedicalHistory")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
           
            {records.length > 0 && !showForm && (
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-100 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {downloadingPdf ? (
                  <div className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                ) : "⬇"} PDF
              </button>
            )}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all"
              >
                <span className="text-base leading-none">+</span> {t("NewRecord")}
              </button>
            )}
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-slate-400 hover:bg-gray-200 transition-colors text-sm">
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 space-y-4"
              >
                <h3 className="text-sm font-black text-slate-700">
                  {editingRecord ? "✎ " + t("EditRecord") : "✚ " + t("NewRecord")}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">{t("Diagnosis")} *</label>
                    <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                      placeholder={t("DiagnosisPlaceholder")}
                      className="w-full px-3 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm outline-none focus:border-emerald-400 text-slate-700 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">{t("DoctorName")}</label>
                    <input value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                      placeholder={t("DoctorNamePlaceholder")}
                      className="w-full px-3 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm outline-none focus:border-emerald-400 text-slate-700 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">{t("Department")}</label>
                    <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                      placeholder={t("DepartmentPlaceholder")}
                      className="w-full px-3 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm outline-none focus:border-emerald-400 text-slate-700 transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">{t("Treatment")}</label>
                    <textarea value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                      placeholder={t("TreatmentPlaceholder")} rows={2}
                      className="w-full px-3 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm outline-none focus:border-emerald-400 text-slate-700 transition-colors resize-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">{t("Prescription")}</label>
                    <textarea value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })}
                      placeholder={t("PrescriptionPlaceholder")} rows={2}
                      className="w-full px-3 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm outline-none focus:border-emerald-400 text-slate-700 transition-colors resize-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">{t("Notes")}</label>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder={t("NotesPlaceholder")} rows={2}
                      className="w-full px-3 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm outline-none focus:border-emerald-400 text-slate-700 transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">{t("Date")}</label>
                    <input type="date" value={form.recordDate} onChange={(e) => setForm({ ...form, recordDate: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm outline-none focus:border-emerald-400 text-slate-700 transition-colors" />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button onClick={handleCloseForm}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-slate-500 text-xs hover:bg-gray-50 transition-colors">
                    {t("Cancel")}
                  </button>
                  <button onClick={handleSubmit} disabled={saving}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-100 hover:shadow-emerald-200 disabled:opacity-60 transition-all">
                    {saving ? t("Saving") : editingRecord ? t("Update") : t("Save")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

       
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4 space-y-2 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded-lg w-48" />
                  <div className="h-3 bg-gray-100 rounded-lg w-32" />
                  <div className="h-3 bg-gray-100 rounded-lg w-64" />
                </div>
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl border border-gray-100">🩺</div>
              <p className="text-sm font-bold text-slate-500">{t("NoMedicalRecords")}</p>
              <p className="text-xs text-slate-400">{t("NoMedicalRecordsDesc")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <motion.div key={record.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🩺</span>
                        <span className="text-sm font-black text-slate-800">{record.diagnosis}</span>
                      </div>
                      {(record.doctorName || record.department) && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>👨‍⚕️</span>
                          <span>{[record.doctorName, record.department].filter(Boolean).join(" — ")}</span>
                        </div>
                      )}
                      {record.treatment && (
                        <div className="flex items-start gap-2 text-xs text-slate-500">
                          <span className="mt-0.5">💊</span>
                          <span>{record.treatment}</span>
                        </div>
                      )}
                      {record.prescription && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-700">
                          <span className="font-semibold">{t("Prescription")}: </span>{record.prescription}
                        </div>
                      )}
                      {record.notes && <p className="text-xs text-slate-400 italic">{record.notes}</p>}
                      <p className="text-xs text-slate-300 font-mono">
                        📅 {new Date(record.recordDate).toLocaleDateString("az-AZ")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => handleEdit(record)}
                        className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 hover:bg-sky-100 flex items-center justify-center text-xs transition-colors">
                        ✎
                      </button>
                      <button onClick={() => setDeleteConfirm(record.id)}
                        className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center text-xs transition-colors">
                        ✕
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {deleteConfirm === record.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-rose-100 flex items-center justify-between">
                        <p className="text-xs text-rose-500 font-medium">{t("DeleteConfirm")}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-slate-500 hover:bg-gray-50">
                            {t("No")}
                          </button>
                          <button onClick={() => handleDelete(record.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600">
                            {t("Yes")}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}