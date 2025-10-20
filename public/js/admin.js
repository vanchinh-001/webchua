import { apiGet, apiDelete } from "./api.js";
import { getCurrentUser } from "./auth.js";

// -----------------------
// KIỂM TRA QUYỀN TRUY CẬP
// -----------------------
const user = getCurrentUser();
if (!user || !user.is_admin) {
  alert("Bạn không có quyền truy cập trang này!");
  window.location.href = "index.html";
}

// -----------------------
// HIỂN THỊ THÔNG TIN ADMIN
// -----------------------
document.getElementById("admin-info").innerHTML = `👤 Xin chào, <b>${user.name}</b> (Admin)`;

// -----------------------
// HIỂN THỊ DANH SÁCH SẢN PHẨM
// -----------------------
async function loadProducts() {
  const products = await apiGet("products?_embed=product_variants");
  const tbody = document.querySelector("#product-table tbody");

  tbody.innerHTML = products.map(p => {
    const variants = p.product_variants || [];
    const totalStock = variants.reduce((s, v) => s + (v.quantity || 0), 0);
    const price = variants[0]?.price || 0;
    return `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${price.toLocaleString()}đ</td>
        <td>${totalStock}</td>
        <td><button class="delete-btn" data-id="${p.id}">Xóa</button></td>
      </tr>
    `;
  }).join("");

  // Gắn sự kiện xóa sản phẩm
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = +e.target.dataset.id;
      if (confirm("Xóa sản phẩm này?")) {
        await apiDelete(`products/${id}`);
        loadProducts();
      }
    });
  });
}

// -----------------------
// THỐNG KÊ DOANH THU, TỒN KHO, ĐƠN HÀNG
// -----------------------
async function loadStatistics() {
  const orders = await apiGet("orders");
  const details = await apiGet("order_details");
  const variants = await apiGet("product_variants");

  const totalOrders = orders.length;
  const totalRevenue = details.reduce((sum, d) => sum + d.quantity * d.unit_price, 0);
  const totalStock = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);

  document.getElementById("total-orders").innerText = `Tổng đơn hàng: ${totalOrders}`;
  document.getElementById("total-revenue").innerText = `Doanh thu: ${totalRevenue.toLocaleString()}đ`;
  document.getElementById("total-stock").innerText = `Tổng hàng tồn: ${totalStock}`;
}

// -----------------------
// KHỞI TẠO
// -----------------------
loadProducts();
loadStatistics();
