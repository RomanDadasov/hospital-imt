import { useState } from "react";
import { useTranslation } from "react-i18next";

const categories = [
  { id: "all", labelKey: "All", emoji: "📚" },
  { id: "cardio", labelKey: "Cardiology", emoji: "❤️" },
  { id: "nutrition", labelKey: "Nutrition", emoji: "🥗" },
  { id: "mental", labelKey: "MentalHealth", emoji: "🧠" },
  { id: "prevention", labelKey: "Prevention", emoji: "🛡️" },
  { id: "fitness", labelKey: "Fitness", emoji: "💪" },
];

const videos = [
  {
    id: 1, category: "cardio",
    titleKey: "BloodPressureTitle",
    descriptionKey: "BloodPressureDesc",
    videoId: "2DpNHMiDFuA",
    duration: "5:30", levelKey: "Beginner", tagKey: "CardioTag",
  },
  {
    id: 2, category: "prevention",
    titleKey: "CovidTitle",
    descriptionKey: "CovidDesc",
    videoId: "1APwq1df6Mw",
    duration: "8:15", levelKey: "General", tagKey: "WHOTag",
  },
  {
    id: 3, category: "nutrition",
    titleKey: "NutritionTitle",
    descriptionKey: "NutritionDesc",
    videoId: "fqhYBTg73fw",
    duration: "10:22", levelKey: "Beginner", tagKey: "NutritionTag",
  },
  {
    id: 4, category: "mental",
    titleKey: "StressTitle",
    descriptionKey: "StressDesc",
    videoId: "hnpQrMqDoqE",
    duration: "7:45", levelKey: "Intermediate", tagKey: "PsychologistTag",
  },
  {
    id: 5, category: "fitness",
    titleKey: "HomeWorkoutTitle",
    descriptionKey: "HomeWorkoutDesc",
    videoId: "IODxDxX7oi4",
    duration: "15:00", levelKey: "Beginner", tagKey: "FitnessTag",
  },
  {
    id: 6, category: "cardio",
    titleKey: "HeartHealthTitle",
    descriptionKey: "HeartHealthDesc",
    videoId: "5jnOoBGKIZU",
    duration: "6:20", levelKey: "General", tagKey: "CardioTag2",
  },
  {
    id: 7, category: "nutrition",
    titleKey: "WaterTitle",
    descriptionKey: "WaterDesc",
    videoId: "9iMGFqMmUFs",
    duration: "4:10", levelKey: "Beginner", tagKey: "DoctorTag",
  },
  {
    id: 8, category: "prevention",
    titleKey: "HandWashTitle",
    descriptionKey: "HandWashDesc",
    videoId: "3PmVJQUCm4E",
    duration: "2:30", levelKey: "Beginner", tagKey: "WHOTag2",
  },
  {
    id: 9, category: "mental",
    titleKey: "SleepTitle",
    descriptionKey: "SleepDesc",
    videoId: "nm1TxQj9IsQ",
    duration: "9:15", levelKey: "General", tagKey: "HealthTag",
  },
];

const levelColor = {
  "Beginner": "bg-green-500/20 text-green-400 border-green-500/30",
  "Intermediate": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "General": "bg-sky-500/20 text-sky-400 border-sky-500/30",
};

export default function EducationPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState(null);

  const filtered = videos.filter((v) => {
    const matchCat = activeCategory === "all" || v.category === activeCategory;
    const title = t(v.titleKey).toLowerCase();
    const desc = t(v.descriptionKey).toLowerCase();
    const query = search.toLowerCase();
    return matchCat && (title.includes(query) || desc.includes(query));
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white">

      
      <div className="text-center pt-10 pb-6 px-4">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-emerald-300 text-xs font-semibold tracking-wider uppercase">{t("FreeNoLogin")}</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">
          {t("Medical")} <span className="text-emerald-400">{t("Education")}</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          {t("EducationDesc")}
        </p>

        
        <div className="flex items-center justify-center gap-6 mt-5">
          {[
            { labelKey: "Videos", value: videos.length, emoji: "🎬" },
            { labelKey: "Topics", value: categories.length - 1, emoji: "📂" },
            { labelKey: "Free", value: "100%", emoji: "✅" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-2">
              <span>{s.emoji}</span>
              <span className="text-lg font-black text-white">{s.value}</span>
              <span className="text-xs text-slate-400">{t(s.labelKey)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">

       
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder={t("SearchVideos")} value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/40 rounded-xl text-white text-sm placeholder-slate-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"/>
          </div>
        </div>

        
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                activeCategory === cat.id
                  ? "bg-emerald-500 border-transparent text-white shadow-md shadow-emerald-900/30"
                  : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}>
              <span>{cat.emoji}</span>
              <span>{t(cat.labelKey)}</span>
              {cat.id !== "all" && (
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${activeCategory === cat.id ? "bg-white/20" : "bg-slate-700/60 text-slate-500"}`}>
                  {videos.filter(v => v.category === cat.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

      
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-400 font-semibold">{t("NoVideosFound")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((video) => (
              <div key={video.id} className="bg-slate-800/40 border border-slate-700/40 rounded-2xl overflow-hidden hover:border-slate-600/60 transition-all group hover:shadow-xl hover:shadow-black/20">

              
                <div className="relative aspect-video bg-slate-900">
                  {playingId === video.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                        alt={t(video.titleKey)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"/>
                      <button onClick={() => setPlayingId(video.id)}
                        className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M5 3l14 9-14 9V3z" fill="#0f172a"/>
                          </svg>
                        </div>
                      </button>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md font-mono">
                        {video.duration}
                      </div>
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-lg border font-semibold ${levelColor[video.levelKey] || "bg-slate-700 text-slate-400"}`}>
                      {t(video.levelKey)}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-lg border border-slate-600/30">
                      {t(video.tagKey)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                    {t(video.titleKey)}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t(video.descriptionKey)}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/40">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      🎬 YouTube
                    </span>
                    {playingId === video.id ? (
                      <button onClick={() => setPlayingId(null)}
                        className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-lg font-medium transition-colors hover:bg-rose-500/30">
                        ⏹ {t("Stop")}
                      </button>
                    ) : (
                      <button onClick={() => setPlayingId(video.id)}
                        className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg font-medium transition-colors hover:bg-emerald-500/30">
                        ▶ {t("Watch")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center">
          <p className="text-2xl font-black text-white mb-2">{t("NeedMoreInfo")}</p>
          <p className="text-slate-400 text-sm mb-5">{t("NeedMoreInfoDesc")}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="/symptom-checker" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-900/30 hover:-translate-y-0.5">
              🩺 {t("SymptomChecker")}
            </a>
            <a href="/login" className="flex items-center gap-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 text-slate-300 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5">
              🏥 {t("Login")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}