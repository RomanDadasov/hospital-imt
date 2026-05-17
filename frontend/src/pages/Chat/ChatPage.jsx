import { useState, useRef, useEffect } from "react";
import { useChat } from "../../hooks/useChat";
import useTokenStore from "../../stores/tokenStore";
import { useTranslation } from "react-i18next";
import { clearChatHistory } from "../../api/chatApi";
import { useToast } from "../../context/ToastContext";

const BASE_URL = "http://localhost:5171";

const ROOMS = [
  { id: "general", labelKey: "General", roles: ["Admin", "Receptionist", "Doctor"], icon: "💬" },
  { id: "doctors", labelKey: "DoctorsRoom", roles: ["Admin", "Doctor"], icon: "👨‍⚕️" },
  { id: "admin", labelKey: "AdminRoom", roles: ["Admin", "Receptionist"], icon: "⚙️" },
];

const roleColor = {
  Admin: "bg-rose-500/20 text-rose-400 border-rose-500/20",
  Doctor: "bg-emerald-500/20 text-emerald-600 border-emerald-500/20",
  Receptionist: "bg-sky-500/20 text-sky-500 border-sky-500/20",
};

const avatarGradient = {
  Admin: "from-rose-400 to-rose-600",
  Doctor: "from-emerald-400 to-teal-600",
  Receptionist: "from-sky-400 to-blue-600",
};

const isImage = (type) => type?.startsWith("image/");
const resolveUrl = (url) => { if (!url) return ""; return url.startsWith("http") ? url : `${BASE_URL}${url}`; };

const ChatPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { user, role } = useTokenStore();
  const [activeRoom, setActiveRoom] = useState("general");
  const [input, setInput] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const { messages, setMessages, sendMessage, sendFile, connected, loadingHistory, uploading } = useChat(activeRoom);
  const availableRooms = ROOMS.filter((r) => r.roles.includes(role));
  const myId = user?.id || user?.Id;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { setShowClearConfirm(false); }, [activeRoom]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (previewFile) {
      await sendFile(previewFile, input.trim());
      setPreviewFile(null); setInput("");
    } else {
      if (!input.trim()) return;
      await sendMessage(input.trim());
      setInput("");
    }
    inputRef.current?.focus();
  };

  const handleFileChange = (e) => { const file = e.target.files[0]; if (file) setPreviewFile(file); e.target.value = ""; };
  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); };

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      await clearChatHistory(activeRoom);
      setMessages([]);
      setShowClearConfirm(false);
      toast.success("Successful!");
    } catch {
      toast.error("Error! Deletion failed");
    } finally { setClearing(false); }
  };

  const activeRoomData = availableRooms.find((r) => r.id === activeRoom);

  return (
    <div className="flex flex-col h-full min-h-0 md:flex-row md:gap-4">

      
      <div className="md:hidden flex gap-1.5 bg-white border border-gray-100 rounded-2xl p-2 shrink-0 overflow-x-auto">
        {availableRooms.map((room) => (
          <button key={room.id} onClick={() => setActiveRoom(room.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeRoom === room.id ? "bg-emerald-500 text-white shadow-md" : "text-slate-500 hover:bg-gray-50"
            }`}>
            <span>{room.icon}</span>
            <span>{t(room.labelKey)}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 px-2 shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-300"}`} />
          <span className={`text-xs font-medium ${connected ? "text-emerald-500" : "text-slate-400"}`}>
            {connected ? t("Connected") : t("Connecting")}
          </span>
        </div>
      </div>

 
      <div className="hidden md:flex w-56 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex-col gap-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-2">
          <span>💬</span> {t("Rooms")}
        </p>
        {availableRooms.map((room) => (
          <button key={room.id} onClick={() => setActiveRoom(room.id)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeRoom === room.id ? "bg-emerald-500 text-white shadow-md shadow-emerald-100" : "text-slate-500 hover:bg-gray-50 hover:text-slate-700"
            }`}>
            <span className="text-base">{room.icon}</span>
            <span>{t(room.labelKey)}</span>
          </button>
        ))}
        <div className="mt-auto pt-3 px-2 border-t border-gray-50">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${connected ? "text-emerald-500" : "text-slate-400"}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-300"}`} />
            {connected ? t("Connected") : t("Connecting")}
          </div>
        </div>
      </div>

      
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-0 mt-3 md:mt-0">

        
        <div className="px-4 md:px-5 py-3 border-b border-gray-100 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl">{activeRoomData?.icon}</span>
            <div>
              <p className="font-bold text-slate-800 text-sm">{t(activeRoomData?.labelKey)}</p>
              <p className="text-xs text-slate-400">{messages.length} {t("Messages")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {connected && (
              <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-600 font-medium">{t("Online")}</span>
              </div>
            )}
            {!showClearConfirm ? (
              <button onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-100 rounded-lg text-xs font-semibold transition-all">
                🗑️ <span className="hidden sm:inline">Clean</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 hidden sm:inline">Sure?</span>
                <button onClick={handleClearHistory} disabled={clearing}
                  className="px-2.5 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 disabled:opacity-60">
                  {clearing ? "..." : "Yes"}
                </button>
                <button onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-1.5 bg-gray-100 text-slate-500 rounded-lg text-xs font-semibold hover:bg-gray-200">
                  No
                </button>
              </div>
            )}
          </div>
        </div>

     
        <div className="flex-1 overflow-y-auto px-3 md:px-5 py-4 space-y-3 md:space-y-4 min-h-0">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400">{t("Loading")}</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-sm text-slate-400 font-medium">{t("NoMessages")}</p>
              <p className="text-xs text-slate-300">{t("BeFirst")}</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === myId;
              const grad = avatarGradient[msg.senderRole] || "from-gray-400 to-gray-600";
              const rc = roleColor[msg.senderRole] || "bg-gray-100 text-gray-500 border-gray-200";
              const fileUrl = resolveUrl(msg.attachmentUrl);
              const avatarUrl = msg.senderProfileImageUrl ? resolveUrl(msg.senderProfileImageUrl) : null;

              return (
                <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl overflow-hidden shrink-0 shadow-sm">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={msg.senderName} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold`}>
                        {msg.senderName?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className={`max-w-[75%] md:max-w-xs flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-600">{msg.senderName}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium border hidden sm:inline ${rc}`}>
                          {msg.senderRole === "Admin" ? "Admin" :
                            msg.senderRole === "Doctor" ? "👨‍⚕️" :
                            msg.senderRole === "Receptionist" ? "📋" : msg.senderRole}
                        </span>
                      </div>
                    )}

                    <div className={`px-3 md:px-4 py-2 md:py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      isMe ? "bg-emerald-500 text-white rounded-tr-sm shadow-md shadow-emerald-100" : "bg-gray-100 text-slate-700 rounded-tl-sm"
                    }`}>
                      {msg.attachmentUrl && isImage(msg.attachmentType) && (
                        <img src={fileUrl} alt={msg.attachmentName}
                          className="max-w-40 md:max-w-48 max-h-40 md:max-h-48 rounded-xl mb-2 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(fileUrl, "_blank")} />
                      )}
                      {msg.attachmentUrl && !isImage(msg.attachmentType) && (
                        <a href={fileUrl} target="_blank" rel="noreferrer"
                          className={`flex items-center gap-2 mb-2 px-3 py-2 rounded-xl border transition-colors ${
                            isMe ? "bg-emerald-600/50 border-emerald-400/30 hover:bg-emerald-600/70" : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}>
                          <span className="text-lg">📄</span>
                          <span className={`text-xs font-medium truncate max-w-24 md:max-w-32 ${isMe ? "text-white" : "text-slate-600"}`}>{msg.attachmentName}</span>
                          <span className={`text-xs ml-auto ${isMe ? "text-emerald-200" : "text-slate-400"}`}>⬇</span>
                        </a>
                      )}
                      {msg.message && <span>{msg.message}</span>}
                    </div>

                    <span className="text-xs text-slate-300">
                      {new Date(msg.sentAt).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        
        {previewFile && (
          <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-3 bg-emerald-50/50 shrink-0">
            <span className="text-lg">{previewFile.type.startsWith("image/") ? "🖼️" : "📄"}</span>
            <span className="text-xs text-slate-600 font-medium truncate flex-1">{previewFile.name}</span>
            <button onClick={() => setPreviewFile(null)} className="text-xs text-rose-400 hover:text-rose-600 font-medium">✕</button>
          </div>
        )}

        
        <form onSubmit={handleSend} className="px-3 md:px-4 py-3 border-t border-gray-100 flex gap-2 shrink-0">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!connected}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gray-50 border border-gray-100 hover:bg-emerald-50 hover:border-emerald-200 flex items-center justify-center transition-all disabled:opacity-40 shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-slate-400">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf,.docx,.doc,.xlsx,.xls,.zip" onChange={handleFileChange} className="hidden" />

          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={previewFile ? t("AddComment") : connected ? t("TypeMessage") : t("Connecting")}
            disabled={!connected}
            className="flex-1 px-3 md:px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 transition-all" />

          <button type="submit" disabled={!connected || (!input.trim() && !previewFile) || uploading}
            className="w-9 h-9 md:w-10 md:h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-emerald-100 active:scale-95 shrink-0">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;