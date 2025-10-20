// js/checkout.js
import { apiGet, apiPost, apiPut } from "./api.js";
import { getCart } from "./cart.js";

const checkoutBtn = document.getElementById("checkout-btn");
const CART_KEY = "susan_shop_cart";

/**
 * Hàm xử lý thanh toán thực tế
 */
async function handleCheckout() {
  try {
    const cart = getCart();
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    // Lấy thông tin người dùng hiện tại (nếu có)
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || !currentUser.id) {
      alert("Vui lòng đăng nhập trước khi thanh toán!");
      return;
    }

    // 1️⃣ Tạo đơn hàng mới
    const newOrder = await apiPost("orders", {
      user_id: currentUser.id,
      created_date: new Date().toISOString(),
      status: "completed",
    });

    // 2️⃣ Lưu từng sản phẩm vào order_details và 3️⃣ Giảm tồn kho
    for (const item of cart) {
      // Xác định product_id cho order_details
      const productId = item.product_id || item.id; 

      await apiPost("order_details", {
        order_id: newOrder.id,
        product_id: productId,
        quantity: item.quantity,
        unit_price: item.price,
      });

      // 3️⃣ Giảm tồn kho (SỬA LỖI: dùng item.variantId)
      const variantId = item.variantId; 
      const quantityToDeduct = Number(item.quantity); 

      if (variantId) {
        try {
            // Tồn kho được lưu tại endpoint product_variants
            const resourceEndpoint = "product_variants";
            const resourceId = variantId;

            // 3.1. Lấy thông tin tồn kho hiện tại
            const variant = await apiGet(`${resourceEndpoint}/${resourceId}`);
            const currentQuantity = Number(variant.quantity);

            // 3.2. Tính toán số lượng mới (không để âm)
            if (typeof currentQuantity === 'number') {
                const updatedQuantity = Math.max(currentQuantity - quantityToDeduct, 0);

                // 3.3. Cập nhật tồn kho mới lên API (Ghi vào database)
                await apiPut(`${resourceEndpoint}/${resourceId}`, {
                    ...variant,
                    quantity: updatedQuantity,
                });
            } else {
                 console.warn(`Cảnh báo: Không tìm thấy trường 'quantity' cho biến thể ID ${variantId}. Bỏ qua trừ tồn kho.`);
            }
        } catch (error) {
            console.error(`Lỗi nghiêm trọng: Không thể cập nhật tồn kho cho Variant ID ${variantId}. Kiểm tra API json-server.`, error);
        }
      } else {
        // Cảnh báo: Lỗi này không nên xảy ra sau khi fix db.json
        console.warn(`Sản phẩm ${item.name || 'không tên'} không có Variant ID, bỏ qua bước trừ tồn kho.`);
      }
    }

    // 4️⃣ Xóa giỏ hàng sau khi thanh toán
    localStorage.removeItem(CART_KEY);

    // 5️⃣ Thông báo thành công và chuyển hướng
    alert("🎉 Thanh toán thành công! Tồn kho đã được cập nhật.");
    window.location.href = "index.html";
  } catch (err) {
    console.error("Lỗi trong quá trình thanh toán:", err);
    alert("❌ Có lỗi xảy ra khi thanh toán. Vui lòng kiểm tra console.");
  }
}

// Gắn sự kiện click cho nút Thanh toán
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", handleCheckout);
}