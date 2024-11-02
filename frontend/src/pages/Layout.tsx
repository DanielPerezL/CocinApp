import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import NavButtons from "../components/NavButtons";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <>
      <div className="d-flex flex-column min-vh-100 bg-light">
        <NavBar />
        <div className="flex-grow-1 mx-1 pb-5">
          <Outlet />
        </div>
        <Footer />
      </div>
      <nav className="bottom-nav d-block d-md-none bg-primary p-2">
        <NavButtons />
      </nav>
    </>
  );
};

export default Layout;
