import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllDoctorsSchedule, getDoctorSchedule, createSchedule, deleteSchedule } from "../../api/scheduleApi";
import { getDoctors } from "../../api/doctorApi";
import { useToast } from "../../context/ToastContext";
import { useTranslation } from "react-i18next";

const DAY_NAMES = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];
const DAY_SHORT = ["B", "BE", "ÇA", "Ç", "CA", "C", "Ş"];

const BG = "linear-gradient(135deg, #e8faf3 0%, #d0f5e8 35%, #c5f0e0 65%, #daf7ee 100%)";

const glass = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.88)",
  boxShadow: "0 4px 24px rgba(5,150,105,0.1), inset 0 1px 0 rgba(255,255,255,0.95)",
};

const Orb = ({ color, size, top, left, right, bottom, opacity = 0.18 }) => (
  <div className="fixed rounded-full pointer-events-none"
    style={{ width: size, height: size, top, left, right, bottom, zIndex: -1,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: "blur(60px)", opacity }} />
);

const getMonday = (date) => {
  const d = new Date(date);
  const diff = (7 + d.getDay() - 1) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const emptyForm = { doctorId: "", selectedDays: [], startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 };

export default function SchedulePage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [doctorSchedules, setDoctorSchedules] = useState([]);

  useEffect(() => { fetchSchedule(); }, [weekStart]);
  useEffect(() => { fetchDoctors(); }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try { const res = await getAllDoctorsSchedule(weekStart.toISOString()); setScheduleData(res.data.data); }
    catch { } finally { setLoading(false); }
  };

  const fetchDoctors = async () => {
    try { const res = await getDoctors({ pageSize: 100 }); setDoctors(res.data.data.items); } catch { }
  };

  const fetchDoctorSchedules = async (doctorId) => {
    try { const res = await getDoctorSchedule(doctorId); setDoctorSchedules(res.data.data); } catch { }
  };

  const handleDoctorClick = (doctor) => { setSelectedDoctor(doctor); fetchDoctorSchedules(doctor.doctorId); };
  const toggleDay = (i) => setAddForm(prev => ({
    ...prev, selectedDays: prev.selectedDays.includes(i)
      ? prev.selectedDays.filter(d => d !== i)
      : [...prev.selectedDays, i]
  }));

  const handleAddSchedule = async () => {
    if (!addForm.doctorId) { toast.warning(t("Warning"), t("SelectDoctor")); return; }
    if (addForm.selectedDays.length === 0) { toast.warning(t("Warning"), t("SelectDays")); return; }
    if (addForm.startTime >= addForm.endTime) { toast.warning(t("Warning"), t("InvalidTimeRange")); return; }
    setSaving(true);
    try {
      await Promise.all(addForm.selectedDays.map(day => createSchedule({
        doctorId: addForm.doctorId, dayOfWeek: day,
        startTime: addForm.startTime, endTime: addForm.endTime,
        slotDurationMinutes: addForm.slotDurationMinutes
      })));
      toast.success(t("Success"), `${addForm.selectedDays.length} ${t("DaysAdded")}`);
      setShowAddModal(false); setAddForm(emptyForm); fetchSchedule();
      if (selectedDoctor) fetchDoctorSchedules(selectedDoctor.doctorId);
    } catch { toast.error(t("Error"), t("ScheduleAddFailed")); }
    finally { setSaving(false); }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await deleteSchedule(id);
      toast.success(t("Success"), t("ScheduleDeleted"));
      fetchSchedule();
      if (selectedDoctor) fetchDoctorSchedules(selectedDoctor.doctorId);
    } catch { toast.error(t("Error"), t("ScheduleDeleteFailed")); }
  };

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const goToday = () => setWeekStart(getMonday(new Date()));

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
  });
  const isToday = (date) => date.toDateString() === new Date().toDateString();

  return (
    <div className="relative min-h-screen pb-24 md:pb-6" style={{ background: BG }}>
      <Orb color="rgba(16,185,129,1)" size="480px" top="-80px" left="-80px" opacity={0.18} />
      <Orb color="rgba(5,150,105,1)" size="380px" bottom="-60px" right="-60px" opacity={0.13} />
      <Orb color="rgba(14,165,233,1)" size="260px" top="30%" left="50%" opacity={0.09} />

      <div className="relative z-10 p-4 md:p-6 space-y-5">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black leading-tight" style={{ color: "#064e3b" }}>
              {t("DoctorSchedule")} <span className="text-emerald-500">·</span>
            </h1>
            <p className="text-xs md:text-sm mt-0.5" style={{ color: "rgba(6,78,59,0.55)" }}>
              {scheduleData.length} {t("ActiveSchedules")}
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setAddForm(emptyForm); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg,#10b981,#0ea5e9)",
              boxShadow: "0 4px 18px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.2)"
            }}>
            <span className="text-base leading-none">+</span>
            <span className="hidden sm:inline">{t("AddSchedule")}</span>
          </motion.button>
        </motion.div>

        {/* Həftə naviqasiyası */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="flex items-center justify-between p-4 rounded-2xl" style={glass}>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={prevWeek}
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all"
            style={{ background: "rgba(5,150,105,0.1)", color: "#065f46", border: "1px solid rgba(5,150,105,0.2)" }}>
            ←
          </motion.button>

          <div className="flex items-center gap-3">
            <span className="text-xs md:text-sm font-bold" style={{ color: "#064e3b" }}>
              {weekStart.toLocaleDateString("az-AZ", { day: "2-digit", month: "short" })} —{" "}
              {weekDates[6].toLocaleDateString("az-AZ", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={goToday}
              className="px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "rgba(16,185,129,0.15)", color: "#065f46", border: "1px solid rgba(16,185,129,0.3)" }}>
              {t("ThisWeek")}
            </motion.button>
          </div>

          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={nextWeek}
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all"
            style={{ background: "rgba(5,150,105,0.1)", color: "#065f46", border: "1px solid rgba(5,150,105,0.2)" }}>
            →
          </motion.button>
        </motion.div>

        {/* Cədvəl */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="rounded-3xl overflow-hidden" style={glass}>
          <div className="overflow-x-auto">
            <div style={{ minWidth: "640px" }}>

              {/* Başlıq sətri */}
              <div className="grid grid-cols-8" style={{ borderBottom: "1.5px solid rgba(5,150,105,0.15)" }}>
                <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "rgba(6,95,70,0.55)" }}>{t("Doctor")}</div>
                {weekDates.map((date, i) => (
                  <div key={i} className="px-3 py-3 text-center"
                    style={{
                      borderLeft: "1px solid rgba(5,150,105,0.1)",
                      background: isToday(date) ? "rgba(16,185,129,0.08)" : "transparent"
                    }}>
                    <p className="text-xs font-bold"
                      style={{ color: isToday(date) ? "#059669" : "rgba(6,78,59,0.6)" }}>
                      {DAY_SHORT[date.getDay()]}
                    </p>
                    <p className="text-lg font-black mt-0.5"
                      style={{ color: isToday(date) ? "#059669" : "#064e3b" }}>
                      {date.getDate()}
                    </p>
                    {isToday(date) && (
                      <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5"
                        style={{ background: "#10b981" }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Məlumat sətirləri */}
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-8" style={{ borderBottom: "1px solid rgba(5,150,105,0.07)" }}>
                    <div className="px-4 py-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl animate-pulse" style={{ background: "rgba(5,150,105,0.12)" }} />
                      <div className="h-3 rounded-lg animate-pulse w-20" style={{ background: "rgba(5,150,105,0.1)" }} />
                    </div>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <div key={j} className="px-3 py-4" style={{ borderLeft: "1px solid rgba(5,150,105,0.07)" }}>
                        <div className="h-6 rounded-lg animate-pulse" style={{ background: "rgba(5,150,105,0.06)" }} />
                      </div>
                    ))}
                  </div>
                ))
              ) : scheduleData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.15)" }}>📅</div>
                  <p className="text-sm font-bold" style={{ color: "rgba(6,78,59,0.5)" }}>{t("NoSchedules")}</p>
                </div>
              ) : scheduleData.map((doctor, di) => (
                <motion.div key={doctor.doctorId}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: di * 0.04 }}
                  className="grid grid-cols-8 cursor-pointer transition-all"
                  style={{ borderBottom: "1px solid rgba(5,150,105,0.07)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(5,150,105,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => handleDoctorClick(doctor)}>

                  <div className="px-4 py-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-black shrink-0"
                      style={{ boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}>
                      {doctor.doctorName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: "#065f46" }}>{doctor.doctorName}</p>
                      <p className="text-xs truncate hidden md:block" style={{ color: "rgba(6,78,59,0.5)" }}>{doctor.department}</p>
                    </div>
                  </div>

                  {doctor.weekDays.map((day, di2) => (
                    <div key={di2} className="px-2 py-3 flex items-center justify-center"
                      style={{
                        borderLeft: "1px solid rgba(5,150,105,0.07)",
                        background: isToday(weekDates[di2]) ? "rgba(16,185,129,0.04)" : "transparent"
                      }}>
                      {day.isWorkingDay ? (
                        <div className="text-center">
                          <div className="text-xs font-bold px-1.5 py-1 rounded-lg whitespace-nowrap"
                            style={{
                              background: "rgba(16,185,129,0.12)",
                              color: "#059669",
                              border: "1px solid rgba(16,185,129,0.25)"
                            }}>
                            {day.startTime}–{day.endTime}
                          </div>
                          <div className="text-xs mt-1" style={{ color: "rgba(6,78,59,0.45)" }}>
                            {day.slots.filter(s => !s.isBooked).length} ✓
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: "rgba(6,78,59,0.2)" }}>—</span>
                      )}
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Doctor Detail Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setSelectedDoctor(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col z-10 rounded-3xl"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.95)",
                boxShadow: "0 24px 80px rgba(5,150,105,0.2)"
              }}>

              <div className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: "1px solid rgba(5,150,105,0.12)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-lg"
                    style={{ boxShadow: "0 4px 16px rgba(16,185,129,0.35)" }}>
                    {selectedDoctor.doctorName?.[0]}
                  </div>
                  <div>
                    <h2 className="font-black text-sm" style={{ color: "#064e3b" }}>{selectedDoctor.doctorName}</h2>
                    <p className="text-xs" style={{ color: "rgba(6,78,59,0.55)" }}>
                      {selectedDoctor.department} · {selectedDoctor.specialization}
                    </p>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDoctor(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: "rgba(5,150,105,0.1)", color: "#065f46" }}>✕</motion.button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(6,78,59,0.45)" }}>
                  {t("WorkingDays")}
                </p>
                {doctorSchedules.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: "rgba(6,78,59,0.4)" }}>{t("NoSchedules")}</p>
                ) : doctorSchedules.map((s) => (
                  <motion.div key={s.id} whileHover={{ x: 4 }}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl transition-all"
                    style={{
                      background: s.isActive ? "rgba(16,185,129,0.08)" : "rgba(5,150,105,0.04)",
                      border: `1px solid ${s.isActive ? "rgba(16,185,129,0.2)" : "rgba(5,150,105,0.1)"}`
                    }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black"
                        style={{
                          background: s.isActive ? "rgba(16,185,129,0.2)" : "rgba(5,150,105,0.08)",
                          color: s.isActive ? "#059669" : "rgba(6,78,59,0.4)"
                        }}>
                        {DAY_SHORT[s.dayOfWeek]}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#065f46" }}>{s.dayName}</p>
                        <p className="text-xs" style={{ color: "rgba(6,78,59,0.5)" }}>
                          {s.startTime} – {s.endTime} · {s.slotDurationMinutes} {t("MinPerSlot")}
                        </p>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(s.id); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                      style={{ background: "rgba(251,113,133,0.12)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.25)" }}>
                      ✕
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md p-6 z-10 rounded-3xl max-h-[90vh] overflow-y-auto"
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.95)",
                boxShadow: "0 24px 80px rgba(5,150,105,0.2)"
              }}>

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-black" style={{ color: "#064e3b" }}>{t("AddSchedule")}</h2>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: "rgba(5,150,105,0.1)", color: "#065f46" }}>✕</motion.button>
              </div>

              <div className="space-y-4">
                {/* Doctor */}
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "rgba(6,78,59,0.6)" }}>{t("Doctor")}</label>
                  <select value={addForm.doctorId} onChange={(e) => setAddForm({ ...addForm, doctorId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.2)", color: "#065f46" }}>
                    <option value="">{t("SelectDoctor")}</option>
                    {doctors.map((d) => <option key={d.id} value={d.id}>{d.fullName} — {d.departmentName}</option>)}
                  </select>
                </div>

                {/* Günlər */}
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "rgba(6,78,59,0.6)" }}>{t("WorkingDays")}</label>
                  <div className="grid grid-cols-7 gap-1.5 mb-3">
                    {DAY_NAMES.map((name, i) => (
                      <motion.button key={i} type="button" onClick={() => toggleDay(i)} title={name}
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                        className="py-2 rounded-xl text-xs font-black border transition-all"
                        style={addForm.selectedDays.includes(i) ? {
                          background: "linear-gradient(135deg,#10b981,#0ea5e9)",
                          color: "white",
                          border: "1px solid transparent",
                          boxShadow: "0 4px 12px rgba(16,185,129,0.35)"
                        } : {
                          background: "rgba(5,150,105,0.06)",
                          color: "rgba(6,78,59,0.6)",
                          border: "1px solid rgba(5,150,105,0.15)"
                        }}>
                        {DAY_SHORT[i]}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {[
                      { label: t("Weekdays"), days: [1, 2, 3, 4, 5] },
                      { label: t("AllDays"), days: [0, 1, 2, 3, 4, 5, 6] },
                    ].map((item) => (
                      <button key={item.label} type="button"
                        onClick={() => setAddForm(prev => ({ ...prev, selectedDays: item.days }))}
                        className="text-xs font-semibold underline underline-offset-2"
                        style={{ color: "#059669" }}>{item.label}</button>
                    ))}
                    <span style={{ color: "rgba(5,150,105,0.3)" }}>|</span>
                    <button type="button" onClick={() => setAddForm(prev => ({ ...prev, selectedDays: [] }))}
                      className="text-xs font-semibold underline underline-offset-2 text-rose-400">{t("Clear")}</button>
                    {addForm.selectedDays.length > 0 && (
                      <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}>
                        {addForm.selectedDays.length} {t("DaysSelected")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Saat */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t("StartTime"), key: "startTime" },
                    { label: t("EndTime"), key: "endTime" },
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: "rgba(6,78,59,0.6)" }}>{item.label}</label>
                      <input type="time" value={addForm[item.key]}
                        onChange={(e) => setAddForm({ ...addForm, [item.key]: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.2)", color: "#065f46" }} />
                    </div>
                  ))}
                </div>

                {/* Slot müddəti */}
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "rgba(6,78,59,0.6)" }}>
                    {t("SlotDuration")} ({t("Minutes")})
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[15, 20, 30, 45, 60].map(min => (
                      <motion.button key={min} type="button" onClick={() => setAddForm({ ...addForm, slotDurationMinutes: min })}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="py-2 rounded-xl text-xs font-bold border transition-all"
                        style={addForm.slotDurationMinutes === min ? {
                          background: "linear-gradient(135deg,#10b981,#0ea5e9)",
                          color: "white",
                          border: "1px solid transparent",
                          boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
                        } : {
                          background: "rgba(5,150,105,0.06)",
                          color: "rgba(6,78,59,0.6)",
                          border: "1px solid rgba(5,150,105,0.15)"
                        }}>
                        {min}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "rgba(5,150,105,0.07)", color: "rgba(6,78,59,0.7)", border: "1px solid rgba(5,150,105,0.15)" }}>
                  {t("Cancel")}
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleAddSchedule} disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg,#10b981,#0ea5e9)",
                    boxShadow: "0 4px 18px rgba(16,185,129,0.35)"
                  }}>
                  {saving ? t("Adding") : `${t("Add")}${addForm.selectedDays.length > 0 ? ` (${addForm.selectedDays.length})` : ""}`}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}