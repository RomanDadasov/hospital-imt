import { Outlet, useLocation } from "react-router-dom";
import Navigator from "../Navigator/Navigator";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useDarkMode } from "../../stores/darkMode";
import { useTranslation } from "react-i18next";
import ChatPage from "../../pages/Chat/ChatPage";

const MainLayout = () => {
  const location = useLocation();
  const { isDarkmodeActive } = useDarkMode();
  const { t } = useTranslation();

  const pageTitles = {
    "/dashboard": t("dashboard"),
    "/doctors": t("doctors"),
    "/patients": t("patients"),
    "/staff": t("staff"),
    "/appointments": t("appointments"),
    "/departments": t("departments"),
    "/profile": t("profile"),
    "/my-appointments": t("myAppointments"),
    "/chat": t("Chat"),
    "/analytics": t("Analytics"),
    "/queue-management": t("Queue"),
    "/appointment-requests": t("AppointmentRequests"),
    "/audit": t("Audit"),
    "/schedule": t("Schedule"),
    "/pharmacy": t("Pharmacy"),
    "/doctor-panel": t("DoctorPanel"),
  };

  const title = pageTitles[location.pathname] || "MedCare";
  const isChat = location.pathname === "/chat";

  return (
    <div className={`flex h-screen bg-gray-50 overflow-hidden ${isDarkmodeActive ? "dark-mode-active" : ""}`}>
      
      <Navigator />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header title={title} />

        <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          <div className={`h-full ${isChat ? "block" : "hidden"}`}>
            <ChatPage />
          </div>
          {!isChat && (
            <div className="h-full">
              <Outlet />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;