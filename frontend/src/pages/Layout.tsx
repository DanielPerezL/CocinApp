import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="flex-grow-1 mx-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
