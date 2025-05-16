// Đợi cho document load hoàn tất
document.addEventListener('DOMContentLoaded', function () {
    // tạo giỏ hàng
    initializeCart();

    // Thêm sự kiện click cho nút giỏ hàng trong header
    const cartIcon = document.querySelector('header .icons .fa-shopping-cart');
    if (cartIcon) {
        cartIcon.addEventListener('click', function (event) {
            event.preventDefault();
            toggleCartPanel();
        });
    }

    // Thêm sự kiện cho các nút "thêm vào giỏ hàng"
    const addToCartButtons = document.querySelectorAll('.cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const productBox = this.closest('.box');
            addProductToCart(productBox);
        });
    });

    // Đóng giỏ hàng khi click bên ngoài
    document.addEventListener('click', function (event) {
        const cartPanel = document.getElementById('cart-panel');
        const cartIcon = document.querySelector('header .icons .fa-shopping-cart');

        if (cartPanel && cartPanel.style.display === 'block' &&
            !cartPanel.contains(event.target) &&
            event.target !== cartIcon) {
            cartPanel.style.display = 'none';
        }
    });
});

// Tạo và khởi tạo bảng giỏ hàng
function initializeCart() {
    // Kiểm tra xem bảng giỏ hàng đã tồn tại chưa
    if (!document.getElementById('cart-panel')) {
        // Tạo phần tử bảng giỏ hàng
        const cartPanel = document.createElement('div');
        cartPanel.id = 'cart-panel';
        cartPanel.className = 'cart-panel';

        // HTML nội dung của bảng giỏ hàng
        cartPanel.innerHTML = `
            <div class="cart-header">
                <h2>Giỏ Hàng Của Bạn</h2>
                <span class="close-cart">&times;</span>
            </div>
            <div class="cart-items">
                <!-- Sản phẩm sẽ được thêm vào đây -->
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Tổng cộng:</span>
                    <span class="total-price">0 VND</span>
                </div>
                <button class="checkout-btn">Thanh Toán</button>
                <button class="clear-cart-btn">Xóa Giỏ Hàng</button>
            </div>
        `;

        // Thêm bảng giỏ hàng vào body
        document.body.appendChild(cartPanel);

        // Thêm CSS cho bảng giỏ hàng
        addCartStyles();

        // Thêm sự kiện cho nút đóng
        const closeBtn = cartPanel.querySelector('.close-cart');
        closeBtn.addEventListener('click', function () {
            cartPanel.style.display = 'none';
        });

        // Thêm sự kiện cho nút thanh toán
        const checkoutBtn = cartPanel.querySelector('.checkout-btn');
        checkoutBtn.addEventListener('click', function () {
            alert('Cảm ơn bạn đã mua hàng! Tổng thanh toán: ' +
                document.querySelector('.total-price').textContent);
            clearCart();
        });

        // Thêm sự kiện cho nút xóa giỏ hàng
        const clearCartBtn = cartPanel.querySelector('.clear-cart-btn');
        clearCartBtn.addEventListener('click', clearCart);

        // Khởi tạo giỏ hàng từ localStorage nếu có
        loadCartFromStorage();
    }
}

// Hiển thị hoặc ẩn bảng giỏ hàng
function toggleCartPanel() {
    const cartPanel = document.getElementById('cart-panel');
    if (cartPanel.style.display === 'block') {
        cartPanel.style.display = 'none';
    } else {
        cartPanel.style.display = 'block';
    }
}

