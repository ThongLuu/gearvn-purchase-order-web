import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";

import { formatCurrency } from "../../utils/utils";

const SupplierReceiptDetail = () => {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const [discount, setDiscount] = useState("10");
  const [showImeiDialog, setShowImeiDialog] = useState(false);
  const [imeiErrors, setImeiErrors] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);

  const showMessage = (severity, summary, detail) => {
    if (toast.current) {
      toast.current.show({
        severity,
        summary,
        detail,
        life: 3000,
      });
    }
  };

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/supplierReceipts/${id}`
      );

      // Group items with the same item_sku
      const groupedItems = response.data.receiptItems.reduce((acc, item) => {
        const imeis = item.imeis ? item.imeis.map((imei) => imei.imei) : [];

        if (!acc[item.item_sku]) {
          acc[item.item_sku] = {
            ...item,
            imei: imeis,
          };
        } else {
          acc[item.item_sku].quantity = (
            parseInt(acc[item.item_sku].quantity) + parseInt(item.quantity)
          ).toString();
          acc[item.item_sku].imei = acc[item.item_sku].imei.concat(imeis);
        }
        return acc;
      }, {});

      // Convert grouped items back to array and remove supplier_receipt_item_id
      const processedItems = Object.values(groupedItems).map(
        ({ supplier_receipt_item_id, imeis, ...item }) => item
      );

      setReceipt({
        ...response.data,
        receiptItems: processedItems,
      });
      setNote(response.data.note || "");
      setDiscount(response.data.discount || "10");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching supplier receipt:", error);
      setError("Failed to load supplier receipt. Please try again.");
      showMessage("error", "Lỗi", "Không thể tải thông tin phiếu nhập kho");
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const handleImeiChange = (itemSku, value) => {
    setReceipt((prevReceipt) => ({
      ...prevReceipt,
      receiptItems: prevReceipt.receiptItems.map((item) =>
        item.item_sku === itemSku ? { ...item, imei: value.split("\n") } : item
      ),
    }));
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const handleDiscountChange = (e) => {
    setDiscount(e.target.value);
  };

  const checkImeiQuantities = () => {
    const errors = receipt.receiptItems
      .filter((item) => {
        const imeiCount = item.imei.filter((imei) => imei.trim() !== "").length;
        return imeiCount !== parseInt(item.quantity);
      })
      .map((item) => ({
        item_name: item.item_name,
        quantity: item.quantity,
        imeiCount: item.imei.filter((imei) => imei.trim() !== "").length,
      }));

    return errors;
  };

  const createInventoryBillInNhanh = async () => {
    const imeiErrors = checkImeiQuantities();
    if (imeiErrors.length > 0) {
      setImeiErrors(imeiErrors);
      setShowImeiDialog(true);
      return;
    }

    try {
      setLoading(true);
      const billData = {
        bill: {
          products: receipt.receiptItems.map((item) => ({
            name: item.item_name,
            available: 1,
            typeId: 4,
            id: item.item_id_nhanh,
            quantity: parseInt(item.quantity),
            damaged: 0,
            price: parseFloat(item.unit_price),
            weight: 500,
            imei: item.imei.join("\n"),
            discount: 0,
            unitId: 0,
            quantityRequired: 0,
          })),
          payment: {
            manualDiscountType: "percent",
            manualDiscount: parseFloat(discount) || 0,
            cash: 0,
            moneyTransfer: 0,
            money: 0,
          },
          data: {
            totalProductDiscount: 0,
            totalQuantity: receipt.receiptItems.reduce(
              (sum, item) => sum + parseInt(item.quantity),
              0
            ),
            totalDamaged: 0,
            totalPrice: receipt.receiptItems.reduce(
              (sum, item) =>
                sum + parseFloat(item.unit_price) * parseInt(item.quantity),
              0
            ),
            totalWeight: receipt.receiptItems.reduce(
              (sum, item) => sum + 500 * parseInt(item.quantity),
              0
            ),
          },
          info: {
            supplierReceiptId: receipt.supplier_receipt_id,
            storeId: 184944,
            depotId: receipt.Store.nhanh_id,
            mode: 5,
            supplierId: receipt.supplier_nhanh_id,
            supplierName: receipt.supplier_name,
            vatType: "percent",
            vatValue: 0,
            description: note,
            finished: 1,
            approved_by: JSON.parse(localStorage.getItem("user")).profile.id,
          },
        },
      };

      // const response = await axios.post(
      //   "${process.env.REACT_APP_API_URL}/api/nhanh/createInventoryBillInNhanh",
      //   billData
      // );

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/supplierReceipts/${billData.bill.info.supplierReceiptId}/status`,
        {
          status: "Approved",
          approved_by: billData.bill.info.approved_by,
          note: billData.bill.info.description,
          discount: billData.bill.payment.manualDiscount,
          products: billData.bill.products.map((product) => ({
            id: product.id,
            imei: product.imei,
            store: receipt.Store.store_id,
          })),
        }
      );

      if (response.data.success) {
        showMessage(
          "success",
          "Thành công",
          "Đã tạo phiếu nhập kho trên Nhanh"
        );
        navigate("/supplier-receipts");
      }
    } catch (error) {
      setLoading(false);
      showMessage(
        "error",
        "Lỗi khi tạo phiếu nhập kho",
        error.response.data.message
      );
    }
  };

  const calculateTotalPrice = (quantity, unitPrice) => {
    const numQuantity = Number(quantity);
    const numUnitPrice = Number(unitPrice);
    if (!isNaN(numQuantity) && !isNaN(numUnitPrice)) {
      return numQuantity * numUnitPrice;
    }
    return 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen">
        <Message severity="error" text={error} />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen">
        <Message severity="info" text="No receipt found." />
      </div>
    );
  }

  const isCompleted =
    receipt.supplier_receipt_status.toLowerCase() === "completed" ||
    receipt.supplier_receipt_status.toLowerCase() === "approved";

  const header = (
    <div className="flex justify-content-between align-items-center flex-wrap">
      <Button
        icon="pi pi-arrow-left"
        onClick={() => navigate("/supplier-receipts")}
        className="p-button-text"
      />
      <h2 className="m-0">Chi tiết phiếu nhập kho</h2>
      <span
        className={`status-badge status-${receipt.supplier_receipt_status.toLowerCase()}`}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          fontWeight: "bold",
          color: "white",
          backgroundColor:
            receipt.supplier_receipt_status.toLowerCase() === "completed"
              ? "#22C55E"
              : "#EAB308",
        }}
      >
        {receipt.supplier_receipt_status}
      </span>
    </div>
  );

  return (
    <div className="card">
      <Toast ref={toast} />
      <div className="p-4">
        <Card header={header}>
          <div className="grid">
            <div className="col-12 md:col-6 lg:col-3">
              <label htmlFor="id">Mã phiếu</label>
              <div id="id" className="font-bold">
                {receipt.supplier_receipt_id}
              </div>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <label htmlFor="supplier">Nhà cung cấp</label>
              <div id="supplier" className="font-bold">
                {receipt.supplier_name}
              </div>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <label htmlFor="store">Cửa hàng</label>
              <div id="store" className="font-bold">
                {receipt.Store.store_name}
              </div>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <label htmlFor="createdAt">Thời gian tạo</label>
              <div id="createdAt" className="font-bold">
                {formatDate(receipt.createdAt)}
              </div>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <label htmlFor="discount">Chiết khấu</label>
              <InputText
                id="discount"
                value={discount}
                onChange={handleDiscountChange}
                className="w-full"
                disabled={isCompleted}
              />
            </div>
            <div className="col-12">
              <label htmlFor="note">Ghi chú</label>
              <InputTextarea
                id="note"
                value={note}
                onChange={handleNoteChange}
                autoResize
                className="w-full"
                disabled={isCompleted}
                style={{ minHeight: "50px" }}
              />
            </div>
          </div>
        </Card>

        <Divider />

        <div className="flex justify-content-between align-items-center">
          <h3 className="mt-4">Danh sách sản phẩm</h3>
          <Button
            label="Tạo phiếu nhập trên Nhanh"
            icon="pi pi-plus"
            onClick={createInventoryBillInNhanh}
            disabled={isCompleted}
          />
        </div>

        <DataTable
          value={receipt.receiptItems}
          className="p-datatable-sm p-datatable-striped"
          responsiveLayout="stack"
          breakpoint="960px"
          dataKey="item_sku"
        >
          <Column field="item_name" header="Tên sản phẩm" />
          <Column field="brand.brand_name" header="Ngành" />
          <Column field="quantity" header="Số lượng" />
          <Column
            field="unit_price"
            header="Giá"
            body={(rowData) => formatCurrency(rowData.unit_price)}
          />
          <Column
            header="Tổng"
            body={(rowData) =>
              formatCurrency(
                calculateTotalPrice(rowData.quantity, rowData.unit_price)
              )
            }
          />
          <Column
            header="IMEI"
            body={(rowData) => (
              <InputTextarea
                value={rowData.imei ? rowData.imei.join("\n") : ""}
                onChange={(e) =>
                  handleImeiChange(rowData.item_sku, e.target.value)
                }
                autoResize
                style={{ width: "100%", minHeight: "50px" }}
                placeholder="Enter IMEIs (one per line)"
                disabled={isCompleted}
              />
            )}
          />
        </DataTable>

        <Dialog
          header="IMEI Quantity Mismatch"
          visible={showImeiDialog}
          style={{ width: "50vw" }}
          onHide={() => setShowImeiDialog(false)}
        >
          <p>
            The following items have IMEI quantities that do not match their
            product quantities:
          </p>
          <ul>
            {imeiErrors.map((error, index) => (
              <li key={index}>
                {error.item_name}: Expected {error.quantity} IMEIs, but found{" "}
                {error.imeiCount}
              </li>
            ))}
          </ul>
          <p>
            Please correct the IMEI quantities before creating the inventory
            bill.
          </p>
        </Dialog>
      </div>
    </div>
  );
};

export default SupplierReceiptDetail;
