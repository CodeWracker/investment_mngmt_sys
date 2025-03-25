import { useState } from "react";
import { Menu, User } from "lucide-react";
import { useLocation } from "wouter";

interface HeaderProps {
  toggleSidebar: () => void;
  title?: string;
}

export default function Header({ toggleSidebar, title = "Dashboard" }: HeaderProps) {
  const [location] = useLocation();
  
  // Get page title based on current location
  const getPageTitle = () => {
    if (location === "/") return "Dashboard";
    if (location === "/clients") return "Gerenciar Clientes";
    if (location.startsWith("/clients/")) return "Dashboard do Cliente";
    if (location === "/reports") return "Relatórios";
    if (location === "/settings") return "Configurações";
    return title;
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="md:hidden text-gray-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-2 md:ml-0">
            {getPageTitle()}
          </h1>
        </div>
        <div className="flex items-center">
          <div className="relative">
            <div className="flex items-center text-gray-600">
              <span className="hidden md:inline-block mr-2">Admin</span>
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