// Thêm sản phẩm vào giỏ hàng
function addProductToCart(productBox) {
    // Lấy thông tin sản phẩm
    const productImg = productBox.querySelector('.image img').src;
    const productName = productBox.querySelector('.content h3').textContent;
    //const productPrice = productBox.querySelector('.content .price').textContent.split('<span>')[0].trim();
    const priceElement = productBox.querySelector('.content .price');
    const productPrice = priceElement.childNodes[0].textContent.trim();

    // Tạo ID sản phẩm dựa trên tên để kiểm tra trùng lặp
    const productId = productName.toLowerCase().replace(/\s+/g, '-');

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItem = document.querySelector(`.cart-item[data-id="${productId}"]`);

    if (existingItem) {
        // Nếu sản phẩm đã có, tăng số lượng
        const quantityElement = existingItem.querySelector('.item-quantity');
        let quantity = parseInt(quantityElement.textContent) + 1;
        quantityElement.textContent = quantity;
    } else {
        // Nếu sản phẩm chưa có, thêm mới
        const cartItems = document.querySelector('.cart-items');

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.setAttribute('data-id', productId);
        cartItem.setAttribute('data-price', parsePrice(productPrice));

        cartItem.innerHTML = `
            <div class="item-image">
                <img src="${productImg}" alt="${productName}">
            </div>
            <div class="item-details">
                <h3>${productName}</h3>
                <p class="item-price">${productPrice}</p>
                <div class="item-quantity-control">
                    <button class="quantity-btn minus">-</button>
                    <span class="item-quantity">1</span>
                    <button class="quantity-btn plus">+</button>
                </div>
            </div>
            <button class="remove-item">×</button>
        `;

        cartItems.appendChild(cartItem);

        // Thêm sự kiện cho nút xóa sản phẩm
        const removeBtn = cartItem.querySelector('.remove-item');
        removeBtn.addEventListener('click', function () {
            cartItem.remove();
            updateCartTotal();
            saveCartToStorage();
        });

        // Thêm sự kiện cho nút tăng/giảm số lượng
        const minusBtn = cartItem.querySelector('.quantity-btn.minus');
        const plusBtn = cartItem.querySelector('.quantity-btn.plus');
        const quantityElement = cartItem.querySelector('.item-quantity');

        minusBtn.addEventListener('click', function () {
            let quantity = parseInt(quantityElement.textContent);
            if (quantity > 1) {
                quantity--;
                quantityElement.textContent = quantity;
                updateCartTotal();
                saveCartToStorage();
            }
        });

        plusBtn.addEventListener('click', function () {
            let quantity = parseInt(quantityElement.textContent);
            quantity++;
            quantityElement.textContent = quantity;
            updateCartTotal();
            saveCartToStorage();
        });
    }

    // Hiển thị thông báo sản phẩm đã được thêm
    showNotification(`Đã thêm "${productName}" vào giỏ hàng!`);

    // Cập nhật tổng giá
    updateCartTotal();

    // Lưu giỏ hàng vào localStorage
    saveCartToStorage();

    // Hiển thị bảng giỏ hàng
    document.getElementById('cart-panel').style.display = 'block';
}

// Hiển thị thông báo khi thêm sản phẩm
function showNotification(message) {
    // Kiểm tra xem đã có thông báo chưa
    let notification = document.querySelector('.cart-notification');

    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'cart-notification';
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.display = 'block';

    // Tự động ẩn thông báo sau 3 giây
    setTimeout(function () {
        notification.style.display = 'none';
    }, 3000);
}

// Cập nhật tổng giá giỏ hàng
function updateCartTotal() {
    const cartItems = document.querySelectorAll('.cart-item');
    let total = 0;

    cartItems.forEach(item => {
        const price = parseFloat(item.getAttribute('data-price'));
        const quantity = parseInt(item.querySelector('.item-quantity').textContent);
        total += price * quantity;
    });

    // Hiển thị tổng giá (format theo tiền VND)
    document.querySelector('.total-price').textContent = formatPrice(total) + ' VND';
}

// Xóa tất cả sản phẩm trong giỏ hàng
function clearCart() {
    const cartItems = document.querySelector('.cart-items');
    cartItems.innerHTML = '';
    updateCartTotal();
    saveCartToStorage();
}

// Chuyển đổi chuỗi giá thành số
function parsePrice(priceString) {
    // Loại bỏ tất cả ký tự không phải số
    return parseFloat(priceString.replace(/[^\d]/g, ''));
}

// Format số thành chuỗi giá
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Lưu giỏ hàng vào localStorage
function saveCartToStorage() {
    const cartItems = document.querySelectorAll('.cart-item');
    const cartData = [];

    cartItems.forEach(item => {
        cartData.push({
            id: item.getAttribute('data-id'),
            price: item.getAttribute('data-price'),
            name: item.querySelector('.item-details h3').textContent,
            image: item.querySelector('.item-image img').src,
            quantity: item.querySelector('.item-quantity').textContent
        });
    });

    localStorage.setItem('hoangKenCart', JSON.stringify(cartData));
}

