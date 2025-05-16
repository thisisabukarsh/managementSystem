import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-primary/5 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
