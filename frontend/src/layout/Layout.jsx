import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

function Layout({ onSectionChange }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header onSectionChange={onSectionChange} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
