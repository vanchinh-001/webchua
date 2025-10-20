// js/cart.js
// Mục đích: Khắc phục lỗi không xóa được sản phẩm và không cập nhật tiền khi thay đổi số lượng.

const CART_KEY = "susan_shop_cart";

// --- 1. Hàm Quản lý Dữ liệu (CRUD) ---

/** Lấy giỏ hàng từ localStorage. */
export function getCart() {
    try {
        const cartJson = localStorage.getItem(CART_KEY);
        const raw = cartJson ? JSON.parse(cartJson) : [];
        // Normalize numeric fields to avoid type mismatches
        return raw.map(item => ({
            ...item,
            variantId: Number(item.variantId),
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0
        }));
    } catch (e) {
        console.error("Lỗi khi đọc giỏ hàng từ localStorage:", e);
        return [];
    }
}

/** Lưu giỏ hàng và chỉ cập nhật số lượng trên header. */
function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        
        // 1. Cập nhật số lượng giỏ hàng trên header (Nếu có)
        const cartCountElement = document.getElementById("cart-count");
        if (cartCountElement) {
            cartCountElement.innerText = getCartCount();
        }
        
        // Bỏ logic kiểm tra global renderCart() không đáng tin cậy ở đây.
        
    } catch (e) {
        console.error("Lỗi khi lưu giỏ hàng vào localStorage:", e);
    }
}

/** Cập nhật số lượng và tính toán lại. */
// ✅ EXPORT hàm để có thể gọi từ bên ngoài (từ cart.html)
export function updateQuantity(variantId, newQuantity) {
    const id = Number(variantId);
    let cart = getCart();
    const itemIndex = cart.findIndex(item => Number(item.variantId) === id);

    if (itemIndex > -1) {
        // Đảm bảo số lượng là số nguyên dương, tối thiểu là 1
        const finalQuantity = Math.max(1, parseInt(newQuantity, 10) || 1);

        if (finalQuantity > 0) {
            cart[itemIndex].quantity = finalQuantity;
        }

        saveCart(cart); 
        // ✅ FIX 1: Tự động gọi renderCart() sau khi cập nhật dữ liệu.
        renderCart(); 
    }
}

/** Xóa sản phẩm. */
// ✅ EXPORT hàm để có thể gọi từ bên ngoài (từ cart.html)
export function removeItem(variantId) {
    const id = Number(variantId);
    let cart = getCart();
    cart = cart.filter(item => Number(item.variantId) !== id);

    saveCart(cart); 
    // ✅ FIX 1: Tự động gọi renderCart() sau khi xóa dữ liệu.
    renderCart(); 
}

// Hàm này được dùng để cập nhật số lượng hiển thị trên icon giỏ hàng
export function getCartCount() {
    return getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

// Hàm này dùng cho index.html
export function addToCart(newItem) {
    // Normalize incoming item
    newItem = {
        ...newItem,
        variantId: Number(newItem.variantId),
        quantity: Number(newItem.quantity) || 1,
        price: Number(newItem.price) || 0
    };

    let cart = getCart();
    const existingItem = cart.find(item => Number(item.variantId) === newItem.variantId);

    if (existingItem) {
        existingItem.quantity = Number(existingItem.quantity || 0) + newItem.quantity;
    } else {
        cart.push(newItem);
    }
    saveCart(cart);
}


// --- 2. Hàm Render Giao diện (CHỈ DÙNG CHO cart.html) ---

// ✅ EXPORT HÀM NÀY
export function renderCart() { 
    const cart = getCart();
    let totalAmount = 0;
    const cartBody = document.getElementById("cart-body");
    const cartTotalElement = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");

    if (!cartBody || !cartTotalElement || !checkoutBtn) return; // Bảo vệ nếu không tìm thấy DOM

    if (cart.length === 0) {
        cartBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Giỏ hàng trống!</td></tr>`;
        cartTotalElement.innerText = "Tổng: 0đ";
        checkoutBtn.disabled = true;
        return;
    }

    const html = cart.map(item => {
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || 0);
        const subtotal = price * qty;
        totalAmount += subtotal;
        
        return `
            <tr>
                <td style="text-align:center;"><img src="${item.image}" alt="${item.name}" width="50" height="50" style="object-fit:cover; border-radius: 4px;"></td>
                <td>${item.name}</td>
                <td>${price.toLocaleString()}đ</td>
                <td>
                    <input 
                        type="number" 
                        min="1" 
                        value="${item.quantity}" 
                        data-variant-id="${item.variantId}" 
                        class="quantity-input" 
                        style="width: 60px; padding: 5px; text-align: center;"
                    >
                </td>
                <td>${subtotal.toLocaleString()}đ</td>
                <td style="text-align:center;">
                    <button class="remove-btn" data-variant-id="${item.variantId}" style="background: #b22222; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Xóa</button>
                </td>
            </tr>
        `;
    }).join("");

    cartBody.innerHTML = html;
    cartTotalElement.innerText = `Tổng: ${totalAmount.toLocaleString()}đ`;
    checkoutBtn.disabled = false;


    // --- 3. GẮN LẠI SỰ KIỆN SAU KHI RENDER (Đây là logic đã đúng) ---
    
    // 3.1 Gắn sự kiện cho nút xóa
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const variantId = +e.target.dataset.variantId;
            removeItem(variantId); // Gọi hàm đã được sửa để tự động gọi renderCart()
        });
    });

    // 3.2 Gắn sự kiện cho input số lượng (Sử dụng 'input' để cập nhật TỨC THỜI)
    document.querySelectorAll(".quantity-input").forEach(input => {
        // Sự kiện 'input' để cập nhật nhanh chóng
        input.addEventListener("input", (e) => {
            const variantId = +e.target.dataset.variantId;
            const newQuantity = parseInt(e.target.value) || 1;
            updateQuantity(variantId, newQuantity); 
        });
        
        // Sự kiện 'change' để xử lý khi người dùng nhập số và click chuột ra ngoài
        input.addEventListener("change", (e) => {
             const variantId = +e.target.dataset.variantId;
             const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
             e.target.value = newQuantity; // Cập nhật lại giá trị hiển thị
             updateQuantity(variantId, newQuantity);
        });
    });
}

// ❌ FIX 2: Loại bỏ việc lắng nghe sự kiện DOMContentLoaded ở đây. 
// Trang cart.html sẽ tự import và gọi renderCart() lần đầu.
// document.addEventListener("DOMContentLoaded", renderCart);