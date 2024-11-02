import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import NavButtons from "../components/NavButtons";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <>
      <nav className="top-nav">
        <NavBar />
      </nav>
      <div className="mt-5 d-flex flex-column min-vh-100 bg-light">
        <div className="mt-4 flex-grow-1 mx-1 pb-5">
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
