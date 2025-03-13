
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileSidebar from "./sidebar/MobileSidebar";
import DesktopSidebar from "./sidebar/DesktopSidebar";
import { NotificationsProvider } from "@/contexts/NotificationsContext";

export default function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <NotificationsProvider>
      <MobileSidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        user={user} 
      />
      <DesktopSidebar 
        toggleSidebar={toggleSidebar} 
        user={user} 
      />
    </NotificationsProvider>
  );
}
