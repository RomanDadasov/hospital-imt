import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useTokenStore from "../../stores/tokenStore";
import { useDarkMode } from "../../stores/darkMode";
import { revoke } from "../../api/authApi";
import { useTranslation } from "react-i18next";
import NotificationBell from "../Layout/NotificationBell";
import { globalSearch } from "../../api/searchApi";

const languages = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "az", label: "AZ", flag: "🇦🇿" },
  { code: "ru", label: "RU", flag: "🇷🇺" },
];

const Header = ({ title }) => {
  const { user, clearTokens, refreshToken } = useTokenStore();
  const { isDarkmodeActive, toggleDarkmode } = useDarkMode();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { t, i18n } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const searchTimer = useRef(null);

  const handleLogout = async () => {
    try { await revoke({ refreshToken }); } catch { }
    clearTokens();
    navigate("/login");
  };

  const handleLangChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
    setShowLang(false);
  };

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults(null);
      setShowResults(false);
      return;
    }
    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await globalSearch(searchQuery);
        setSearchResults(res.data.data);
        setShowResults(true);
      } catch {
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleResultClick = (type) => {
    setShowResults(false);
    setSearchQuery("");
    setShowMobileSearch(false);
    if (type === "patient") navigate("/patients");
    else if (type === "doctor") navigate("/doctors");
    else if (type === "appointment") navigate("/appointments");
    else if (type === "staff") navigate("/staff");
  };

  const totalResults = searchResults
    ? (searchResults.patients?.length || 0) +
      (searchResults.doctors?.length || 0) +
      (searchResults.appointments?.length || 0) +
      (searchResults.staff?.length || 0)
    : 0;

  const SearchDropdown = () => (
    showResults && searchResults ? (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)} />
        <div className="absolute left-0 top-12 z-50 bg-emerald-950 border border-emerald-800/50 rounded-2xl shadow-2xl w-80 max-h-96 overflow-y-auto">
          {totalResults === 0 ? (
            <div className="px-4 py-6 text-center text-emerald-500/60 text-xs">{t("noResults")}</div>
          ) : (
            <div className="p-2">
              {searchResults.patients?.length > 0 && (
                <div className="mb-2">
                  <p className="text-emerald-500/60 text-xs px-3 py-1.5 uppercase tracking-wider">{t("patients")}</p>
                  {searchResults.patients.map((p) => (
                    <button key={p.id} onClick={() => handleResultClick("patient")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-900/60 transition-all text-left">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 text-xs font-bold shrink-0">{p.name?.[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-emerald-100 text-xs font-semibold truncate">{p.name}</p>
                        <p className="text-emerald-500/60 text-xs truncate">{p.email}</p>
                      </div>
                      <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-lg shrink-0">{t("patient")}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.doctors?.length > 0 && (
                <div className="mb-2">
                  <p className="text-emerald-500/60 text-xs px-3 py-1.5 uppercase tracking-wider">{t("doctors")}</p>
                  {searchResults.doctors.map((d) => (
                    <button key={d.id} onClick={() => handleResultClick("doctor")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-900/60 transition-all text-left">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">{d.name?.[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-emerald-100 text-xs font-semibold truncate">{d.name}</p>
                        <p className="text-emerald-500/60 text-xs truncate">{d.specialization}</p>
                      </div>
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg shrink-0">{t("doctor")}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.appointments?.length > 0 && (
                <div className="mb-2">
                  <p className="text-emerald-500/60 text-xs px-3 py-1.5 uppercase tracking-wider">{t("appointments")}</p>
                  {searchResults.appointments.map((a) => (
                    <button key={a.id} onClick={() => handleResultClick("appointment")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-900/60 transition-all text-left">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">📅</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-emerald-100 text-xs font-semibold truncate">{a.patientName}</p>
                        <p className="text-emerald-500/60 text-xs truncate">{a.doctorName}</p>
                      </div>
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-lg shrink-0">{t("appointment")}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.staff?.length > 0 && (
                <div>
                  <p className="text-emerald-500/60 text-xs px-3 py-1.5 uppercase tracking-wider">{t("staff")}</p>
                  {searchResults.staff.map((s) => (
                    <button key={s.id} onClick={() => handleResultClick("staff")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-900/60 transition-all text-left">
                      <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold shrink-0">{s.name?.[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-emerald-100 text-xs font-semibold truncate">{s.name}</p>
                        <p className="text-emerald-500/60 text-xs truncate">{s.email}</p>
                      </div>
                      <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-lg shrink-0">{t("staff")}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </>
    ) : null
  );

  return (
    <>
      <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 bg-emerald-950/95 border-b border-emerald-800/40 backdrop-blur-sm z-50 relative">
        
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-1 h-5 md:h-6 rounded-full bg-emerald-400 shrink-0" />
          <h1 className="text-sm md:text-base font-bold text-emerald-50 truncate">
            {title.charAt(0).toUpperCase() + title.slice(1)}
          </h1>
        </div>

        
        <div className="hidden md:flex items-center gap-2">
          
          <div ref={searchRef} className="relative">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-900/60 border border-emerald-700/40 hover:bg-emerald-800/60 transition-all w-64">
              <img src="src/assets/icons/search-svgrepo-com (1).svg" alt={t("search")} className="w-3.5 h-3.5 brightness-0 invert shrink-0" />
              <input type="text" placeholder={t("Search")} value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults && setShowResults(true)}
                className="bg-transparent text-emerald-100 text-xs placeholder-emerald-500/60 outline-none w-full" />
              {searchLoading && <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />}
              {searchQuery && !searchLoading && (
                <button onClick={() => { setSearchQuery(""); setShowResults(false); }} className="text-emerald-500/60 hover:text-emerald-300 shrink-0">
                  <img src="src/assets/icons/close-svgrepo-com (1).svg" alt="clear" className="w-3 h-3 brightness-0 invert" />
                </button>
              )}
            </div>
            <SearchDropdown />
          </div>

         
          <div className="relative">
            <button onClick={() => setShowLang(!showLang)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-900/60 border border-emerald-700/40 hover:bg-emerald-800/60 transition-all">
              <span className="text-sm">{currentLang.flag}</span>
              <span className="text-xs font-semibold text-emerald-100">{currentLang.label}</span>
              <img src="src/assets/icons/dropdown-arrow-svgrepo-com.svg" alt="dropdown"
                className={`w-4 h-4 brightness-0 invert transition-transform duration-200 ${showLang ? "rotate-180" : ""}`} />
            </button>
            {showLang && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLang(false)} />
                <div className="absolute right-0 top-11 z-50 bg-emerald-950 border border-emerald-800/50 rounded-2xl shadow-2xl p-1.5 w-32">
                  {languages.map((lang) => (
                    <button key={lang.code} onClick={() => handleLangChange(lang.code)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${i18n.language === lang.code ? "bg-emerald-500 text-white" : "text-emerald-400 hover:bg-emerald-900/60 hover:text-emerald-100"}`}>
                      <span>{lang.flag}</span><span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          
          <button onClick={toggleDarkmode} className="w-9 h-9 rounded-xl bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center hover:bg-emerald-800/60 transition-all">
            <img src={isDarkmodeActive ? "/src/assets/icons/sun-meteorology-svgrepo-com.svg" : "/src/assets/icons/waningcrescentmoon-svgrepo-com.svg"}
              alt="theme" className="w-4 h-4 opacity-60" />
          </button>

          <NotificationBell />
          <div className="w-px h-6 bg-emerald-800/60 mx-1" />

          
          <div className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl hover:bg-emerald-900/50 transition-all" onClick={() => navigate("/profile")}>
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl.startsWith("http") ? user.profileImageUrl : `http://localhost:5171${user.profileImageUrl}`}
                alt="profile" className="w-8 h-8 rounded-xl object-cover shadow-lg" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {user?.firstName?.[0] || "U"}
              </div>
            )}
            <div>
              <p className="text-emerald-100 text-xs font-semibold leading-tight">{user?.firstName || t("user")}</p>
              <p className="text-emerald-500/60 text-xs leading-tight">{t("online")}</p>
            </div>
          </div>

          
          <div className="relative">
            <button onClick={() => setShowLogout(!showLogout)}
              className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center hover:bg-rose-500/25 transition-all">
              <img src="/src/assets/icons/power-button-power-svgrepo-com.svg" alt="logout" className="w-4 h-4 opacity-60" />
            </button>
            {showLogout && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLogout(false)} />
                <div className="absolute right-0 top-11 rounded-2xl shadow-2xl p-2 z-50 w-40 bg-emerald-950 border border-emerald-800/50">
                  <button onClick={() => setShowLogout(false)} className="w-full text-left text-xs text-emerald-400 py-2 px-3 rounded-xl hover:bg-emerald-900/60 transition-colors">{t("Cancel")}</button>
                  <button onClick={handleLogout} className="w-full text-left text-xs text-rose-400 py-2 px-3 rounded-xl hover:bg-rose-500/10 transition-colors mt-1">{t("Logout")}</button>
                </div>
              </>
            )}
          </div>
        </div>

        
        <div className="flex md:hidden items-center gap-1.5">
          
          <button onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="w-8 h-8 rounded-xl bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center">
            <img src="src/assets/icons/search-svgrepo-com (1).svg" alt="search" className="w-3.5 h-3.5 brightness-0 invert" />
          </button>

          
          <div className="relative">
            <button onClick={() => setShowLang(!showLang)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/40">
              <span className="text-xs">{currentLang.flag}</span>
              <span className="text-xs font-semibold text-emerald-100">{currentLang.label}</span>
            </button>
            {showLang && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLang(false)} />
                <div className="absolute right-0 top-10 z-50 bg-emerald-950 border border-emerald-800/50 rounded-2xl shadow-2xl p-1.5 w-28">
                  {languages.map((lang) => (
                    <button key={lang.code} onClick={() => handleLangChange(lang.code)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${i18n.language === lang.code ? "bg-emerald-500 text-white" : "text-emerald-400 hover:bg-emerald-900/60"}`}>
                      <span>{lang.flag}</span><span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

         
          <button onClick={toggleDarkmode} className="w-8 h-8 rounded-xl bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center">
            <img src={isDarkmodeActive ? "/src/assets/icons/sun-meteorology-svgrepo-com.svg" : "/src/assets/icons/waningcrescentmoon-svgrepo-com.svg"}
              alt="theme" className="w-3.5 h-3.5 opacity-60" />
          </button>

          <NotificationBell />

        
          <div className="cursor-pointer" onClick={() => navigate("/profile")}>
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl.startsWith("http") ? user.profileImageUrl : `http://localhost:5171${user.profileImageUrl}`}
                alt="profile" className="w-8 h-8 rounded-xl object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.firstName?.[0] || "U"}
              </div>
            )}
          </div>

        
          <div className="relative">
            <button onClick={() => setShowLogout(!showLogout)}
              className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center">
              <img src="/src/assets/icons/power-button-power-svgrepo-com.svg" alt="logout" className="w-3.5 h-3.5 opacity-60" />
            </button>
            {showLogout && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLogout(false)} />
                <div className="absolute right-0 top-10 rounded-2xl shadow-2xl p-2 z-50 w-36 bg-emerald-950 border border-emerald-800/50">
                  <button onClick={() => setShowLogout(false)} className="w-full text-left text-xs text-emerald-400 py-2 px-3 rounded-xl hover:bg-emerald-900/60">{t("Cancel")}</button>
                  <button onClick={handleLogout} className="w-full text-left text-xs text-rose-400 py-2 px-3 rounded-xl hover:bg-rose-500/10 mt-1">{t("Logout")}</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      
      {showMobileSearch && (
        <div className="md:hidden bg-emerald-950 border-b border-emerald-800/40 px-4 py-3">
          <div ref={searchRef} className="relative">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-900/60 border border-emerald-700/40">
              <img src="src/assets/icons/search-svgrepo-com (1).svg" alt="search" className="w-3.5 h-3.5 brightness-0 invert shrink-0" />
              <input type="text" placeholder={t("Search")} value={searchQuery} autoFocus
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults && setShowResults(true)}
                className="bg-transparent text-emerald-100 text-sm placeholder-emerald-500/60 outline-none flex-1" />
              {searchLoading && <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />}
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setShowResults(false); }} className="text-emerald-500/60">✕</button>
              )}
              <button onClick={() => { setShowMobileSearch(false); setSearchQuery(""); }} className="text-emerald-500/60 text-xs ml-1">
                {t("Cancel")}
              </button>
            </div>
            <SearchDropdown />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;