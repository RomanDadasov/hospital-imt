import { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { createPatient, updatePatient } from "../../api/patientApi";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";

const PatientFormModal = ({ isOpen, onClose, patient, onSuccess }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", dateOfBirth: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setForm({
        firstName: patient.firstName || "", lastName: patient.lastName || "",
        email: patient.email || "", phone: patient.phone || "",
        address: patient.address || "", dateOfBirth: patient.dateOfBirth || "",
      });
    } else {
      setForm({ firstName: "", lastName: "", email: "", phone: "", address: "", dateOfBirth: "" });
    }
    setErrors({});
    setServerError("");
  }, [patient, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = t("FirstNameRequired");
    if (!form.lastName.trim()) errs.lastName = t("LastNameRequired");
    if (!form.email.trim()) {
      errs.email = t("EmailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = t("EmailInvalid");
    }
    if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) {
      errs.phone = t("PhoneInvalid");
    }
    if (form.dateOfBirth && new Date(form.dateOfBirth) > new Date()) {
      errs.dateOfBirth = t("DateOfBirthFuture");
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
      if (patient) {
        await updatePatient(patient.id, form);
        toast.success(t("Success"), t("PatientUpdated"));
      } else {
        await createPatient(form);
        toast.success(t("Success"), t("PatientCreated"));
      }
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
    <Modal isOpen={isOpen} onClose={onClose} title={patient ? t("EditPatient") : t("AddPatient")}>
      {serverError && <div className="bg-rose-50 text-rose-600 text-xs px-4 py-3 rounded-xl mb-4 border border-rose-100">{serverError}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input label={t("FirstName")} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            {errors.firstName && <p className="text-rose-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <Input label={t("LastName")} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            {errors.lastName && <p className="text-rose-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>
        <div>
          <Input label={t("Email")} type="text" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <Input label={t("Phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <Input label={t("Address")} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div>
          <Input label={t("DateOfBirth")} type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          {errors.dateOfBirth && <p className="text-rose-500 text-xs mt-1">{errors.dateOfBirth}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-md shadow-emerald-100">
            {loading ? t("Loading") : t("Save")}
          </button>
          <button type="button" onClick={onClose} className="flex-1 border border-gray-100 text-slate-500 py-2.5 rounded-xl text-sm hover:bg-gray-50">
            {t("Cancel")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PatientFormModal;