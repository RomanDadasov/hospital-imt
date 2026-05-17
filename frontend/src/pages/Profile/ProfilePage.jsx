import { useState, useEffect } from "react";
import { getProfile, updateProfile, changePassword, uploadProfileImage } from "../../api/userApi";
import useTokenStore from "../../stores/tokenStore";
import Input from "../../components/common/Input";
import { useTranslation } from "react-i18next";

const BASE_URL = "http://localhost:5171";

const resolveUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const { setUser } = useTokenStore();
  const [form, setForm] = useState({ firstName: "", lastName: "" });
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [imageUrl, setImageUrl] = useState(null);
  const [profileMsg, setProfileMsg] = useState({ text: "", success: true });
  const [passMsg, setPassMsg] = useState({ text: "", success: true });
  const [profileErrors, setProfileErrors] = useState({});
  const [passErrors, setPassErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then((res) => {
      const data = res.data.data;
      setForm({ firstName: data.firstName, lastName: data.lastName });
      if (data.profileImageUrl) setImageUrl(resolveUrl(data.profileImageUrl));
      setUser(data);
    });
  }, []);

  const validateProfile = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = t("FirstNameRequired");
    if (!form.lastName.trim()) errs.lastName = t("LastNameRequired");
    return errs;
  };

  const validatePass = () => {
    const errs = {};
    if (!passForm.currentPassword) errs.currentPassword = t("CurrentPasswordRequired");
    if (!passForm.newPassword) {
      errs.newPassword = t("NewPasswordRequired");
    } else if (passForm.newPassword.length < 6) {
      errs.newPassword = t("PasswordMinLength");
    }
    if (!passForm.confirmNewPassword) {
      errs.confirmNewPassword = t("ConfirmPasswordRequired");
    } else if (passForm.newPassword !== passForm.confirmNewPassword) {
      errs.confirmNewPassword = t("PasswordsNotMatch");
    }
    return errs;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) { setProfileErrors(errs); return; }
    setProfileErrors({});
    setLoading(true);
    try {
      await updateProfile(form);
      const profileRes = await getProfile();
      setUser(profileRes.data.data);
      setProfileMsg({ text: "✅ " + t("ProfileUpdated"), success: true });
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.errors
        ? Object.values(data.errors).flat().join(" ")
        : data?.message || t("ErrorOccurred");
      setProfileMsg({ text: "❌ " + msg, success: false });
    } finally {
      setLoading(false);
      setTimeout(() => setProfileMsg({ text: "", success: true }), 4000);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePass();
    if (Object.keys(errs).length > 0) { setPassErrors(errs); return; }
    setPassErrors({});
    setLoading(true);
    try {
      await changePassword(passForm);
      setPassMsg({ text: "✅ " + t("PasswordChanged"), success: true });
      setPassForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.errors
        ? Object.values(data.errors).flat().join(" ")
        : data?.message || t("ErrorOccurred");
      setPassMsg({ text: "❌ " + msg, success: false });
    } finally {
      setLoading(false);
      setTimeout(() => setPassMsg({ text: "", success: true }), 4000);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await uploadProfileImage(formData);
      const profileRes = await getProfile();
      const freshUser = profileRes.data.data;
      setUser(freshUser);
      setImageUrl(resolveUrl(freshUser.profileImageUrl));
    } catch {
      alert(t("ImageUploadFailed"));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      {/* Profile */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            {imageUrl ? (
              <img src={imageUrl} alt="Profile" className="w-20 h-20 rounded-2xl object-cover shadow-inner hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg hover:scale-105 transition-transform duration-300">
                {form.firstName?.[0]}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-emerald-600 transition-colors shadow-md">
              <span className="text-white text-sm font-bold">+</span>
              <input type="file" accept=".jpg,.jpeg,.png" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{form.firstName} {form.lastName}</h2>
            <p className="text-sm text-slate-400">{t("EditProfile")}</p>
          </div>
        </div>

        {profileMsg.text && (
          <div className={`text-sm mb-4 px-4 py-2.5 rounded-xl border shadow-sm ${profileMsg.success ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-600 bg-rose-50 border-rose-100"}`}>
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input label={t("FirstName")} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              {profileErrors.firstName && <p className="text-rose-500 text-xs mt-1">{profileErrors.firstName}</p>}
            </div>
            <div>
              <Input label={t("LastName")} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              {profileErrors.lastName && <p className="text-rose-500 text-xs mt-1">{profileErrors.lastName}</p>}
            </div>
          </div>
          <button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold disabled:opacity-50 shadow-md hover:scale-105 transition-all duration-300">
            {loading ? t("Loading") : t("SaveChanges")}
          </button>
        </form>
      </div>

      
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
        <h3 className="font-bold text-lg text-slate-800 mb-4">{t("ChangePassword")}</h3>

        {passMsg.text && (
          <div className={`text-sm mb-4 px-4 py-2.5 rounded-xl border shadow-sm ${passMsg.success ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-600 bg-rose-50 border-rose-100"}`}>
            {passMsg.text}
          </div>
        )}

        <form onSubmit={handlePassSubmit} className="space-y-4">
          <div>
            <Input label={t("CurrentPassword")} type="password" value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} />
            {passErrors.currentPassword && <p className="text-rose-500 text-xs mt-1">{passErrors.currentPassword}</p>}
          </div>
          <div>
            <Input label={t("NewPassword")} type="password" value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} />
            {passErrors.newPassword && <p className="text-rose-500 text-xs mt-1">{passErrors.newPassword}</p>}
          </div>
          <div>
            <Input label={t("ConfirmPassword")} type="password" value={passForm.confirmNewPassword} onChange={(e) => setPassForm({ ...passForm, confirmNewPassword: e.target.value })} />
            {passErrors.confirmNewPassword && <p className="text-rose-500 text-xs mt-1">{passErrors.confirmNewPassword}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setPassForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" }); setPassErrors({}); }}
              className="px-6 py-2.5 border border-gray-200 text-slate-500 rounded-2xl text-sm hover:bg-gray-50 transition-colors">
              {t("Cancel")}
            </button>
            <button type="submit" disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-50 shadow-md hover:scale-105 transition-all duration-300">
              {loading ? t("Loading") : t("SaveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;