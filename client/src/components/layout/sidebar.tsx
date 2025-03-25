import { Home, Users, BarChart2, Settings, User, UserPlus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

type SidebarLink = {
  icon: React.ReactNode;
  label: string;
  href: string;
};

type SidebarSection = {
  title: string;
  links: SidebarLink[];
};

const sidebarSections: SidebarSection[] = [
  {
    title: "Dashboard",
    links: [
      {
        icon: <Home className="h-4 w-4" />,
        label: "Visão Geral",
        href: "/",
      },
    ],
  },
  {
    title: "Clientes",
    links: [
      {
        icon: <Users className="h-4 w-4" />,
        label: "Gerenciar Clientes",
        href: "/clients",
      },
      {
        icon: <UserPlus className="h-4 w-4" />,
        label: "Adicionar Cliente",
        href: "/clients?new=true",
      },
    ],
  },
  {
    title: "Investimentos",
    links: [
      {
        icon: <BarChart2 className="h-4 w-4" />,
        label: "Relatórios",
        href: "/reports",
      },
      {
        icon: <Settings className="h-4 w-4" />,
        label: "Configurações",
        href: "/settings",
      },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="bg-gray-900 text-white w-64 flex-shrink-0 hidden md:flex md:flex-col">
      <div className="p-4 h-16 flex items-center border-b border-gray-800">
        <span className="font-semibold text-xl tracking-tight text-teal-500">
          InvestTracker Brasil
        </span>
      </div>
      <nav className="mt-6 flex-1">
        {sidebarSections.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wider">
              {section.title}
            </div>
            {section.links.map((link) => {
              const isActive = location === link.href || 
                (link.href !== '/' && location.startsWith(link.href));
              
              return (
                <Link key={link.href} href={link.href}>
                  <a
                    className={cn(
                      "flex items-center px-4 py-3 text-sm transition-colors duration-200",
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    )}
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.label}
                  </a>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
