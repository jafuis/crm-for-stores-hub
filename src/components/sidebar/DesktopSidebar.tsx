
import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SidebarLinks from "./SidebarLinks";
import SettingsSubmenu from "./SettingsSubmenu";
import AccountSubmenu from "./AccountSubmenu";

interface DesktopSidebarProps {
  toggleSidebar: () => void;
  user: any;
}

export default function DesktopSidebar({ toggleSidebar, user }: DesktopSidebarProps) {
  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:h-screen md:border-r md:dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
        <Link to="/" className="font-bold">
          Super CRM
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {user && (
        <div className="flex items-center space-x-2 px-4 py-3 border-b dark:border-gray-700">
          <Avatar>
            <AvatarFallback>{user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              {user.id}
            </p>
          </div>
        </div>
      )}

      <div className="flex-grow p-4 overflow-y-auto">
        <SidebarLinks />
        <div className="mt-4">
          <SettingsSubmenu />
        </div>
        <div className="mt-4">
          <AccountSubmenu />
        </div>
      </div>
    </div>
  );
}
