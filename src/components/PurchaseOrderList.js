import React, { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from "primereact/divider";
import { AutoComplete } from "primereact/autocomplete";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import moment from "moment";
import cryptojs from "crypto-js";
import { formatCurrency } from "../../utils/utils";

const PurchaseOrderList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [displayDetailsDialog, setDisplayDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
  });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [displayProductsDialog, setDisplayProductsDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [actualQuantities, setActualQuantities] = useState({});
  const [selectedProductRows, setSelectedProductRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [inputSupplier, setInputSupplier] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedSupplierData, setSelectedSupplierData] = useState(null);

  const [filters, setFilters] = useState({
    purchaseOrder_type: null,
    supplier_id: null,
    purchaseOrder_status: null,
    dateFrom: null,
    dateTo: null,
    store_id: null,
  });

  const toast = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const showSuccess = useCallback((message) => {
    if (toast.current) {
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: message,
        life: 3000,
      });
    }
  }, []);

  const showError = useCallback((message) => {
    if (toast.current) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 3000,
      });
    }
  }, []);

  const searchSupplier = (event) => {
    const timestamp = moment().format("x");
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const signature =
      cryptojs.HmacSHA256(timestamp + "~" + secretKey, secretKey) + "";

    setTimeout(async () => {
      let _filteredSuppliers;
      if (!event.query.trim().length) {
        _filteredSuppliers = [...suppliers];
      } else {
        const data = {
          request: {
            timestamp: timestamp,
            signature: signature,
          },
          data: {
            mobile: event.query.trim(),
          },
        };

        const suppliersList = await axios.post(
          `/hi-gearvn/tools/api/other/query-supplier`,
          data,
          {
            headers: {
              action: "product.search",
              controller: "nhanhvn",
              client_id: "pos",
              "Content-Type": "application/json",
            },
          }
        );

        _filteredSuppliers = suppliersList.data.data.filter((supplier) => {
          return supplier.mobile.startsWith(event.query);
        });
      }

      const formattedResults = _filteredSuppliers.map((supplier) => ({
        ...supplier,
        nameMobile: `${supplier.name} - ${supplier.mobile}`,
        supplier_id: supplier.idNhanh,
        supplier_name: supplier.name,
      }));

      setFilteredSuppliers(formattedResults);
    }, 250);
  };

  const handleSelect = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      supplier_id: e.value.supplier_id,
    }));
    setSelectedSupplier(e.value.supplier_id);
    setSelectedSupplierData(e.value);
    setInputSupplier(e.value.nameMobile);
  };

  const fetchStores = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/stores`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setStores([{ store_id: null, store_name: "Tất cả" }, ...response.data]);
    } catch (error) {
      console.error("Error fetching stores:", error);
      showError("Failed to fetch stores. Please try again.");
    }
  }, [showError]);

  const fetchPurchaseOrders = useCallback(
    async (
      page = 1,
      limit = 10,
      sortField = null,
      sortOrder = null,
      filters = {}
    ) => {
      try {
        setLoading(true);
        setRefreshing(true);
        const token = localStorage.getItem("token");
        let url = `${process.env.REACT_APP_API_URL}/api/purchaseOrders?page=${page}&limit=${limit}`;
        if (sortField && sortOrder) {
          url += `&sortField=${sortField}&sortOrder=${sortOrder}`;
        }
        Object.keys(filters).forEach((key) => {
          if (filters[key] !== null && filters[key] !== undefined) {
            url += `&${key}=${encodeURIComponent(filters[key])}`;
          }
        });
        const response = await axios.get(url, {
          headers: {
            Authorization: `${token}`,
          },
        });
        setPurchaseOrders(response.data.purchaseOrders);
        setTotalRecords(response.data.totalItems);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showError]
  );

  useEffect(() => {
    const page = (location.state && location.state.page) || 1;
    setLazyParams((prev) => ({ ...prev, page }));
    fetchPurchaseOrders(
      page,
      lazyParams.rows,
      lazyParams.sortField,
      lazyParams.sortOrder,
      filters
    );
    fetchStores();
  }, [
    fetchPurchaseOrders,
    fetchStores,
    location.state,
    filters,
    lazyParams.rows,
    lazyParams.sortField,
    lazyParams.sortOrder,
  ]);

  const onPage = (event) => {
    setLazyParams(event);
  };

  const onFilterChange = (e, name) => {
    const value = e.target.value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));

    if (name === "supplier_id") {
      setSelectedSupplier(value);
      setInputSupplier(null);
    } else if (name === "store_id") {
      setSelectedStore(value);
    } else if (name === "purchaseOrder_status") {
      setSelectedStatus(value);
    }
  };

  const formatDate = (value) => {
    const date = new Date(value);
    return date.toLocaleDateString("en-GB");
  };

  const statusTemplate = (rowData) => {
    const statusMap = {
      pending: { severity: "warning", label: "Pending" },
      approved: { severity: "success", label: "Approved" },
      updated: { severity: "contrast", label: "Updated" },
      completed: { severity: "info", label: "Completed" },
    };
    const status = statusMap[rowData.purchaseOrder_status.toLowerCase()] || {
      severity: "secondary",
      label: rowData.purchaseOrder_status,
    };
    return <Tag value={status.label} severity={status.severity} />;
  };

  const handleApprove = async (order) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Use the new createDocument endpoint
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/purchaseOrders/createDocument`,
        {
          purchaseOrderId: order.purchaseOrder_id,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      await fetchPurchaseOrders(
        lazyParams.page,
        lazyParams.rows,
        lazyParams.sortField,
        lazyParams.sortOrder,
        filters
      );
      setLoading(false);

      showSuccess("Purchase order approved and document created successfully");
    } catch (error) {
      setLoading(false);
      console.error(
        "Error approving purchase order and creating document:",
        error
      );
    }
  };

  const actionTemplate = (rowData) => {
    return (
      <div className="flex justify-center">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-info p-mr-2 transition-colors transition-duration-150"
          onClick={() => handleViewDetails(rowData)}
          tooltip="View Details"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-mr-2 transition-colors transition-duration-150"
          onClick={() => handleDelete(rowData)}
          tooltip="Delete"
          tooltipOptions={{ position: "top" }}
        />
        {rowData.purchaseOrder_status.toLowerCase() === "pending" && (
          <Button
            icon="pi pi-check"
            className="p-button-rounded p-button-warning transition-colors transition-duration-150"
            onClick={() => handleApprove(rowData)}
            tooltip="Approve"
            tooltipOptions={{ position: "top" }}
          />
        )}
      </div>
    );
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDisplayDetailsDialog(true);
  };

  const handleDelete = (order) => {
    confirmDialog({
      message: `Bạn có chắc muốn xóa đơn đặt hàng ${order.purchaseOrder_id}?`,
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => deleteOrder(order.purchaseOrder_id),
    });
  };

  const deleteOrder = async (id) => {
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/purchaseOrders/${id}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      await fetchPurchaseOrders(
        lazyParams.page,
        lazyParams.rows,
        lazyParams.sortField,
        lazyParams.sortOrder,
        filters
      );
      showSuccess("Purchase order deleted successfully");
    } catch (error) {
      console.error("Error deleting purchase order:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleShowSelectedProducts = async () => {
    if (!selectedSupplier || !selectedStore || selectedStatus !== "Updated") {
      showError("Please select a supplier and a store first.");
      return;
    }

    try {
      setLoading(true);
      const purchaseOrderIdsString = selectedOrders
        .map((order) => order.purchaseOrder_id)
        .join(",");
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/products/by-po-status`,
        {
          params: {
            status: selectedStatus || "pending",
            supplier_id: selectedSupplier,
            store_id: selectedStore,
            po_ids: purchaseOrderIdsString,
          },
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      const productsWithQuantity = response.data.map((product) => ({
        ...product,
        product_quantity: product.quantity, // Ensure product_quantity is set
      }));

      setSelectedProducts(productsWithQuantity);

      // Initialize actualQuantities with product_quantity
      const initialActualQuantities = {};
      productsWithQuantity.forEach((product) => {
        initialActualQuantities[product.id] =
          product.product_quantity - product.po_product_actual_quantity;
      });
      setActualQuantities(initialActualQuantities);

      setDisplayProductsDialog(true);
      setLoading(false);
      showSuccess("Products fetched successfully");
    } catch (error) {
      setLoading(false);
      console.error("Error fetching products:", error);
      showError("Failed to fetch products. Please try again.");
    }
  };

  const handleActualQuantityChange = (data, value) => {
    const remainingQuantity =
      data.product_quantity - data.po_product_actual_quantity;
    if (remainingQuantity > value || remainingQuantity == value) {
      setActualQuantities((prev) => ({
        ...prev,
        [data.id]: value,
      }));
    }
  };

  const actualQuantityTemplate = (rowData) => {
    return (
      <InputText
        type="number"
        value={actualQuantities[rowData.id]}
        onChange={(e) => handleActualQuantityChange(rowData, e.target.value)}
        min={0}
      />
    );
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <div className="flex flex-column md:flex-row align-items-center">
        <Button
          label="Tạo mới"
          icon="pi pi-plus"
          className="p-button-success mb-2 md:mb-0 md:mr-2 transition-colors transition-duration-150"
          onClick={() =>
            navigate("/create-order", { state: { page: lazyParams.page } })
          }
        />
        <Button
          label="Danh sách sản phẩm đã chọn"
          icon="pi pi-eye"
          className="p-button-secondary mb-2 md:mb-0 md:mr-2 transition-colors transition-duration-150"
          onClick={handleShowSelectedProducts}
          disabled={
            !selectedSupplier || !selectedStore || selectedStatus != "Updated"
          }
        />
      </div>
    </div>
  );

  const filterTemplate = (
    <div className="grid">
      <div className="col-12 md:col-6 lg:col-4 xl:col-2 mb-2">
        <Dropdown
          value={filters.purchaseOrder_type}
          options={[
            { label: "All", value: null },
            { label: "Normal", value: "Normal" },
            { label: "Campaign", value: "Campaign" },
            { label: "Debt", value: "Debt" },
          ]}
          onChange={(e) => onFilterChange(e, "purchaseOrder_type")}
          placeholder="Chọn loại"
          className="w-full"
        />
      </div>
      <div className="col-12 md:col-6 lg:col-4 xl:col-2 mb-2">
        <AutoComplete
          value={inputSupplier}
          suggestions={filteredSuppliers}
          completeMethod={searchSupplier}
          field="nameMobile"
          onChange={(e) => setInputSupplier(e.value)}
          onSelect={handleSelect}
          placeholder="Chọn NCC"
          className="w-full"
        />
      </div>
      <div className="col-12 md:col-6 lg:col-4 xl:col-2 mb-2">
        <Dropdown
          value={filters.store_id}
          options={stores}
          onChange={(e) => onFilterChange(e, "store_id")}
          optionLabel="store_name"
          optionValue="store_id"
          placeholder="Chọn cửa hàng"
          className="w-full"
        />
      </div>
      <div className="col-12 md:col-6 lg:col-4 xl:col-2 mb-2">
        <Dropdown
          value={filters.purchaseOrder_status}
          options={[
            { label: "All", value: null },
            { label: "Pending", value: "Pending" },
            { label: "Approved", value: "Approved" },
            { label: "Updated", value: "Updated" },
            { label: "Completed", value: "Completed" },
          ]}
          onChange={(e) => onFilterChange(e, "purchaseOrder_status")}
          placeholder="Chọn trạng thái"
          className="w-full"
        />
      </div>
      <div className="col-12 md:col-6 lg:col-4 xl:col-2 mb-2">
        <Calendar
          value={filters.dateFrom}
          onChange={(e) => onFilterChange(e, "dateFrom")}
          placeholder="Từ ngày"
          className="w-full"
        />
      </div>
      <div className="col-12 md:col-6 lg:col-4 xl:col-2 mb-2">
        <Calendar
          value={filters.dateTo}
          onChange={(e) => onFilterChange(e, "dateTo")}
          placeholder="Tới ngày"
          className="w-full"
        />
      </div>
      <div className="col-12 flex justify-content-end">
        <Button
          label="Lọc"
          icon="pi pi-filter"
          onClick={() =>
            fetchPurchaseOrders(
              1,
              lazyParams.rows,
              lazyParams.sortField,
              lazyParams.sortOrder,
              filters
            )
          }
          className="mr-2"
        />
        <Button
          label="Xóa lọc"
          icon="pi pi-filter-slash"
          onClick={() => {
            setFilters({
              purchaseOrder_type: null,
              supplier_id: null,
              purchaseOrder_status: null,
              dateFrom: null,
              dateTo: null,
              store_id: null,
            });
            setSelectedSupplier(null);
            setSelectedStore(null);
            setSelectedStatus(null);
            setSelectedProducts([]);
            setInputSupplier(null);
            setSelectedSupplierData(null);
            fetchPurchaseOrders(
              1,
              lazyParams.rows,
              lazyParams.sortField,
              lazyParams.sortOrder,
              {}
            );
          }}
          className="p-button-outlined"
        />
      </div>
    </div>
  );

  const emptyTemplate = (
    <div className="text-center p-4">
      <i className="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
      <p className="m-0">No purchase orders found. Create your first order!</p>
      <Button
        label="Tạo mới"
        icon="pi pi-plus"
        className="p-button-success mt-4 transition-colors transition-duration-150"
        onClick={() => navigate("/create-order", { state: { page: 1 } })}
      />
    </div>
  );

  const templatePOid = (rowData) => {
    return (
      <Link to={`/purchase-order/${rowData.purchaseOrder_id}`}>
        {rowData.purchaseOrder_id}
      </Link>
    );
  };

  const handleCloseProductsDialog = () => {
    setDisplayProductsDialog(false);
    setSelectedProductRows([]);
  };

  const handleCreateOrder = async () => {
    if (!selectedSupplierData) {
      showError(
        "Supplier information is missing. Please select a supplier first."
      );
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const selectedProductsWithActualQuantity = selectedProductRows.map(
        (product) => ({
          ...product,
          item_name: product.product_name,
          item_sku: product.po_product_sku,
          item_brand: product.po_product_brand,
          unit_price: product.unit_price,
          item_id_nhanh: product.po_product_id_nhanh,
          quantity: parseInt(actualQuantities[product.id]),
        })
      );

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/supplierReceipts`,
        {
          supplier_id: selectedSupplier,
          store_id: selectedStore,
          created_by: `${JSON.parse(localStorage.getItem("user")).profile.id}`,
          supplier_nhanh_id: selectedSupplierData.idNhanh,
          supplier_name: selectedSupplierData.name,
          supplier_phone: selectedSupplierData.mobile,
          products: selectedProductsWithActualQuantity,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      showSuccess("Receipt Supplier created successfully");
      handleCloseProductsDialog();
      // Optionally, you can refresh the purchase orders list here
      await fetchPurchaseOrders(
        lazyParams.page,
        lazyParams.rows,
        lazyParams.sortField,
        lazyParams.sortOrder,
        filters
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error creating ReceiptSupplier:", error);
      showError(
        error.response?.data?.message ||
          "Failed to create ReceiptSupplier. Please try again."
      );
    }
  };

  const footerContent = (
    <div>
      <Button
        label="Đóng"
        icon="pi pi-times"
        onClick={handleCloseProductsDialog}
        className="p-button-text"
      />
      <Button
        label="Tạo"
        icon="pi pi-check"
        onClick={handleCreateOrder}
        disabled={selectedProductRows.length === 0}
        autoFocus
      />
    </div>
  );

  return (
    <div className="p-4 fade-in">
      <Toast ref={toast} />
      <Card className="shadow-lg">
        {filterTemplate}
        {header}
        {loading ? (
          <div
            className="flex justify-center items-center"
            style={{ height: "300px" }}
          >
            <ProgressSpinner />
          </div>
        ) : (
          <DataTable
            value={purchaseOrders}
            lazy
            paginator
            first={lazyParams.first}
            rows={lazyParams.rows}
            totalRecords={totalRecords}
            onPage={onPage}
            onSort={(e) => setLazyParams(e)}
            sortField={lazyParams.sortField}
            sortOrder={lazyParams.sortOrder}
            rowsPerPageOptions={[5, 10, 25, 50]}
            emptyMessage={emptyTemplate}
            className="p-datatable-sm p-datatable-gridlines mt-4 fade-in"
            rowHover
            stripedRows
            responsiveLayout="scroll"
            selection={selectedOrders}
            onSelectionChange={(e) => setSelectedOrders(e.value)}
            dataKey="purchaseOrder_id"
          >
            <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
            <Column header="Mã đơn" body={templatePOid} sortable />
            <Column field="purchaseOrder_type" header="Loại đơn" sortable />
            <Column field="supplier_name" header="Nhà cung cấp" sortable />
            <Column
              field="created_at"
              header="Ngày tạo"
              body={(rowData) => formatDate(rowData.created_at)}
              sortable
            />
            <Column field="debt" header="Debt (Ngày)" sortable />
            <Column
              field="purchaseOrder_status"
              header="Trạng thái"
              body={statusTemplate}
              sortable
            />
            <Column
              body={actionTemplate}
              headerStyle={{ width: "10rem" }}
              bodyStyle={{ textAlign: "center" }}
            />
          </DataTable>
        )}
      </Card>
      <Dialog
        header="Chi tiết đơn đặt hàng"
        visible={displayDetailsDialog}
        onHide={() => setDisplayDetailsDialog(false)}
        breakpoints={{ "960px": "75vw", "640px": "100vw" }}
        style={{ width: "70vw" }}
        modal
        className="p-fluid"
      >
        {selectedOrder && (
          <div className="grid">
            <div className="col-12 md:col-6">
              <h3 className="text-xl font-semibold mb-3">
                Mã đơn: {selectedOrder.purchaseOrder_id}
              </h3>
              <p>
                <strong>Loại:</strong> {selectedOrder.purchaseOrder_type}
              </p>
              <p>
                <strong>Nhà cung cấp:</strong> {selectedOrder.supplier_name}
              </p>
            </div>
            <div className="col-12 md:col-6">
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {formatDate(selectedOrder.created_at)}
              </p>
              <p>
                <strong>Ngày nợ:</strong> {selectedOrder.debt}
              </p>
              <p>
                <strong>Trạng thái:</strong> {statusTemplate(selectedOrder)}
              </p>
            </div>
            <Divider align="center" type="dashed">
              <span className="p-tag">Danh sách sản phẩm</span>
            </Divider>
            <div className="col-12">
              <DataTable
                value={selectedOrder.products}
                responsiveLayout="scroll"
                className="p-datatable-sm"
              >
                <Column field="po_product_sku" header="SKU" />
                <Column field="brand_name" header="Ngành" />
                <Column field="po_product_name" header="Tên sản phẩm" />
                <Column field="po_product_quantity" header="Số lượng" />
                <Column
                  field="po_product_price"
                  header="Giá"
                  body={(rowData) => formatCurrency(rowData.po_product_price)}
                />
                <Column field="warehouse_name" header="Kho" />
              </DataTable>
            </div>
          </div>
        )}
      </Dialog>
      <Dialog
        header="Danh sách sản phẩm đã chọn"
        visible={displayProductsDialog}
        onHide={handleCloseProductsDialog}
        breakpoints={{ "960px": "75vw", "640px": "100vw" }}
        style={{ width: "70vw" }}
        modal
        className="p-fluid"
        footer={footerContent}
      >
        <DataTable
          value={selectedProducts}
          responsiveLayout="scroll"
          className="p-datatable-sm"
          selection={selectedProductRows}
          onSelectionChange={(e) => setSelectedProductRows(e.value)}
          dataKey="id"
          selectionMode="multiple"
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column field="purchaseOrder_id" header="Mã đơn đặt hàng" />
          <Column field="product_name" header="Tên sản phẩm" />
          <Column field="po_product_sku" header="SKU" />
          <Column field="brand_name" header="Ngành" />
          <Column field="quantity" header="Số lượng" />
          <Column
            field="po_product_actual_quantity"
            header="Số lượng thực tế"
            body={(rowData) => rowData.po_product_actual_quantity || 0}
          />
          <Column header="Số lượng nhập" body={actualQuantityTemplate} />
        </DataTable>
      </Dialog>
      <ConfirmDialog />
      {deleteLoading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <ProgressSpinner />
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;
