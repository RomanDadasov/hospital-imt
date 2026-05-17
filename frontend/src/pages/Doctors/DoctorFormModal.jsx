import { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { createDoctor, updateDoctor } from "../../api/doctorApi";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";

const DoctorFormModal = ({ isOpen, onClose, doctor, departments, onSuccess }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    specialization: "", phone: "", departmentId: "", consultationFee: ""
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctor) {
      setForm({
        firstName: doctor.fullName?.split(" ")[0] || "",
        lastName: doctor.fullName?.split(" ")[1] || "",
        email: doctor.email || "",
        password: "",
        specialization: doctor.specialization || "",
        phone: doctor.phone || "",
        departmentId: doctor.departmentId || "",
        consultationFee: doctor.consultationFee || "",
      });
    } else {
      setForm({ firstName: "", lastName: "", email: "", password: "", specialization: "", phone: "", departmentId: "", consultationFee: "" });
    }
    setErrors({});
    setServerError("");
  }, [doctor, isOpen]);

  const validate = () => {
    const errs = {};
    if (!doctor) {
      if (!form.firstName.trim()) errs.firstName = t("FirstNameRequired");
      if (!form.lastName.trim()) errs.lastName = t("LastNameRequired");
      if (!form.email.trim()) {
        errs.email = t("EmailRequired");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errs.email = t("EmailInvalid");
      }
      if (!form.password) {
        errs.password = t("PasswordRequired");
      } else if (form.password.length < 6) {
        errs.password = t("PasswordMinLength");
      }
    }
    if (!form.specialization.trim()) errs.specialization = t("SpecializationRequired");
    if (!form.departmentId) errs.departmentId = t("DepartmentRequired");
    if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) {
      errs.phone = t("PhoneInvalid");
    }
    if (form.consultationFee && parseFloat(form.consultationFee) < 0) {
      errs.consultationFee = t("FeeNegative");
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
      if (doctor) {
        await updateDoctor(doctor.id, {
          specialization: form.specialization,
          phone: form.phone,
          departmentId: form.departmentId,
          consultationFee: parseFloat(form.consultationFee) || 0,
        });
        toast.success(t("Success"), t("DoctorUpdated"));
      } else {
        await createDoctor({ ...form, consultationFee: parseFloat(form.consultationFee) || 0 });
        toast.success(t("Success"), t("DoctorCreated"));
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={doctor ? t("EditDoctor") : t("AddDoctor")}>
      {serverError && <div className="bg-rose-50 text-rose-600 text-xs px-4 py-3 rounded-xl mb-4 border border-rose-100">{serverError}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!doctor && (
          <>
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
              <Input label={t("Password")} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </>
        )}

        <div>
          <Input label={t("Specialization")} value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          {errors.specialization && <p className="text-rose-500 text-xs mt-1">{errors.specialization}</p>}
        </div>

        <div>
          <Input label={t("Phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t("ConsultationFee")}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₼</span>
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={form.consultationFee}
              onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
              className={`w-full pl-8 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 ${errors.consultationFee ? "border-rose-400" : "border-gray-100"}`}
            />
          </div>
          {errors.consultationFee && <p className="text-rose-500 text-xs mt-1">{errors.consultationFee}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t("Department")}</label>
          <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 ${errors.departmentId ? "border-rose-400" : "border-gray-100"}`}>
            <option value="">{t("SelectDepartment")}</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          {errors.departmentId && <p className="text-rose-500 text-xs mt-1">{errors.departmentId}</p>}
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

export default DoctorFormModal;