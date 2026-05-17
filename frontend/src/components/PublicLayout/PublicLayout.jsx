import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import medicalSnake from "../../assets/img/medical-logo.jpg";
import { useTranslation } from "react-i18next";

const navLinks = [
  { to: "/about", labelKey: "About" },
  { to: "/our-doctors", labelKey: "Doctors" },
  { to: "/our-departments", labelKey: "Departments" },
  { to: "/symptom-checker", labelKey: "SymptomChecker" },
  { to: "/education", labelKey: "Education" },
  { to: "/pharmacy-info", labelKey: "Pharmacy" }

];

export default function PublicLayout() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col">
  
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm"
            : "bg-white border-b border-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200/50 group-hover:shadow-emerald-300/50 transition-all overflow-hidden">
              <img
                src={medicalSnake}
                alt="MHC logo"
                className="w-10 h-10 object-contain rounded-xl"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-lg leading-none tracking-tight">MHC</span>
              <span className="text-xs text-emerald-600 font-medium leading-none mt-0.5">Smart Healthcare</span>
            </div>
          </Link>

     
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-4 py-2 text-sm font-medium transition-colors group"
                >
                  <span
                    className={`relative z-10 transition-colors ${isActive
                        ? "text-emerald-700"
                        : "text-slate-600 group-hover:text-slate-900"
                      }`}
                  >
                    {t(link.labelKey)}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"
                      transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-slate-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              );
            })}
          </nav>

         
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-200/50 hover:shadow-lg transition-all"
              >
                {t("Login")}
              </motion.button>
            </Link>

        
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <motion.div animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                {menuOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
                  </svg>
                )}
              </motion.div>
            </button>
          </div>
        </div>

      
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
            >
              <div className="px-6 py-4 space-y-1">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.to;
                  return (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        )}
                        <span className={!isActive ? "ml-4" : ""}>
                          {t(link.labelKey)}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}

              
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block mt-4 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl text-center hover:from-emerald-700 hover:to-teal-700 transition-all"
                >
                  {t("Login")}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

    
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-300 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden shadow-lg shadow-emerald-900/30">
                <img
                  src={medicalSnake}
                  alt="MHC logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl tracking-tight">MHC</h3>
                <p className="text-emerald-400 text-xs font-medium">Smart Healthcare</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t("We protect your health with modern medical services, professional doctors, and an intelligent management system.")}
            </p>
          </div>

       
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-emerald-400 transition-colors" />
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

     
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
              {t("contact")}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className="text-slate-400">Bakı, Azərbaycan</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <a href="tel:+994120000000" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  +994 12 000 00 00
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <a href="mailto:info@mhc.az" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  info@mhc.az
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span className="text-slate-400">24/7 {t("service")}</span>
              </li>
            </ul>
          </div>
        </div>

       
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 order-2 sm:order-1">
              © {new Date().getFullYear()} MHC. {t("footerTagline")}
            </p>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-slate-500 font-medium">
                {t("systemActive")}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}