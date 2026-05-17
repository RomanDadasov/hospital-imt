import { NavLink } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useTokenStore from "../../stores/tokenStore";
import medicalSnake from "../../assets/img/medical-logo.jpg";
import { useTranslation } from "react-i18next";
import { optimizeImage } from "../../utils/cloudinary";

const menus = {
  Admin: [
    { path: "/dashboard", labelKey: "Dashboard", icon: "/src/assets/icons/grid-svgrepo-com (1).svg" },
    { path: "/doctors", labelKey: "Doctors", icon: "/src/assets/icons/doctor-svgrepo-com.svg" },
    { path: "/patients", labelKey: "Patients", icon: "/src/assets/icons/users-svgrepo-com.svg" },
    { path: "/staff", labelKey: "Staff", icon: "/src/assets/icons/team-svgrepo-com.svg" },
    { path: "/appointments", labelKey: "Appointments", icon: "/src/assets/icons/calendar-days-svgrepo-com.svg" },
    { path: "/appointment-requests", labelKey: "AppointmentRequests", icon: "/src/assets/icons/calendar-svgrepo-com.svg" },
    { path: "/departments", labelKey: "Departments", icon: "/src/assets/icons/building-svgrepo-com.svg" },
    { path: "/analytics", labelKey: "Analytics", icon: "/src/assets/icons/profits-analytics-svgrepo-com.svg" },
    { path: "/queue-management", labelKey: "Queue", icon: "/src/assets/icons/queue-thin-svgrepo-com.svg" },
    { path: "/chat", labelKey: "Chat", icon: "/src/assets/icons/chat-round-dots-svgrepo-com.svg" },
    { path: "/audit", labelKey: "Audit", icon: "/src/assets/icons/audit-report-svgrepo-com.svg" },
    { path: "/schedule", labelKey: "Schedule", icon: "/src/assets/icons/schedule-svgrepo-com.svg" },
  ],
  Receptionist: [
    { path: "/dashboard", labelKey: "Dashboard", icon: "/src/assets/icons/grid-svgrepo-com (1).svg" },
    { path: "/patients", labelKey: "Patients", icon: "/src/assets/icons/users-svgrepo-com.svg" },
    { path: "/appointments", labelKey: "Appointments", icon: "/src/assets/icons/calendar-days-svgrepo-com.svg" },
    { path: "/appointment-requests", labelKey: "AppointmentRequests", icon: "/src/assets/icons/calendar-svgrepo-com.svg" },
    { path: "/analytics", labelKey: "Analytics", icon: "/src/assets/icons/profits-analytics-svgrepo-com.svg" },
    { path: "/queue-management", labelKey: "Queue", icon: "/src/assets/icons/queue-thin-svgrepo-com.svg" },
    { path: "/chat", labelKey: "Chat", icon: "/src/assets/icons/chat-round-dots-svgrepo-com.svg" },
    { path: "/schedule", labelKey: "Schedule", icon: "/src/assets/icons/schedule-svgrepo-com.svg" },
  ],
  Doctor: [
    { path: "/dashboard", labelKey: "Dashboard", icon: "/src/assets/icons/grid-svgrepo-com (1).svg" },
    { path: "/my-appointments", labelKey: "MyAppointments", icon: "/src/assets/icons/calendar-check-svgrepo-com.svg" },
    { path: "/doctor-panel", labelKey: "DoctorPanel", icon: "/src/assets/icons/doctor-svgrepo-com.svg" },
    { path: "/profile", labelKey: "Profile", icon: "/src/assets/icons/person-button-svgrepo-com.svg" },
    { path: "/chat", labelKey: "Chat", icon: "/src/assets/icons/chat-round-dots-svgrepo-com.svg" },
  ],
  Pharmacist: [
    { path: "/dashboard", labelKey: "Dashboard", icon: "/src/assets/icons/grid-svgrepo-com (1).svg" },
    { path: "/pharmacy", labelKey: "Pharmacy", icon: "/src/assets/icons/doctor-svgrepo-com.svg" },
    { path: "/profile", labelKey: "Profile", icon: "/src/assets/icons/person-button-svgrepo-com.svg" },
  ],
};