// Tải giỏ hàng từ localStorage
function loadCartFromStorage() {
    const cartData = localStorage.getItem('hoangKenCart');

    if (cartData) {
        const cartItems = JSON.parse(cartData);
        const cartItemsContainer = document.querySelector('.cart-items');

        cartItems.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.setAttribute('data-id', item.id);
            cartItem.setAttribute('data-price', item.price);

            cartItem.innerHTML = `
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">${formatPrice(item.price)} VND</p>
                    <div class="item-quantity-control">
                        <button class="quantity-btn minus">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                <button class="remove-item">×</button>
            `;

            cartItemsContainer.appendChild(cartItem);

            // Thêm sự kiện cho nút xóa sản phẩm
            const removeBtn = cartItem.querySelector('.remove-item');
            removeBtn.addEventListener('click', function () {
                cartItem.remove();
                updateCartTotal();
                saveCartToStorage();
            });

            // Thêm sự kiện cho nút tăng/giảm số lượng
            const minusBtn = cartItem.querySelector('.quantity-btn.minus');
            const plusBtn = cartItem.querySelector('.quantity-btn.plus');
            const quantityElement = cartItem.querySelector('.item-quantity');

            minusBtn.addEventListener('click', function () {
                let quantity = parseInt(quantityElement.textContent);
                if (quantity > 1) {
                    quantity--;
                    quantityElement.textContent = quantity;
                    updateCartTotal();
                    saveCartToStorage();
                }
            });

            plusBtn.addEventListener('click', function () {
                let quantity = parseInt(quantityElement.textContent);
                quantity++;
                quantityElement.textContent = quantity;
                updateCartTotal();
                saveCartToStorage();
            });
        });

        // Cập nhật tổng giá
        updateCartTotal();
    }
}

// Thêm CSS cho bảng giỏ hàng
function addCartStyles() {
    // Kiểm tra nếu đã có style rồi thì không thêm nữa
    if (!document.getElementById('cart-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'cart-styles';
        styleSheet.textContent = `
            .cart-panel {
                display: none;
                position: fixed;
                top: 0;
                right: 0;
                width: 400px;
                height: 100%;
                background-color: white;
                box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
                z-index: 1001;
                padding: 20px;
                overflow-y: auto;
                font-family: Verdana, Geneva, Tahoma, sans-serif;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from { right: -400px; }
                to { right: 0; }
            }
            
            .cart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
                margin-bottom: 20px;
            }
            
            .cart-header h2 {
                font-size: 2rem;
                color: var(--pink);
                margin: 0;
            }
            
            .close-cart {
                font-size: 3rem;
                cursor: pointer;
                color: #333;
            }
            
            .close-cart:hover {
                color: var(--pink);
            }
            
            .cart-items {
                margin-bottom: 20px;
            }
            
            .cart-item {
                display: flex;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #eee;
                position: relative;
            }
            
            .item-image {
                width: 70px;
                margin-right: 15px;
            }
            
            .item-image img {
                width: 100%;
                border-radius: 5px;
            }
            
            .item-details {
                flex: 1;
            }
            
            .item-details h3 {
                font-size: 1.6rem;
                margin: 0 0 5px;
                color: #333;
            }
            
            .item-price {
                font-size: 1.4rem;
                color: var(--pink);
                font-weight: bold;
                margin: 0 0 10px;
            }
            
            .item-quantity-control {
                display: flex;
                align-items: center;
            }
            
            .quantity-btn {
                width: 25px;
                height: 25px;
                background-color: #f0f0f0;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                cursor: pointer;
                border: none;
            }
            
            .quantity-btn:hover {
                background-color: var(--pink);
                color: white;
            }
            
            .item-quantity {
                margin: 0 10px;
                font-size: 1.4rem;
            }
            
            .remove-item {
                position: absolute;
                top: 15px;
                right: 0;
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: #999;
            }
            
            .remove-item:hover {
                color: var(--pink);
            }
            
            .cart-footer {
                border-top: 1px solid #eee;
                padding-top: 20px;
            }
            
            .cart-total {
                display: flex;
                justify-content: space-between;
                font-size: 1.8rem;
                margin-bottom: 20px;
            }
            
            .total-price {
                font-weight: bold;
                color: var(--pink);
            }
            
            .checkout-btn, .clear-cart-btn {
                width: 100%;
                padding: 12px;
                border: none;
                border-radius: 5px;
                margin-bottom: 10px;
                font-size: 1.6rem;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            .checkout-btn {
                background-color: var(--pink);
                color: white;
            }
            
            .checkout-btn:hover {
                background-color: #d63384;
            }
            
            .clear-cart-btn {
                background-color: #f0f0f0;
                color: #333;
            }
            
            .clear-cart-btn:hover {
                background-color: #e0e0e0;
            }
            
            .cart-notification {
                display: none;
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: var(--pink);
                color: white;
                padding: 15px 25px;
                border-radius: 5px;
                font-size: 1.6rem;
                z-index: 1002;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @media (max-width: 480px) {
                .cart-panel {
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(styleSheet);
    }
}