import { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { createAppointment } from "../../api/appointmentApi";
import { getDoctors } from "../../api/doctorApi";
import { getPatients } from "../../api/patientApi";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";

const AppointmentFormModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState({ doctorId: "", patientId: "", appointmentDate: "", notes: "" });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getDoctors({ pageSize: 100 }).then((res) => setDoctors(res.data.data.items));
      getPatients({ pageSize: 100 }).then((res) => setPatients(res.data.data.items));
    }
    setErrors({});
    setServerError("");
    setForm({ doctorId: "", patientId: "", appointmentDate: "", notes: "" });
  }, [isOpen]);

  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const validate = () => {
    const errs = {};
    if (!form.doctorId) errs.doctorId = t("DoctorRequired");
    if (!form.patientId) errs.patientId = t("PatientRequired");
    if (!form.appointmentDate) {
      errs.appointmentDate = t("AppointmentDateRequired");
    } else if (new Date(form.appointmentDate) <= new Date()) {
      errs.appointmentDate = t("AppointmentDateFuture");
    }
    if (form.notes && form.notes.length > 1000) {
      errs.notes = t("NotesMaxLength");
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      await createAppointment({ ...form, appointmentDate: new Date(form.appointmentDate).toISOString() });
      toast.success(t("Success"), t("AppointmentCreated"));
      onSuccess();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const msg = Object.values(data.errors).flat().join(" ");
        setServerError(msg);
        toast.error(t("Error"), msg);
      } else if (data?.message) {
        setServerError(data.message);
        toast.error(t("Error"), data.message);
      }
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("CreateAppointment")}>
      {serverError && (
        <div className="bg-rose-50 text-rose-600 text-xs px-4 py-3 rounded-xl mb-4 border border-rose-100">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t("Doctor")}</label>
          <select 
            value={form.doctorId} 
            onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 ${errors.doctorId ? "border-rose-400" : "border-gray-100"}`}
          >
            <option value="">{t("SelectDoctor")}</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.fullName} - {d.specialization}</option>)}
          </select>
          {errors.doctorId && <p className="text-rose-500 text-xs mt-1">{errors.doctorId}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t("Patient")}</label>
          <select 
            value={form.patientId} 
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 ${errors.patientId ? "border-rose-400" : "border-gray-100"}`}
          >
            <option value="">{t("SelectPatient")}</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
          </select>
          {errors.patientId && <p className="text-rose-500 text-xs mt-1">{errors.patientId}</p>}
        </div>

        <div>
          <Input 
            label={t("AppointmentDate")} 
            type="datetime-local" 
            value={form.appointmentDate}
            onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} 
            min={minDateTime} 
          />
          {errors.appointmentDate && <p className="text-rose-500 text-xs mt-1">{errors.appointmentDate}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t("Notes")}</label>
          <textarea 
            value={form.notes} 
            onChange={(e) => setForm({ ...form, notes: e.target.value })} 
            rows={3}
            placeholder={t("NotesPlaceholder")}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 resize-none ${errors.notes ? "border-rose-400" : "border-gray-100"}`} 
          />
          {errors.notes && <p className="text-rose-500 text-xs mt-1">{errors.notes}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-md shadow-emerald-100"
          >
            {loading ? t("Loading") : t("CreateAppointment")}
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 border border-gray-100 text-slate-500 py-2.5 rounded-xl text-sm hover:bg-gray-50"
          >
            {t("Cancel")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentFormModal;