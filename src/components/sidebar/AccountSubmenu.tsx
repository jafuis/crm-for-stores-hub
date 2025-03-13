
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, UserRound, CircleOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountSubmenu() {
  const [isAccountSubmenuOpen, setIsAccountSubmenuOpen] = useState(false);

  const toggleAccountSubmenu = () => {
    setIsAccountSubmenuOpen(!isAccountSubmenuOpen);
  };

  return (
    <div>
      <Button
        variant="ghost"
        className="justify-start px-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={toggleAccountSubmenu}
      >
        <UserRound className="w-4 h-4 mr-2" />
        <span>Conta</span>
        {isAccountSubmenuOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </Button>
      {isAccountSubmenuOpen && (
        <div className="pl-4 space-y-2">
          <Link to="/minha-conta" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <UserRound className="w-4 h-4 mr-2" />
            Minha Conta
          </Link>
          <Link to="/logout" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <CircleOff className="w-4 h-4 mr-2" />
            Logout
          </Link>
        </div>
      )}
    </div>
  );
}
