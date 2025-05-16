import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authService } from "../services/auth";
import LanguageSwitcher from "./LanguageSwitcher";
import toast from "react-hot-toast";

interface NavItem {
  name: string;
  path: string;
}

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = authService.getUserProfile()?.role === "admin";

  const navItems: NavItem[] = [
    {
      name: t("nav.projects"),
      path: "/projects",
    },
    {
      name: t("nav.projectsStatus"),
      path: "/projects-status",
    },
    {
      name: t("nav.customers"),
      path: "/customers",
    },
    {
      name: t("nav.materials"),
      path: "/materials",
    },
    ...(isAdmin ? [{ name: t("nav.users"), path: "/users" }] : []),
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (error) {
      toast.error(t("common.error"));
      console.error("Logout error:", error);
    }
  };

  // RTL/LTR support
  const isRTL = i18n.language === "ar";

  return (
    <nav
      className={`sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg shadow-md border-b border-gray-200 transition-all duration-200 ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="text-2xl font-extrabold text-primary tracking-widest drop-shadow">
              BlackDiamond-MS
            </span>
          </div>
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/40
                    ${
                      isActive
                        ? "bg-primary text-white shadow-lg border-b-4 border-primary font-bold scale-105"
                        : "text-gray-700 hover:bg-primary/10 hover:text-primary"
                    }
                  `}
                  style={
                    isActive
                      ? { boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }
                      : {}
                  }
                >
                  {item.name}
                </button>
              );
            })}
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 rounded-lg font-medium text-base text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
            >
              {t("nav.logout")}
            </button>
          </div>
          {/* Mobile Hamburger */}
          <div className="lg:hidden flex items-center">
            <LanguageSwitcher />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="ml-2 p-2 rounded-lg text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label={menuOpen ? t("common.close") : t("common.menu")}
            >
              {menuOpen ? (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white/95 border-b border-gray-200 shadow-lg animate-fade-in-down">
          <div className="flex flex-col gap-2 px-4 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-right px-4 py-3 rounded-lg font-medium transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/40
                    ${
                      isActive
                        ? "bg-primary text-white shadow-lg border-r-4 border-primary font-bold scale-105"
                        : "text-gray-700 hover:bg-primary/10 hover:text-primary"
                    }
                  `}
                  style={
                    isActive
                      ? { boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }
                      : {}
                  }
                >
                  {item.name}
                </button>
              );
            })}
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full text-right px-4 py-3 rounded-lg font-medium text-base text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
            >
              {t("nav.logout")}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
