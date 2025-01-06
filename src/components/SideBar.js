import { Sidebar } from "primereact/sidebar";
import React from "react";
import { NavLink } from "react-router-dom";

const SidebarMenu = ({ sidebarVisible, handleCloseSidebar, menuItems }) => {
  return (
    <>
      <Sidebar
        visible={sidebarVisible}
        onHide={handleCloseSidebar}
        className="md:hidden p-sidebar-sm"
      >
        <nav className="mt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex align-items-center p-3 text-color hover:surface-200 transition-colors transition-duration-150 ${
                  isActive ? "bg-primary text-white" : ""
                }`
              }
              onClick={handleCloseSidebar}
            >
              <i className={`${item.icon} mr-2`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </Sidebar>
      <nav className="hidden md:block w-15rem flex-shrink-0 bg-gray-100 shadow-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex align-items-center p-3 text-color hover:surface-200 transition-colors transition-duration-150 ${
                isActive ? "bg-primary text-white" : ""
              }`
            }
          >
            <i className={`${item.icon} mr-2`}></i>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default SidebarMenu;
