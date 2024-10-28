import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <>
      <Navbar />
      <div className="vh-100">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};
export default Layout;
