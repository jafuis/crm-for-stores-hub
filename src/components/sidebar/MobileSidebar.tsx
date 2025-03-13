
import React from "react";
import { Link } from "react-router-dom";
import { CircleOff } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SidebarLinks from "./SidebarLinks";
import SettingsSubmenu from "./SettingsSubmenu";
import AccountSubmenu from "./AccountSubmenu";

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: any;
}

export default function MobileSidebar({ isOpen, setIsOpen, user }: MobileSidebarProps) {
  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-64">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="font-bold">
              Super CRM
            </Link>
            <Button variant="ghost" size="icon" onClick={closeSidebar}>
              <CircleOff className="w-5 h-5" />
            </Button>
          </div>
          {user && (
            <div className="flex items-center space-x-2 mb-4">
              <Avatar>
                <AvatarFallback>{user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.id}
                </p>
              </div>
            </div>
          )}
          <SidebarLinks />
          <div className="mt-4">
            <SettingsSubmenu />
          </div>
          <div className="mt-4">
            <AccountSubmenu />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
