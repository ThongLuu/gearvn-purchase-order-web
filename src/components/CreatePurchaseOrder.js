import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { AutoComplete } from "primereact/autocomplete";
import axios from "axios";

import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import moment from "moment";
import cryptojs from "crypto-js";

const CreatePurchaseOrder = () => {
  const token = JSON.parse(localStorage.getItem("token")).token;

  const [formData, setFormData] = useState({
    purchaseOrder_type: "",
    supplier_nhanh_id: "",
    products: [],
    debt: 0,
    po_excel_string: "",
    message_to_supplier: "",
    created_by: `${JSON.parse(localStorage.getItem("user")).profile.id}`,
  });
  const [suppliers, setSuppliers] = useState([]);
  const [inputSupplier, setInputSupplier] = useState(null);
  const [brands, setBrands] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [sheetUrl, setSheetUrl] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  const warehouseMapping = {
    1: "KHO HUB - Hàng nợ",
    2: "KHO HUB - Hàng thường",
    3: "KHO HUB - Hàng deal",
    4: "Hoàng Hoa Thám - Hàng nợ",
    5: "Hoàng Hoa Thám - Hàng thường",
    6: "Hoàng Hoa Thám - Hàng deal",
    7: "Trần Hưng Đạo - Hàng nợ",
    8: "Trần Hưng Đạo - Hàng thường",
    9: "Trần Hưng Đạo - Hàng deal",
    10: "Kha Vạn Cân - Hàng nợ",
    11: "Kha Vạn Cân - Hàng thường",
    12: "Kha Vạn Cân - Hàng deal",
    13: "Thái Hà - Hàng nợ",
    14: "Thái Hà - Hàng thường",
    15: "Thái Hà - Hàng deal",
  };

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsResponse, warehousesResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/brands`, {
            headers: { Authorization: "BEARER " + token },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/warehouses`, {
            headers: { Authorization: "BEARER " + token },
          }),
        ]);
        setBrands(
          brandsResponse.data.map((brand) => ({
            label: brand.brand_name,
            value: brand.brand_id,
          }))
        );
        setWarehouses(
          warehousesResponse.data.map((warehouse) => ({
            label: warehouse.warehouse_name,
            value: warehouse.warehouse_id,
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    if (location.state && location.state.order) {
      const { order } = location.state;
      setFormData({
        purchaseOrder_type: order.purchaseOrder_type,
        supplier_nhanh_id: order.supplier_nhanh_id,
        products: order.PO_Products.map((item) => ({
          po_product_sku: item.po_product_sku,
          po_product_brand: item.po_product_brand,
          po_product_name: item.po_product_name,
          po_product_quantity: parseInt(item.po_product_quantity, 10),
          po_product_price: parseFloat(item.po_product_price),
          po_product_warehouse: item.po_product_warehouse,
        })),
        debt: order.debt,
        po_excel_string: order.po_excel_string || "",
        message_to_supplier: order.message_to_supplier || "",
      });
    }
  }, [location]);

  useEffect(() => {
    const getDataFromParam = async () => {
      const queryParams = new URLSearchParams(location.search);
      const sheetData = queryParams.get("data");

      if (sheetData) {
        const data = JSON.parse(sheetData);

        const objectsArray = data.slice(2).map((row) => {
          return {
            nganh: row[0],
            sku: row[1],
            tenSanPham: row[2],
            giaNhap: parseFloat(row[3]) || 0,
            kho: [
              { warehouse: "KHO HUB - Hàng nợ", quantity: row[4] },
              { warehouse: "KHO HUB - Hàng thường", quantity: row[5] },
              { warehouse: "KHO HUB - Hàng deal", quantity: row[6] },
              { warehouse: "Hoàng Hoa Thám - Hàng nợ", quantity: row[7] },
              { warehouse: "Hoàng Hoa Thám - Hàng thường", quantity: row[8] },
              { warehouse: "Hoàng Hoa Thám - Hàng deal", quantity: row[9] },
              { warehouse: "Trần Hưng Đạo - Hàng nợ", quantity: row[10] },
              { warehouse: "Trần Hưng Đạo - Hàng thường", quantity: row[11] },
              { warehouse: "Trần Hưng Đạo - Hàng deal", quantity: row[12] },
              { warehouse: "Kha Vạn Cân - Hàng nợ", quantity: row[13] },
              { warehouse: "Kha Vạn Cân - Hàng thường", quantity: row[14] },
              { warehouse: "Kha Vạn Cân - Hàng deal", quantity: row[15] },
              { warehouse: "Thái Hà - Hàng nợ", quantity: row[16] },
              { warehouse: "Thái Hà - Hàng thường", quantity: row[17] },
              { warehouse: "Thái Hà - Hàng deal", quantity: row[18] },
            ],
            tongNhap: parseInt(row[19], 10) || 0,
            tongTien: parseFloat(row[20]) || 0,
          };
        });
        await checkProductExist(objectsArray);
      }
    };
    getDataFromParam();
  }, [brands, warehouses]);

  const showSuccess = (message) => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: message,
      life: 3000,
    });
  };

  const showError = (message) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 3000,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "supplier_nhanh_id") {
      setInputSupplier(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelect = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      supplier_nhanh_id: e.value.idNhanh,
      supplier_name: e.value.name,
      supplier_phone: e.value.mobile,
      debt: 0,
    }));
    setInputSupplier(e.value.nameMobile);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    if (field === "po_product_quantity") {
      value = parseInt(value, 10) || 0;
    } else if (field === "po_product_price") {
      value = parseFloat(value) || 0;
    }
    updatedProducts[index][field] = value;
    setFormData({ ...formData, products: updatedProducts });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          po_product_sku: "",
          po_product_brand: "",
          po_product_name: "",
          po_product_quantity: 0,
          po_product_price: 0,
          po_product_warehouse: "",
        },
      ],
    });
  };

  const removeProduct = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updatedProducts });
  };

  const validateForm = () => {
    if (!formData.purchaseOrder_type || !formData.supplier_nhanh_id) {
      showError("Please fill in all required fields.");
      return false;
    }
    if (
      formData.products.some(
        (product) =>
          !product.po_product_sku ||
          !product.po_product_brand ||
          !product.po_product_name ||
          product.po_product_quantity === 0 ||
          product.po_product_price === 0 ||
          !product.po_product_warehouse
      )
    ) {
      showError("Please fill in all product details with valid values.");
      return false;
    }
    return true;
  };

  const groupProductsBySku = (products) => {
    return products.reduce((acc, product) => {
      const {
        po_product_sku,
        po_product_name,
        po_product_price,
        po_product_brand,
        po_product_warehouse,
        po_product_quantity,
      } = product;
      if (!Array.isArray(acc)) acc = [];

      let skuGroup = acc.find((item) => item.po_product_sku === po_product_sku);

      if (!skuGroup) {
        skuGroup = {
          po_product_sku,
          po_product_name,
          po_product_price,
          po_product_brand,
          warehouses: [],
        };
        acc.push(skuGroup);
      }
      skuGroup.warehouses.push({
        warehouse: po_product_warehouse,
        quantity: po_product_quantity,
      });

      return acc;
    }, []); // Đảm bảo acc bắt đầu là một mảng rỗng
  };

  const parseProductToExcelRow = (product) => {
    const {
      po_product_sku,
      po_product_name,
      po_product_price,
      warehouses,
      po_product_brand,
    } = product;

    const columns = {
      "KHO HUB - Hàng nợ": "-",
      "KHO HUB - Hàng thường": "-",
      "KHO HUB - Hàng deal": "-",
      "Hoàng Hoa Thám - Hàng nợ": "-",
      "Hoàng Hoa Thám - Hàng thường": "-",
      "Hoàng Hoa Thám - Hàng deal": "-",
      "Trần Hưng Đạo - Hàng nợ": "-",
      "Trần Hưng Đạo - Hàng thường": "-",
      "Trần Hưng Đạo - Hàng deal": "-",
      "Kha Vạn Cân - Hàng nợ": "-",
      "Kha Vạn Cân - Hàng thường": "-",
      "Kha Vạn Cân - Hàng deal": "-",
      "Thái Hà - Hàng nợ": "-",
      "Thái Hà - Hàng thường": "-",
      "Thái Hà - Hàng deal": "-",
    };

    let totalQuantity = 0;
    let totalPrice = 0;

    warehouses.forEach((wh) => {
      const warehouseName = warehouseMapping[wh.warehouse];
      if (warehouseName) {
        columns[warehouseName] = wh.quantity;
      }
      totalQuantity += Number(wh.quantity);
      totalPrice += Number(wh.quantity) * Number(po_product_price);
    });

    // Tổng tiền chuyển đổi sang định dạng có dấu phẩy
    const totalPriceFormatted = totalPrice.toLocaleString("vi-VN");

    // Kết quả chuỗi
    return `${
      brands.filter((b) => b.value === po_product_brand)[0].label
    }\t${po_product_sku}\t${po_product_name}\t${po_product_price}\t${
      columns["KHO HUB - Hàng nợ"]
    }\t${columns["KHO HUB - Hàng thường"]}\t${
      columns["KHO HUB - Hàng deal"]
    }\t${columns["Hoàng Hoa Thám - Hàng nợ"]}\t${
      columns["Hoàng Hoa Thám - Hàng thường"]
    }\t${columns["Hoàng Hoa Thám - Hàng deal"]}\t${
      columns["Trần Hưng Đạo - Hàng nợ"]
    }\t${columns["Trần Hưng Đạo - Hàng thường"]}\t${
      columns["Trần Hưng Đạo - Hàng deal"]
    }\t${columns["Kha Vạn Cân - Hàng nợ"]}\t${
      columns["Kha Vạn Cân - Hàng thường"]
    }\t${columns["Kha Vạn Cân - Hàng deal"]}\t${
      columns["Thái Hà - Hàng nợ"]
    }\t${columns["Thái Hà - Hàng thường"]}\t${
      columns["Thái Hà - Hàng deal"]
    }\t${totalQuantity}\t${totalPriceFormatted}`;
  };

  const parseFormProductsToExcel = (products) => {
    const excelRows = products.map(parseProductToExcelRow);
    const header = `Ngành\tSKU\tTên Sản Phẩm\tGiá nhập\tKHO HUB - Hàng nợ\tKHO HUB - Hàng thường\tKHO HUB - Hàng deal\tHoàng Hoa Thám - Hàng nợ\tHoàng Hoa Thám - Hàng thường\tHoàng Hoa Thám - Hàng deal\tTrần Hưng Đạo - Hàng nợ\tTrần Hưng Đạo - Hàng thường\tTrần Hưng Đạo - Hàng deal\tKha Vạn Cân - Hàng nợ\tKha Vạn Cân - Hàng thường\tKha Vạn Cân - Hàng deal\tThái Hà - Hàng nợ\tThái Hà - Hàng thường\tThái Hà - Hàng deal\tTổng nhập\tTổng tiền`;

    const result = [header, ...excelRows].join("\n");
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const newProducts = groupProductsBySku(formData.products);
      formData.po_excel_string = parseFormProductsToExcel(newProducts);

      // Make API call to create purchase order
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/purchaseOrders`,
        formData,
        {
          headers: { Authorization: "BEARER " + token },
        }
      );

      if (response.status === 201) {
        showSuccess(
          location.state && location.state.order
            ? "Purchase order updated successfully!"
            : "Purchase order created successfully!"
        );
        const page =
          location.state && location.state.page ? location.state.page : 1;
        navigate("/purchase-orders", { state: { page } });
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting purchase order:", error);
    }
  };

  const searchProducts = async (event) => {
    try {
      const data = await axios.get(
        `${
          process.env.REACT_APP_API_URL
        }/api/productSearch?query=${encodeURIComponent(event.query)}`,
        {
          headers: { Authorization: "BEARER " + token },
        }
      );

      const response = await axios.get(
        `/v1/product/list/v2?page_index=1&page_size=1&sku=${data.data.data[0].sku}`,
        {
          headers: {
            Authorization: "BEARER " + token,
            "Content-Type": "application/json; charset=utf-8",
            Action: "getListProductV2",
            Controller: "product",
          },
        }
      );

      setProductSuggestions(response.data.data.data || []);
    } catch (error) {
      console.error("Error fetching product suggestions:", error);
    }
  };

  const convertExcelStringToProducts = async (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const pastedData = clipboardData.getData("Text");
    const lines = pastedData.split("\n").filter((row) => row.trim() !== "");
    await getProductsFromExcel(lines);
  };

  const getProductsFromExcel = async (lines) => {
    const parsedData = lines.slice(2).map((row) => {
      const columns = row.split("\t");
      return {
        nganh: columns[0],
        sku: columns[1],
        tenSanPham: columns[2],
        giaNhap: parseFloat(columns[3]) || 0,
        kho: [
          { warehouse: "KHO HUB - Hàng nợ", quantity: columns[4] },
          { warehouse: "KHO HUB - Hàng thường", quantity: columns[5] },
          { warehouse: "KHO HUB - Hàng deal", quantity: columns[6] },
          { warehouse: "Hoàng Hoa Thám - Hàng nợ", quantity: columns[7] },
          { warehouse: "Hoàng Hoa Thám - Hàng thường", quantity: columns[8] },
          { warehouse: "Hoàng Hoa Thám - Hàng deal", quantity: columns[9] },
          { warehouse: "Trần Hưng Đạo - Hàng nợ", quantity: columns[10] },
          { warehouse: "Trần Hưng Đạo - Hàng thường", quantity: columns[11] },
          { warehouse: "Trần Hưng Đạo - Hàng deal", quantity: columns[12] },
          { warehouse: "Kha Vạn Cân - Hàng nợ", quantity: columns[13] },
          { warehouse: "Kha Vạn Cân - Hàng thường", quantity: columns[14] },
          { warehouse: "Kha Vạn Cân - Hàng deal", quantity: columns[15] },
          { warehouse: "Thái Hà - Hàng nợ", quantity: columns[16] },
          { warehouse: "Thái Hà - Hàng thường", quantity: columns[17] },
          { warehouse: "Thái Hà - Hàng deal", quantity: columns[18] },
        ],
        tongNhap: parseInt(columns[19], 10) || 0,
        tongTien: parseFloat(columns[20]) || 0,
      };
    });

    await checkProductExist(parsedData);
  };

  const checkProductExist = async (parsedData) => {
    const newProducts = [];
    const notFoundProducts = [];

    for (const p of parsedData) {
      try {
        const data = await axios.get(
          `${
            process.env.REACT_APP_API_URL
          }/api/productSearch?query=${encodeURIComponent(p.sku)}`,
          {
            headers: { Authorization: "BEARER " + token },
          }
        );

        const response = await axios.get(
          `/v1/product/list/v2?page_index=1&page_size=1&sku=${data.data.data[0].sku}`,
          {
            headers: {
              Authorization: "BEARER " + token,
              "Content-Type": "application/json; charset=utf-8",
              Action: "getListProductV2",
              Controller: "product",
            },
          }
        );

        const productExists =
          response.data.data.data && response.data.data.data.length > 0;

        if (productExists) {
          for (const k of p.kho) {
            if (k.quantity > 0 || k.quantity !== "-") {
              newProducts.push({
                po_product_sku: p.sku,
                po_product_brand: brands.filter((b) => b.label === p.nganh)[0]
                  .value,
                po_product_name: p.tenSanPham,
                po_product_price: parseFloat(Number(p.giaNhap)),
                po_product_warehouse: warehouses.filter(
                  (w) => w.label === k.warehouse
                )[0].value,
                po_product_quantity: k.quantity,
                po_product_id_nhanh: "1",
                // po_product_id_nhanh: response.data.data.data[0].product_id_nhanh
              });
            }
          }
        } else {
          notFoundProducts.push(p.sku);
        }
      } catch (error) {
        console.error(
          `Error checking product existence for SKU ${p.sku}:`,
          error
        );
        notFoundProducts.push(p.sku);
      }
    }

    if (notFoundProducts.length > 0) {
      showError(
        `The following products were not found: ${notFoundProducts.join(", ")}`
      );
    } else {
      setFormData({
        ...formData,
        products: newProducts,
      });
      showSuccess("Excel data converted to products successfully!");
    }
  };

  const calculateQuantity = (no, thuong, deal) =>
    Number(isNaN(no) ? 0 : no) +
    Number(isNaN(thuong) ? 0 : thuong) +
    Number(isNaN(deal) ? 0 : deal);

  const mappingExportData = () => {
    const newProducts = groupProductsBySku(formData.products);
    const excel_string = parseFormProductsToExcel(newProducts);

    const lines = excel_string.split("\n").filter((row) => row.trim() !== "");
    const parsedData = lines.slice(1).map((row) => {
      const columns = row.split("\t");
      return {
        Ngành: columns[0],
        SKU: columns[1],
        "Tên sản phẩm": columns[2],
        "Giá Nhập": parseFloat(columns[3]) || 0,
        "Kho Hub": calculateQuantity(columns[4], columns[5], columns[6]),
        "Kho Hoàng Hoa Thám": calculateQuantity(
          columns[7],
          columns[8],
          columns[9]
        ),
        "Kho Trần Hưng Đạo": calculateQuantity(
          columns[10],
          columns[11],
          columns[12]
        ),
        "Kho Kha Vạn Cân": calculateQuantity(
          columns[13],
          columns[14],
          columns[15]
        ),
        "Kho Thái Hà": calculateQuantity(columns[16], columns[17], columns[18]),
        "Tổng nhập": columns[19],
        "Tổng tiền": columns[20],
      };
    });

    return parsedData;
  };

  const exportToPDF = () => {
    const exportedFileName = fileName || "pteenncc_ntm.pdf";
    const data = mappingExportData();

    const docDefinition = {
      content: [
        {
          text: "Danh sách sản phẩm",
          style: "header",
        },
        {
          style: "tableExample",
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*"],
            body: [
              [
                "Ngành",
                "SKU",
                "Tên sản phẩm",
                "Giá Nhập",
                "Kho Hub",
                "Kho Hoàng Hoa Thám",
                "Kho Trần Hưng Đạo",
                "Kho Kha Vạn Cân",
                "Kho Thái Hà",
                "Tổng nhập",
                "Tổng tiền",
              ],
              ...data.map((item) => [
                item["Ngành"],
                item["SKU"],
                item["Tên sản phẩm"],
                item["Giá Nhập"],
                item["Kho Hub"],
                item["Kho Hoàng Hoa Thám"],
                item["Kho Trần Hưng Đạo"],
                item["Kho Kha Vạn Cân"],
                item["Kho Thái Hà"],
                item["Tổng nhập"],
                item["Tổng tiền"],
              ]),
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
      },
      defaultStyle: {
        fontSize: 6,
      },
      pageOrientation: "landscape",
      pageMargins: [20, 40, 20, 40],
    };

    pdfMake.createPdf(docDefinition).download(exportedFileName + ".pdf");
  };

  const exportToExcel = () => {
    const exportedFileName = fileName || "table.xlsx";
    const data = mappingExportData();

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "PurchaseOrders");

    XLSX.writeFile(wb, exportedFileName + ".xlsx");
  };

  const exportToImage = () => {
    const exportedFileName = fileName || "table.png";
    const dataTable = document.getElementById("dataTable");

    html2canvas(dataTable)
      .then((canvas) => {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = exportedFileName + ".png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Error exporting image:", err);
      });
  };

  const handleParseProductListPreview = () => {
    const newProducts = groupProductsBySku(formData.products);
    const excel_string = parseFormProductsToExcel(newProducts);
    const dataRows = excel_string.trim().split("\n").filter(Boolean);

    const parsedData = dataRows.map((row) =>
      row.split("\t").map((cell) => cell.trim())
    );

    setHeaders(parsedData[0] || []);
    setRows(parsedData.slice(1));
  };

  const handleImport = () => {
    if (sheetUrl.length > 0) {
      window.location.href = `${
        process.env.REACT_APP_API_URL
      }/auth/google?sheetUrl=${encodeURIComponent(sheetUrl)}`;
    }
  };

  const headerGroup = (
    <ColumnGroup>
      <Row>
        <Column header="Ngành" rowSpan={2} />
        <Column header="SKU" rowSpan={2} />
        <Column header="Tên Sản Phẩm" rowSpan={2} />
        <Column header="Giá nhập" rowSpan={2} />
        {/* <Column header="KHO" colSpan={15} /> */}
        <Column header="HUB" colSpan={3} />
        <Column header="Hoàng Hoa Thám" colSpan={3} />
        <Column header="Trần Hưng Đạo" colSpan={3} />
        <Column header="Kha Vạn Cân" colSpan={3} />
        <Column header="Thái Hà" colSpan={3} />
        <Column header="Tổng nhập" rowSpan={2} />
        <Column header="Tổng tiền" rowSpan={2} />
      </Row>
      <Row>
        <Column header="Hàng nợ" />
        <Column header="Hàng thường" />
        <Column header="Hàng deal" />
        <Column header="Hàng nợ" />
        <Column header="Hàng thường" />
        <Column header="Hàng deal" />
        <Column header="Hàng nợ" />
        <Column header="Hàng thường" />
        <Column header="Hàng deal" />
        <Column header="Hàng nợ" />
        <Column header="Hàng thường" />
        <Column header="Hàng deal" />
        <Column header="Hàng nợ" />
        <Column header="Hàng thường" />
        <Column header="Hàng deal" />
      </Row>
    </ColumnGroup>
  );

  const renderProductInput = (rowData, field) => {
    if (field === "po_product_sku") {
      return (
        <AutoComplete
          value={rowData[field]}
          suggestions={productSuggestions}
          completeMethod={searchProducts}
          field="sku"
          itemTemplate={(item) => (
            <div>
              <div>
                {item.product_sku} - {item.product_name}
              </div>
              <small>{item.brand_name}</small>
            </div>
          )}
          onChange={(e) =>
            handleProductChange(
              formData.products.indexOf(rowData),
              field,
              e.value
            )
          }
          onSelect={(e) => {
            const index = formData.products.indexOf(rowData);
            handleProductChange(index, "po_product_sku", e.value.product_sku);
            handleProductChange(index, "po_product_name", e.value.product_name);
            handleProductChange(
              index,
              "po_product_brand",
              e.value.product_brand_id
            );
            handleProductChange(
              index,
              "po_product_price",
              e.value.product_price
            );
          }}
        />
      );
    } else if (field === "po_product_brand") {
      return (
        <Dropdown
          value={rowData[field]}
          options={brands}
          onChange={(e) =>
            handleProductChange(
              formData.products.indexOf(rowData),
              field,
              e.value
            )
          }
          placeholder="Select Brand"
        />
      );
    } else if (field === "po_product_warehouse") {
      return (
        <Dropdown
          value={rowData[field]}
          options={warehouses}
          onChange={(e) =>
            handleProductChange(
              formData.products.indexOf(rowData),
              field,
              e.value
            )
          }
          placeholder="Select Warehouse"
        />
      );
    } else if (
      field === "po_product_quantity" ||
      field === "po_product_price"
    ) {
      return (
        <InputText
          value={rowData[field]}
          onChange={(e) =>
            handleProductChange(
              formData.products.indexOf(rowData),
              field,
              e.target.value
            )
          }
          keyfilter="pnum"
        />
      );
    }
    return (
      <InputText
        value={rowData[field]}
        onChange={(e) =>
          handleProductChange(
            formData.products.indexOf(rowData),
            field,
            e.target.value
          )
        }
      />
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-text"
        onClick={() => removeProduct(formData.products.indexOf(rowData))}
      />
    );
  };

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
      }));

      setFilteredSuppliers(formattedResults);
    }, 250);
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="mb-4">
        <Button
          icon="pi pi-arrow-left"
          className="p-button-text"
          onClick={() =>
            navigate("/purchase-orders", {
              state: { page: (location.state && location.state.page) || 1 },
            })
          }
        />
      </div>
      <Card
        title={
          location.state && location.state.order
            ? "Cập nhật đơn đặt hàng"
            : "Tạo mới đơn đặt hàng"
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="p-fluid">
            <div className="grid">
              <div className="col-4 field">
                <label htmlFor="purchaseOrder_type">Loại đơn đặt hàng</label>
                <Dropdown
                  id="purchaseOrder_type"
                  name="purchaseOrder_type"
                  value={formData.purchaseOrder_type}
                  options={[
                    { label: "Normal", value: "Normal" },
                    { label: "Campaign", value: "Campaign" },
                    { label: "Debt", value: "Debt" },
                  ]}
                  onChange={handleInputChange}
                  placeholder="Chọn loại"
                />
              </div>
              <div className="col-4 field">
                <label htmlFor="supplier_nhanh_id">Nhà cung cấp</label>
                <AutoComplete
                  id="supplier_nhanh_id"
                  name="supplier_nhanh_id"
                  value={inputSupplier}
                  suggestions={filteredSuppliers}
                  completeMethod={searchSupplier}
                  field="nameMobile"
                  onChange={handleInputChange}
                  onSelect={handleSelect}
                  dropdownAriaLabel="Chọn nhà cung cấp"
                />
              </div>
              <div className="col-4 field">
                <label htmlFor="debt">Ngày nợ</label>
                <InputText
                  id="debt"
                  name="debt"
                  value={formData.debt}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="field mt-4">
              <label htmlFor="po_excel_string">PO Excel</label>
              <InputTextarea
                id="po_excel_string"
                name="po_excel_string"
                value={formData.po_excel_string}
                onChange={handleInputChange}
                rows={3}
                onPaste={convertExcelStringToProducts}
              />
            </div>
            {/* <Button
              type="button"
              label="Convert Excel to Products"
              icon="pi pi-file-excel"
              onClick={convertExcelStringToProducts}
              className="p-button-success mt-2"
            /> */}
            <div className="field mt-4">
              <label htmlFor="message_to_supplier">
                Tin nhắn tới nhà cung cấp
              </label>
              <InputText
                id="message_to_supplier"
                name="message_to_supplier"
                value={formData.message_to_supplier}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <div>Lấy thông tin đơn đặt hàng từ Google Sheets</div>
              <InputText
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="Nhập link Google Sheets"
              />
              <Button
                label="Nhập thông tin từ Google Sheet"
                onClick={handleImport}
                className="p-mt-2"
              />
            </div>

            <h3>Danh sách sản phẩm</h3>
            <DataTable
              value={formData.products}
              editMode="cell"
              className="editable-cells-table"
            >
              <Column
                field="po_product_sku"
                header="SKU"
                body={(rowData) =>
                  renderProductInput(rowData, "po_product_sku")
                }
              />
              <Column
                field="po_product_brand"
                header="Ngành"
                body={(rowData) =>
                  renderProductInput(rowData, "po_product_brand")
                }
                style={{ width: "150px" }}
              />
              <Column
                field="po_product_name"
                header="Tên sản phẩm"
                body={(rowData) =>
                  renderProductInput(rowData, "po_product_name")
                }
              />
              <Column
                field="po_product_quantity"
                header="Số lượng"
                body={(rowData) =>
                  renderProductInput(rowData, "po_product_quantity")
                }
                style={{ width: "100px" }}
              />
              <Column
                field="po_product_price"
                header="Giá"
                body={(rowData) =>
                  renderProductInput(rowData, "po_product_price")
                }
                style={{ width: "150px" }}
              />
              <Column
                field="po_product_warehouse"
                header="Kho"
                body={(rowData) =>
                  renderProductInput(rowData, "po_product_warehouse")
                }
                style={{ width: "300px" }}
              />
              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ width: "4rem", minWidth: "4rem" }}
              />
            </DataTable>
            <Button
              type="button"
              label="Thêm sản phẩm"
              icon="pi pi-plus"
              onClick={addProduct}
              className="p-button-secondary mt-2"
            />
          </div>
          <Button
            onClick={handleParseProductListPreview}
            type="button"
            label="Preview"
          />
          <h3>Preview:</h3>
          {rows.length > 0 ? (
            <DataTable
              id="dataTable"
              headerColumnGroup={headerGroup}
              value={rows}
              responsiveLayout="scroll"
              scrollable
              scrollHeight="400px"
              className="p-datatable-sm"
            >
              {headers.map((header, index) => (
                <Column
                  key={index}
                  field={index.toString()}
                  header={header}
                  style={{ minWidth: "100px", wordWrap: "break-word" }}
                />
              ))}
            </DataTable>
          ) : (
            <p>Không thấy thông tin</p>
          )}
          <div className="p-field">
            <label htmlFor="fileName">Tên file</label>
            <InputText
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Nhập tên file (tùy chọn)"
            />
          </div>
          <Button onClick={exportToPDF} type="button" label="Xuất file PDF" />
          <Button
            onClick={exportToExcel}
            type="button"
            label="Xuất file Excel"
          />
          <Button
            onClick={exportToImage}
            type="button"
            label="Xuất file Image"
          />
          <div className="flex justify-content-between mt-4">
            <Button
              type="submit"
              label="Tạo"
              icon="pi pi-plus"
              loading={loading}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreatePurchaseOrder;
