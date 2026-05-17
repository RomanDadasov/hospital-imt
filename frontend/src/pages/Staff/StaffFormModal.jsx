import { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { createStaff } from "../../api/staffApi";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";

const StaffFormModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "Receptionist" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setErrors({});
    setServerError("");
    setShowPassword(false);
    setForm({ firstName: "", lastName: "", email: "", password: "", role: "Receptionist" });
  }, [isOpen]);

  const validate = () => {
    const errs = {};
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
      await createStaff(form);
      toast.success(t("Success"), t("StaffCreated"));
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
    <Modal isOpen={isOpen} onClose={onClose} title={t("AddStaff")}>
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
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            {t("Password")}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              placeholder="••••••"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 focus:bg-white transition-all pr-10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" tabIndex={-1}>
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t("Role")}</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400">
            <option value="Receptionist">Receptionist</option>
            <option value="Admin">Admin</option>
            <option value="Pharmacist">Pharmacist</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-md shadow-emerald-100">
            {loading ? t("Loading") : t("Save")}
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 border border-gray-100 text-slate-500 py-2.5 rounded-xl text-sm hover:bg-gray-50">
            {t("Cancel")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffFormModal;