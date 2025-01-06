import { Button } from "primereact/button";
import React from "react";

const Header = ({ handleOpenSidebar, handleLogout }) => {
  return (
    <header className="flex justify-content-between align-items-center p-3 bg-primary text-white shadow-2">
      <div className="flex align-items-center">
        <Button
          icon="pi pi-bars"
          onClick={handleOpenSidebar}
          className="p-button-text p-button-plain p-mr-2 md:hidden"
        />
        <h1 className="text-xl font-bold m-0">
          Purchase Order Management System
        </h1>
      </div>
      <Button
        label="Logout"
        icon="pi pi-sign-out"
        onClick={handleLogout}
        className="p-button-text p-button-plain"
      />
    </header>
  );
};

export default Header;