const Navigator = () => {
  const { role, user } = useTokenStore();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = menus[role] || [];

  const profileImageUrl = user?.profileImageUrl
    ? optimizeImage(
        user.profileImageUrl.startsWith("http")
          ? user.profileImageUrl
          : `http://localhost:5171${user.profileImageUrl}`,
        80, 80
      )
    : null;

  
  const bottomItems = items.slice(0, 4);

  return (
    <>
     
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 border-r border-emerald-800/40 overflow-hidden shrink-0"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#065f46 transparent" }}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-800/40 shrink-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-400/30 shadow-lg shrink-0">
                  <img src={medicalSnake} alt="logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-emerald-50 font-bold text-sm leading-tight">MedCare</p>
                  <p className="text-emerald-400/60 text-xs">Hospital Management</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-400/30 shadow-lg mx-auto shrink-0">
              <img src={medicalSnake} alt="logo" className="w-full h-full object-cover" />
            </div>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-400/60 hover:text-emerald-100 hover:bg-emerald-800/40 transition-all shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#065f46 transparent" }}>
          {items.map((item) => (
            <NavLink key={item.path} to={item.path}>
              {({ isActive }) => (
                <motion.div whileHover={{ x: collapsed ? 0 : 4 }} transition={{ duration: 0.15 }}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer
                    ${isActive ? "text-emerald-100" : "text-emerald-400/70 hover:text-emerald-100"}
                    ${collapsed ? "justify-center" : ""}`}>
                  {isActive && <div className="absolute inset-0 rounded-xl bg-emerald-500/20 border border-emerald-500/30" style={{ boxShadow: "0 0 12px rgba(16,185,129,0.15)" }} />}
                  {isActive && !collapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-full" />}
                  {isActive && collapsed && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />}
                  <div className={`relative z-10 w-5 h-5 flex items-center justify-center shrink-0 ${collapsed ? "mx-auto" : ""}`}>
                    <img src={item.icon} alt={t(item.labelKey)} className="w-full h-full object-contain"
                      style={{ filter: isActive ? "brightness(0) invert(1)" : "brightness(0) saturate(100%) invert(69%) sepia(21%) saturate(628%) hue-rotate(100deg) brightness(97%) contrast(88%)" }} />
                  </div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
                        className="relative z-10 whitespace-nowrap overflow-hidden capitalize">
                        {t(item.labelKey)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 py-3 border-t border-emerald-800/40 shrink-0">
          <button onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-emerald-400/50 hover:text-emerald-100 hover:bg-emerald-800/40 transition-all ${collapsed ? "justify-center" : ""}`}>
            <motion.svg animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" />
            </motion.svg>
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
                  className="text-xs font-medium whitespace-nowrap overflow-hidden">
                  {t("collapse")}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        <div className={`px-2 pb-4 shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
          <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-800/30 transition-all cursor-pointer ${collapsed ? "justify-center" : ""}`}>
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="profile" loading="lazy" className="w-8 h-8 rounded-xl object-cover shadow-lg shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shrink-0">
                {user?.firstName?.[0] || "U"}
              </div>
            )}
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <p className="text-emerald-100 text-xs font-semibold leading-tight whitespace-nowrap">{user?.firstName} {user?.lastName}</p>
                  <p className="text-emerald-500/60 text-xs whitespace-nowrap">{role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

     
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-emerald-950 border-t border-emerald-800/40 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {bottomItems.map((item) => (
            <NavLink key={item.path} to={item.path}>
              {({ isActive }) => (
                <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all">
                  <div className={`w-6 h-6 flex items-center justify-center ${isActive ? "opacity-100" : "opacity-50"}`}>
                    <img src={item.icon} alt={t(item.labelKey)} className="w-full h-full object-contain"
                      style={{ filter: "brightness(0) invert(1)" }} />
                  </div>
                  <span className={`text-xs font-medium transition-colors ${isActive ? "text-emerald-400" : "text-emerald-600/50"}`}>
                    {t(item.labelKey)}
                  </span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
                </div>
              )}
            </NavLink>
          ))}
          
          <button onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl">
            <div className="w-6 h-6 flex items-center justify-center opacity-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xs font-medium text-emerald-600/50">Menu</span>
          </button>
        </div>
      </div>

      
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-emerald-950 rounded-t-3xl border-t border-emerald-800/40 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-800/40">
                <div className="flex items-center gap-3">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="profile" className="w-9 h-9 rounded-xl object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                      {user?.firstName?.[0] || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-emerald-100 text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                    <p className="text-emerald-500/60 text-xs">{role}</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-xl bg-emerald-800/40 flex items-center justify-center text-emerald-400">
                  ✕
                </button>
              </div>
              <div className="p-3 space-y-1">
                {items.map((item) => (
                  <NavLink key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                    {({ isActive }) => (
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-emerald-500/20 text-emerald-100" : "text-emerald-400/70"}`}>
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <img src={item.icon} alt={t(item.labelKey)} className="w-full h-full object-contain"
                            style={{ filter: isActive ? "brightness(0) invert(1)" : "brightness(0) saturate(100%) invert(69%) sepia(21%) saturate(628%) hue-rotate(100deg) brightness(97%) contrast(88%)" }} />
                        </div>
                        <span className="text-sm font-medium capitalize">{t(item.labelKey)}</span>
                        {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigator;