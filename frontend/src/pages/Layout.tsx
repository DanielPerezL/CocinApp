import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import NavButtons from "../components/NavButtons";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />
      <div className="flex-grow-1 mx-1">
        <Outlet />
      </div>
      <Footer />
      <nav className="bottom-nav d-block d-md-none bg-primary p-2">
        <NavButtons />
      </nav>
    </div>
  );
};

export default Layout;
