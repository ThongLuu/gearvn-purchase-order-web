import React, { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { AutoComplete } from "primereact/autocomplete";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import moment from "moment";
import cryptojs from "crypto-js";
import { formatCurrency } from "../../utils/utils";

const SupplierReceiptList = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
  });
  const [expandedRows, setExpandedRows] = useState(null);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [inputSupplier, setInputSupplier] = useState(null);

  const [filters, setFilters] = useState({
    supplier_nhanh_id: null,
    store_id: null,
    status: null,
  });

  const [stores, setStores] = useState([]);

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Completed", value: "completed" },
  ];

  const toast = useRef(null);
  const navigate = useNavigate();

  const showError = useCallback((message) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 3000,
    });
  }, []);

  const searchSupplier = (event) => {
    const timestamp = moment().format("x");
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const signature =
      cryptojs.HmacSHA256(timestamp + "~" + secretKey, secretKey) + "";

    setTimeout(async () => {
      let _filteredSuppliers;
      if (!event.query.trim().length) {
        _filteredSuppliers = [];
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
        supplier_nhanh_id: supplier.idNhanh,
        supplier_name: supplier.name,
        supplier_phone: supplier.mobile,
      }));

      setFilteredSuppliers(formattedResults);
    }, 250);
  };

  const handleSelect = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      supplier_nhanh_id: e.value.supplier_nhanh_id,
    }));
    setInputSupplier(e.value.nameMobile);
  };

  const fetchReceipts = useCallback(
    async (
      page = 1,
      limit = 10,
      sortField = null,
      sortOrder = null,
      filters = {}
    ) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        let url = `${process.env.REACT_APP_API_URL}/api/supplierReceipts?page=${page}&limit=${limit}`;
        if (sortField && sortOrder) {
          url += `&sortField=${sortField}&sortOrder=${sortOrder}`;
        }
        Object.keys(filters).forEach((key) => {
          if (filters[key]) {
            url += `&${key}=${encodeURIComponent(filters[key])}`;
          }
        });
        const response = await axios.get(url, {
          headers: {
            Authorization: `${token}`,
          },
        });
        setReceipts(response.data.supplierReceipts);
        setTotalRecords(response.data.totalItems);
      } catch (error) {
        console.error("Error fetching supplier receipts:", error);
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

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

  useEffect(() => {
    fetchReceipts(
      lazyParams.page,
      lazyParams.rows,
      lazyParams.sortField,
      lazyParams.sortOrder,
      filters
    );
    fetchStores();
  }, [fetchReceipts, fetchStores, lazyParams, filters]);

  const onPage = (event) => {
    setLazyParams(event);
  };

  const onFilterChange = (e, name) => {
    const value = e.target.value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const formatDate = (value) => {
    const date = new Date(value);
    return date.toLocaleDateString("en-GB");
  };

  const statusTemplate = (rowData) => {
    const statusMap = {
      pending: { severity: "warning", label: "Pending" },
      approved: { severity: "success", label: "Approved" },
      rejected: { severity: "danger", label: "Rejected" },
      completed: { severity: "info", label: "Completed" },
    };
    const status = statusMap[rowData.supplier_receipt_status.toLowerCase()] || {
      severity: "secondary",
      label: rowData.supplier_receipt_status,
    };
    return <Tag value={status.label} severity={status.severity} />;
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h2 className="text-2xl font-semibold m-0 mb-2 md:mb-0">Danh sách phiếu nhập</h2>
    </div>
  );

  const filterTemplate = (
    <div className="grid">
      <div className="col-12 md:col-6 lg:col-4 xl:col-3 mb-2">
        <AutoComplete
          value={inputSupplier}
          suggestions={filteredSuppliers}
          completeMethod={searchSupplier}
          field="nameMobile"
          onChange={(e) => setInputSupplier(e.value)}
          onSelect={handleSelect}
          placeholder="Chọn nhà cung cấp"
          className="w-full"
        />
      </div>
      <div className="col-12 md:col-6 lg:col-4 xl:col-3 mb-2">
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
      <div className="col-12 md:col-6 lg:col-4 xl:col-3 mb-2">
        <Dropdown
          value={filters.status}
          options={statusOptions}
          onChange={(e) => onFilterChange(e, "status")}
          placeholder="Chọn trạng thái"
          className="w-full"
        />
      </div>
      <div className="col-12 flex justify-content-end">
        <Button
          label="Lọc"
          icon="pi pi-filter"
          onClick={() =>
            fetchReceipts(
              1,
              lazyParams.rows,
              lazyParams.sortField,
              lazyParams.sortOrder,
              filters
            )
          }
          className="mr-2 transition-colors transition-duration-150"
        />
        <Button
          label="Xóa lọc"
          icon="pi pi-filter-slash"
          onClick={() => {
            setFilters({});
            setInputSupplier(null);
            fetchReceipts(
              1,
              lazyParams.rows,
              lazyParams.sortField,
              lazyParams.sortOrder,
              {}
            );
          }}
          className="p-button-outlined transition-colors transition-duration-150"
        />
      </div>
    </div>
  );

  const emptyTemplate = (
    <div className="text-center p-4">
      <i className="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
      <p className="m-0">No supplier receipts found.</p>
    </div>
  );

  const templateReceiptId = (rowData) => {
    return (
      <Link to={`/supplier-receipt/${rowData.supplier_receipt_id}`}>
        {rowData.supplier_receipt_id}
      </Link>
    );
  };

  const expandedRowTemplate = (data) => {
    return (
      <div className="p-3">
        <DataTable 
          value={data.receiptItems} 
          responsiveLayout="scroll"
          className="p-datatable-sm"
        >
          <Column field="item_name" header="Tên sản phẩm" />
          <Column field="item_sku" header="SKU" />
          <Column field="item_brand" header="Ngành" />
          <Column field="quantity" header="Số lượng" />
          <Column
            field="unit_price"
            header="Giá"
            body={(rowData) => formatCurrency(rowData.unit_price)}
          />
        </DataTable>
      </div>
    );
  };

  const allowExpansion = (rowData) => {
    return rowData.receiptItems && rowData.receiptItems.length > 0;
  };

  return (
    <div className="p-4 fade-in">
      <Toast ref={toast} />
      <Card className="shadow-lg">
        {header}
        {filterTemplate}
        {loading ? (
          <div
            className="flex justify-center items-center"
            style={{ height: "300px" }}
          >
            <ProgressSpinner />
          </div>
        ) : (
          <DataTable
            value={receipts}
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
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={expandedRowTemplate}
          >
            <Column expander={allowExpansion} style={{ width: "3em" }} />
            <Column
              header="Mã phiếu"
              body={templateReceiptId}
              sortable
              field="supplier_receipt_id"
            />
            <Column field="supplier_name" header="Nhà cung cấp" sortable />
            <Column field="Store.store_name" header="Cửa hàng" sortable />
            <Column
              field="supplier_receipt_status"
              header="Trạng thái"
              body={statusTemplate}
              sortable
            />
            <Column
              header="Thời gian tạo"
              sortable
              body={(rowData) => formatDate(rowData.createdAt)}
            />
          </DataTable>
        )}
      </Card>
    </div>
  );
};

export default SupplierReceiptList;
