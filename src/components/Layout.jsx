import { useTranslation } from "react-i18next";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { authService } from "../services/auth";
import { USER_ROLES } from "../services/supabase";
import { useState } from "react";

const Layout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getUser();
  const profile = authService.getUserProfile();
  const isAdmin = profile?.role === USER_ROLES.ADMIN;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await authService.signOut();
    navigate("/login");
  };

  const navLinks = [
    { to: "/projects", label: t("nav.projects") },
    { to: "/customers", label: t("nav.customers") },
  ];
  if (isAdmin) {
    navLinks.push({ to: "/users", label: t("nav.users") });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center relative">
            {/* Hamburger for mobile (left) */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none"
                aria-label="Main menu"
              >
                <svg className="h-7 w-7" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
            {/* Logo/title (centered on mobile, left on desktop) */}
            <div className="flex-1 flex items-center justify-center md:justify-start">
              <h1 className="text-xl font-bold text-gray-900">BlackDiamond-Ms</h1>
            </div>
            {/* Desktop Nav */}
            <div className="hidden md:flex md:space-x-2 md:ml-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${location.pathname.startsWith(link.to)
                    ? "bg-primary text-white shadow"
                    : "text-gray-600 hover:bg-gray-100 hover:text-primary"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {/* User/Language/Logout (desktop only) */}
            <div className="hidden md:flex items-center space-x-2 ml-4">
              <span className="text-sm text-gray-500">
                {user?.email?.split("@")[0]}
              </span>
              <LanguageSwitcher />
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                {t("auth.logout")}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Fullscreen Overlay Menu */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 flex">
            <div className="relative bg-white w-4/5 max-w-xs h-full shadow-xl flex flex-col animate-slideInLeft">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-primary"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {/* Logo */}
              <div className="flex items-center justify-center py-8 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900">BlackDiamond-Ms</h1>
              </div>
              {/* Nav links */}
              <nav className="flex-1 flex flex-col gap-2 mt-6 px-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-150 ${location.pathname.startsWith(link.to)
                      ? "bg-primary text-white shadow"
                      : "text-gray-600 hover:bg-gray-100 hover:text-primary"}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              {/* User/Language/Logout at bottom */}
              <div className="mt-auto px-6 py-6 border-t border-gray-100 flex flex-col gap-3">
                <span className="text-sm text-gray-500">{user?.email?.split("@")[0]}</span>
                <LanguageSwitcher />
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  {t("auth.logout")}
                </button>
              </div>
            </div>
            {/* Clickable overlay to close */}
            <div className="flex-1" onClick={() => setMenuOpen(false)} />
          </div>
        )}
      </nav>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 