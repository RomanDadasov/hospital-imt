import { useState, useEffect, useRef } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { createDepartment, updateDepartment, uploadDepartmentImage } from "../../api/departmentApi";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";

const DepartmentFormModal = ({ isOpen, onClose, department, onSuccess }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (department) {
      setForm({ name: department.name, description: department.description || "" });
      setImagePreview(department.imageUrl || null);
    } else {
      setForm({ name: "", description: "" });
      setImagePreview(null);
    }
    setImageFile(null);
    setErrors({});
    setServerError("");
  }, [department, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = t("DepartmentNameRequired");
    if (form.description && form.description.length > 500) errs.description = t("DescriptionMaxLength");
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
      let savedDept;
      if (department) {
        const res = await updateDepartment(department.id, form);
        savedDept = res.data.data;
        toast.success(t("Success"), t("DepartmentUpdated"));
      } else {
        const res = await createDepartment(form);
        savedDept = res.data.data;
        toast.success(t("Success"), t("DepartmentCreated"));
      }
      if (imageFile && savedDept?.id) {
        await uploadDepartmentImage(savedDept.id, imageFile);
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
    <Modal isOpen={isOpen} onClose={onClose} title={department ? t("EditDepartment") : t("AddDepartment")}>
      {serverError && <div className="bg-rose-50 text-rose-600 text-xs px-4 py-3 rounded-xl mb-4 border border-rose-100">{serverError}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input label={t("DepartmentName")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t("Description")}</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 resize-none ${errors.description ? "border-rose-400" : "border-gray-100"}`} />
          {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t("Image")}</label>
          <div className="flex items-center gap-3">
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="w-20 h-20 rounded-xl object-cover border border-gray-100 shadow-sm" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl">🏥</div>
            )}
            <div className="flex-1">
              <button type="button" onClick={() => fileRef.current.click()}
                className="w-full py-2 border border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-semibold transition-all">
                {imagePreview ? t("ChangeImage") : t("SelectImage")}
              </button>
              {imageFile && <p className="text-xs text-slate-400 mt-1 truncate">{imageFile.name}</p>}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
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

export default DepartmentFormModal;