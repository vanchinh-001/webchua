// js/product_details.js
import { apiGet } from "./api.js";
import { addToCart } from "./cart.js"; // Import hàm thêm vào giỏ hàng từ cart.js

const API_URL = "http://localhost:3000"; // Đảm bảo URL này khớp với api.js
const productContainer = document.getElementById("product-container");
const loadingMessage = document.getElementById("loading-message");

/**
 * Lấy ID sản phẩm từ URL.
 * Ví dụ: product.html?id=3 -> Trả về "3"
 */
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Hiển thị chi tiết sản phẩm dựa trên ID.
 */
async function loadProductDetails() {
    const productId = getProductIdFromUrl();
    if (!productId) {
        if (loadingMessage) loadingMessage.innerHTML = '<p class="error-message">❌ Lỗi: Không tìm thấy ID sản phẩm trong URL. Vui lòng quay lại trang danh sách.</p>';
        return;
    }

    try {
        // Lấy sản phẩm kèm theo các biến thể của nó
        const product = await apiGet(`products/${productId}?_embed=product_variants`);
        
        if (loadingMessage) loadingMessage.style.display = 'none';

        renderProduct(product);

    } catch (error) {
        console.error("Lỗi tải chi tiết sản phẩm:", error);
        if (loadingMessage) loadingMessage.innerHTML = `<p class="error-message">❌ Không thể tải sản phẩm ID: ${productId}. Vui lòng kiểm tra kết nối API.</p>`;
    }
}

/**
 * Render giao diện chi tiết sản phẩm.
 */
function renderProduct(product) {
    if (!productContainer) return;

    // Lấy biến thể đầu tiên làm mặc định, nếu không có biến thể thì dùng dữ liệu chính
    let selectedVariant = product.product_variants?.[0];
    
    // Fallback nếu không có biến thể
    if (!selectedVariant) {
        selectedVariant = {
            id: product.id, // Dùng ID sản phẩm chính làm ID biến thể
            variant_name: '', // Không có tên biến thể
            price: product.price || 0,
            quantity: 9999,
            image: product.image
        };
    }

    const { name, detail } = product;
    const finalPrice = selectedVariant.price;
    const finalImage = selectedVariant.image || product.image;

    productContainer.innerHTML = `
        <div class="product-card">
            <div class="product-image">
                <img src="${finalImage}" alt="${name}" id="main-product-image">
            </div>

            <div class="product-details">
                <h2 class="product-name">${name}</h2>

                <div class="product-detail-section">
                    <h3 class="section-title">Mô tả sản phẩm</h3>
                    <p class="product-description">${detail || "Không có mô tả chi tiết."}</p>
                </div>
                
                ${product.product_variants && product.product_variants.length > 0 ? `
                <div class="product-detail-section">
                    <h3 class="section-title">Tùy chọn</h3>
                    <div class="variant-group" id="variant-options">
                        ${product.product_variants.map(variant => `
                            <div class="variant-option">
                                <input 
                                    type="radio" 
                                    id="variant-${variant.id}" 
                                    name="variant" 
                                    value="${variant.id}" 
                                    data-price="${variant.price}"
                                    data-image="${variant.image || product.image}"
                                    data-name="${variant.variant_name}"
                                    ${Number(variant.quantity) <= 0 ? 'disabled' : ''}
                                    ${variant.id == selectedVariant.id ? 'checked' : ''}
                                >
                                <label 
                                    for="variant-${variant.id}"
                                    class="${Number(variant.quantity) <= 0 ? 'disabled' : ''}"
                                >
                                    ${variant.variant_name} (${variant.price.toLocaleString()}đ) 
                                    ${Number(variant.quantity) <= 0 ? ' (Hết hàng)' : ''}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="product-detail-section">
                    <h3 class="section-title">Số lượng</h3>
                    <input type="number" id="quantity-input" value="1" min="1" style="width: 80px; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                </div>

                <div class="final-price-label">
                    Giá: <span id="current-price">${finalPrice.toLocaleString()}đ</span>
                </div>
                
                <button id="add-to-cart-btn" style="background: #e67e22; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 1.2em; cursor: pointer; transition: 0.3s;"
                    ${Number(selectedVariant.quantity) <= 0 ? 'disabled' : ''}
                >
                    ${Number(selectedVariant.quantity) <= 0 ? 'Hết hàng' : '➕ Thêm vào giỏ hàng'}
                </button>
            </div>
        </div>
    `;
    
    // Gắn sự kiện sau khi render
    attachEventListeners(product, selectedVariant);
}

/**
 * Gắn các sự kiện cho nút/input sau khi render.
 */
function attachEventListeners(product, initialVariant) {
    let currentVariant = initialVariant;

    // 1. Cập nhật giá và ảnh khi chọn biến thể khác
    document.querySelectorAll('input[name="variant"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const variantId = e.target.value;
            
            // Tìm biến thể mới trong danh sách product_variants
            currentVariant = product.product_variants.find(v => v.id == variantId) || initialVariant;

            const newPrice = currentVariant.price;
            const newImage = currentVariant.image || product.image;
            const isOutOfStock = Number(currentVariant.quantity) <= 0;

            document.getElementById('current-price').innerText = newPrice.toLocaleString() + 'đ';
            document.getElementById('main-product-image').src = newImage;
            
            const addToCartBtn = document.getElementById('add-to-cart-btn');
            addToCartBtn.disabled = isOutOfStock;
            addToCartBtn.innerText = isOutOfStock ? 'Hết hàng' : '➕ Thêm vào giỏ hàng';
        });
    });

    // 2. Sự kiện Thêm vào giỏ hàng
    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('quantity-input').value) || 1;
        
        // Cập nhật lại số lượng tối thiểu nếu người dùng nhập số âm
        if (quantity < 1) {
            document.getElementById('quantity-input').value = 1;
            return;
        }

        const itemToAdd = {
            id: product.id,
            name: product.name,
            price: currentVariant.price,
            quantity: quantity,
            image: currentVariant.image || product.image,
            // Sử dụng variantId để quản lý trong giỏ hàng
            variantId: currentVariant.id, 
            variantName: currentVariant.variant_name
        };

        addToCart(itemToAdd);
        alert(`Đã thêm ${quantity} x ${product.name} ${currentVariant.variant_name ? '(' + currentVariant.variant_name + ')' : ''} vào giỏ hàng!`);
        // Có thể thêm logic cập nhật số lượng giỏ hàng trên header ở đây (nếu có)
    });
}

// Khởi chạy khi DOM tải xong
document.addEventListener("DOMContentLoaded", loadProductDetails);