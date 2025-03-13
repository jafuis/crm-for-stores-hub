
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Settings, Users, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsSubmenu() {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  const toggleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen);
  };

  return (
    <div>
      <Button
        variant="ghost"
        className="justify-start px-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={toggleSubmenu}
      >
        <Settings className="w-4 h-4 mr-2" />
        <span>Configurações</span>
        {isSubmenuOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </Button>
      {isSubmenuOpen && (
        <div className="pl-4 space-y-2">
          <Link to="/configuracoes/usuarios" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <Users className="w-4 h-4 mr-2" />
            Usuários
          </Link>
          <Link to="/configuracoes/notificacoes" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <BellRing className="w-4 h-4 mr-2" />
            Notificações
          </Link>
        </div>
      )}
    </div>
  );
}
