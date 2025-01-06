import React, { useState, useEffect, useRef, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import localStorageService from "./service/localStorage.services";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import SidebarMenu from "./components/SideBar";

// const PurchaseOrderList = React.lazy(() =>
//   import("./components/PurchaseOrderList")
// );
// const CreatePurchaseOrder = React.lazy(() =>
//   import("./components/CreatePurchaseOrder")
// );
// const PurchaseOrderDetail = React.lazy(() =>
//   import("./components/PurchaseOrderDetail")
// );

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
// const SupplierReceiptList = React.lazy(() =>
//   import("./components/SupplierReceiptList")
// );
// const SupplierReceiptDetail = React.lazy(() =>
//   import("./components/SupplierReceiptDetail")
// );

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const toast = useRef(null);

  const handleLogout = () => {
    localStorageService.clear();
    window.location.href = "/logout";
  };

  const menuItems = [
    { label: "Dashboard", icon: "pi pi-home", to: "/dashboard" },
    {
      label: "Danh sách đơn đặt hàng",
      icon: "pi pi-list",
      to: "/purchase-orders",
    },
    {
      label: "Danh sách phiếu nhập kho",
      icon: "pi pi-file",
      to: "/supplier-receipts",
    },
  ];

  const handleOpenSidebar = () => {
    setSidebarVisible(true);
  };

  const handleCloseSidebar = () => {
    setSidebarVisible(false);
  };

  return (
    <div className="flex flex-column min-h-screen">
      <Toast ref={toast} position="top-right" />
      <Header
        handleOpenSidebar={handleOpenSidebar}
        handleLogout={handleLogout}
      />

      <div className="flex flex-grow-1">
        <SidebarMenu
          sidebarVisible={sidebarVisible}
          handleCloseSidebar={handleCloseSidebar}
          menuItems={menuItems}
        />

        <main className="flex-grow-1 p-3 overflow-auto">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-full">
                <ProgressSpinner />
              </div>
            }
          >
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* <Route path="/purchase-orders" element={<PurchaseOrderList />} />
              <Route path="/create-order" element={<CreatePurchaseOrder />} />
              <Route
                path="/purchase-order/:id"
                element={<PurchaseOrderDetail />}
              />
              <Route
                path="/supplier-receipts"
                element={<SupplierReceiptList />}
              />
              <Route
                path="/supplier-receipt/:id"
                element={<SupplierReceiptDetail />}
              /> */}
            </Routes>
          </Suspense>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
