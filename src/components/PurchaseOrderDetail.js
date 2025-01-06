import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Button } from "primereact/button";
import { formatCurrency } from "../../utils/utils";

const PurchaseOrderDetail = () => {
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/purchaseOrders/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPurchaseOrder(response.data);
      } catch (error) {
        console.error("Error fetching purchase order:", error);
        setError("Failed to fetch purchase order. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseOrder();
  }, [id]);

  const getStatusSeverity = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "completed":
        return "info";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Message severity="error" text={error} />
      </div>
    );
  }

  if (!purchaseOrder) {
    return <div>Purchase order not found</div>;
  }

  const header = (
    <div className="flex align-items-center justify-content-between">
      <Button
        icon="pi pi-arrow-left"
        onClick={() => navigate("/purchase-orders")}
        className="p-button-text"
      />
      <h2 className="m-0">Chi tiết phiếu đặt hàng</h2>
      <Tag
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          fontWeight: "bold",
          color: "white",
        }}
        value={purchaseOrder.purchaseOrder_status}
        severity={getStatusSeverity(purchaseOrder.purchaseOrder_status)}
      />
    </div>
  );

  return (
    <div className="p-4">
      <Card header={header}>
        <div className="p-fluid grid">
          <div className="col-12 md:col-6">
            <h3>Thông tin phiếu</h3>
            <p>
              <strong>PO ID:</strong> {purchaseOrder.purchaseOrder_id}
            </p>
            <p>
              <strong>Loại:</strong> {purchaseOrder.purchaseOrder_type}
            </p>
            <p>
              <strong>Nhà cung cấp:</strong>{" "}
              {purchaseOrder.supplier_name}
            </p>
            <p>
              <strong>Người tạo:</strong>{" "}
              {purchaseOrder.creator
                ? `${purchaseOrder.creator.user_name}`
                : "N/A"}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {formatDate(purchaseOrder.created_at)}
            </p>
            <p>
              <strong>Ngày cập nhật:</strong>{" "}
              {formatDate(purchaseOrder.update_status_at)}
            </p>

            <p>
              <strong>Ngày nợ:</strong> {purchaseOrder.debt}
            </p>
          </div>
        </div>
        <h3>Danh sách sản phẩm</h3>
        <DataTable
          value={purchaseOrder.products}
          responsiveLayout="scroll"
          className="p-datatable-sm"
        >
          <Column field="po_product_sku" header="SKU" />
          <Column field="brand_name" header="Ngành" />
          <Column field="po_product_name" header="Tên sản phẩm" />
          <Column field="po_product_quantity" header="Số lượng" />
          <Column
            field="Giá"
            header="Unit Price"
            body={(rowData) => formatCurrency(rowData.po_product_price)}
          />
          <Column
            header="Tổng"
            body={(rowData) =>
              formatCurrency(
                rowData.po_product_quantity * rowData.po_product_price
              )
            }
          />
          <Column field="warehouse_name" header="Kho" />
        </DataTable>
        <div className="mt-4">
          <h3>
            Tổng tất cả:{" "}
            {formatCurrency(
              purchaseOrder.products.reduce(
                (total, product) =>
                  total +
                  product.po_product_quantity * product.po_product_price,
                0
              )
            )}
          </h3>
        </div>
      </Card>
    </div>
  );
};

export default PurchaseOrderDetail;
