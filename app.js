// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Получаем данные пользователя
const user = tg.initDataUnsafe?.user;
if (user) {
    document.getElementById('user-name').textContent = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Пользователь';
}

// Моковые данные товаров
const products = [
    {
        id: 1,
        name: "Букет роз",
        price: 2500,
        category: "romantic",
        image: "https://via.placeholder.com/300x200?text=Букет+роз",
        description: "Роскошный букет из 25 алых роз с зеленью. Идеальный подарок для любимого человека."
    },
    {
        id: 2,
        name: "Подарочный набор шоколада",
        price: 1200,
        category: "birthday",
        image: "https://via.placeholder.com/300x200?text=Шоколадный+набор",
        description: "Набор из лучших сортов бельгийского шоколада в элегантной упаковке."
    },
    {
        id: 3,
        name: "Конструктор LEGO",
        price: 3500,
        category: "children",
        image: "https://via.placeholder.com/300x200?text=LEGO",
        description: "Популярный конструктор для детей от 6 лет. Развивает моторику и воображение."
    },
    {
        id: 4,
        name: "Подарочный сертификат",
        price: 5000,
        category: "corporate",
        image: "https://via.placeholder.com/300x200?text=Сертификат",
        description: "Универсальный подарок - сертификат на сумму 5000 рублей. Получатель сам выберет что ему по душе."
    },
    {
        id: 5,
        name: "Фотоальбом ручной работы",
        price: 1800,
        category: "romantic",
        image: "https://via.placeholder.com/300x200?text=Фотоальбом",
        description: "Эксклюзивный фотоальбом ручной работы с возможностью персонализации."
    },
    {
        id: 6,
        name: "Именная кружка",
        price: 800,
        category: "birthday",
        image: "https://via.placeholder.com/300x200?text=Именная+кружка",
        description: "Керамическая кружка с именем получателя и теплыми пожеланиями."
    }
];

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Инициализация Bootstrap модальных окон
const productModal = new bootstrap.Modal(document.getElementById('productModal'));
const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));

// Текущий выбранный товар
let currentProduct = null;

// DOM элементы
const productsContainer = document.getElementById('products-container');
const loadingSpinner = document.getElementById('loading-spinner');
const emptyMessage = document.getElementById('empty-message');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotal = document.getElementById('cart-total');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    renderProducts(products);
    updateCartCount();
    
    // Имитация загрузки
    setTimeout(() => {
        loadingSpinner.classList.add('d-none');
    }, 800);
});

// Рендер списка товаров
function renderProducts(productsToRender) {
    productsContainer.innerHTML = '';
    
    if (productsToRender.length === 0) {
        emptyMessage.classList.remove('d-none');
        return;
    }
    
    emptyMessage.classList.add('d-none');
    
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'col';
        productCard.innerHTML = `
            <div class="card product-card h-100">
                <div class="position-relative">
                    <img src="${product.image}" class="card-img-top product-img" alt="${product.name}">
                    <span class="badge bg-primary badge-category">${getCategoryName(product.category)}</span>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-primary fw-bold">${product.price}₽</p>
                    <button class="btn btn-outline-primary w-100 view-product-btn" data-id="${product.id}">
                        Подробнее
                    </button>
                </div>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
    
    // Добавляем обработчики событий для кнопок
    document.querySelectorAll('.view-product-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            showProductModal(productId);
        });
    });
}

// Показать модальное окно товара
function showProductModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    
    if (!currentProduct) return;
    
    document.getElementById('productModalTitle').textContent = currentProduct.name;
    document.getElementById('productModalImage').src = currentProduct.image;
    document.getElementById('productModalDescription').textContent = currentProduct.description;
    document.getElementById('productModalPrice').textContent = `${currentProduct.price}₽`;
    document.querySelector('.quantity-input').value = 1;
    document.getElementById('gift-message').value = '';
    document.getElementById('gift-wrap').value = 'standard';
    
    productModal.show();
}

// Обновление счетчика корзины
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
        cartCount.classList.remove('d-none');
    } else {
        cartCount.classList.add('d-none');
    }
}

// Обновление содержимого корзины в модальном окне
function updateCartModal() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-muted text-center">Корзина пуста</p>';
        cartTotal.textContent = '0₽';
        return;
    }
    
    let total = 0;
    const cartList = document.createElement('div');
    cartList.className = 'list-group';
    
    cart.forEach((item, index) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;
        
        const wrapPrice = getWrapPrice(item.wrap);
        const itemTotal = (product.price + wrapPrice) * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'list-group-item';
        cartItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <img src="${product.image}" class="cart-item-img me-3" alt="${product.name}">
                    <div>
                        <h6 class="mb-1">${product.name}</h6>
                        <small class="text-muted">${item.quantity} × ${product.price + wrapPrice}₽</small>
                        ${item.message ? `<small class="d-block text-muted">Сообщение: "${item.message}"</small>` : ''}
                        <small class="d-block text-muted">Упаковка: ${getWrapName(item.wrap)}</small>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartList.appendChild(cartItem);
    });
    
    cartItemsContainer.appendChild(cartList);
    cartTotal.textContent = `${total}₽`;
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
}

// Добавление в корзину
function addToCart(productId, quantity, message, wrap) {
    const existingItemIndex = cart.findIndex(item => 
        item.productId === productId && 
        item.message === message && 
        item.wrap === wrap
    );
    
    if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            productId,
            quantity,
            message,
            wrap
        });
    updateMainButtonVisibility();
}
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Анимация иконки корзины
    const cartIcon = document.getElementById('cart-btn');
    cartIcon.classList.add('bounce-animation');
    setTimeout(() => {
        cartIcon.classList.remove('bounce-animation');
    }, 500);
}

// Удаление из корзины
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartModal();
    updateMainButtonVisibility();
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) return;
    
    // Здесь должна быть логика оформления заказа
    // Например, отправка данных в Telegram бота
    
    const orderData = {
        userId: user?.id || null,
        items: cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                productId: item.productId,
                productName: product?.name || 'Неизвестный товар',
                quantity: item.quantity,
                price: product?.price || 0,
                message: item.message,
                wrap: item.wrap,
                wrapPrice: getWrapPrice(item.wrap)
            };
        }),
        total: cart.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            const wrapPrice = getWrapPrice(item.wrap);
            return sum + (product ? (product.price + wrapPrice) * item.quantity : 0);
        }, 0),
        date: new Date().toISOString()
    };
    
    // В реальном приложении здесь бы отправлялись данные в бота
    console.log('Order data:', orderData);
    
    // Имитация успешного оформления
    tg.showAlert('Ваш заказ успешно оформлен! Скоро с вами свяжется наш менеджер.');
    
    // Очищаем корзину
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartModal();
    cartModal.hide();
}

function loadUserAvatar() {
    const user = Telegram.WebApp.initDataUnsafe?.user;
    if (!user) return;
    
    const avatarImg = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    // Имя пользователя
    userName.textContent = [user.first_name, user.last_name].filter(Boolean).join(' ');
    
    // Аватар через Bot API
    fetch(`/get_avatar?user_id=${user.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.photo_url) {
                avatarImg.src = data.photo_url;
                avatarImg.classList.remove('d-none');
            }
        });
}

// Вызовите при загрузке
document.addEventListener('DOMContentLoaded', loadUserAvatar);

// Вспомогательные функции
function getCategoryName(category) {
    const categories = {
        all: "Все",
        romantic: "Романтика",
        birthday: "День рождения",
        children: "Детям",
        corporate: "Корпоратив"
    };
    return categories[category] || category;
}

function getWrapName(wrap) {
    const wraps = {
        standard: "Стандартная",
        preemium: "Подарочная коробка",
        luxury: "Премиум упаковка"
    };
    return wraps[wrap] || wrap;
}

function getWrapPrice(wrap) {
    const prices = {
        standard: 0,
        preemium: 300,
        luxury: 500
    };
    return prices[wrap] || 0;
}

// Обработчики событий
document.querySelector('.add-to-cart-btn').addEventListener('click', function() {
    if (!currentProduct) return;
    
    const quantity = parseInt(document.querySelector('.quantity-input').value);
    const message = document.getElementById('gift-message').value;
    const wrap = document.getElementById('gift-wrap').value;
    
    addToCart(currentProduct.id, quantity, message, wrap);
    productModal.hide();
    
    tg.HapticFeedback.impactOccurred('medium');
});

document.getElementById('cart-btn').addEventListener('click', function() {
    updateCartModal();
    cartModal.show();
});

document.getElementById('profile-btn').addEventListener('click', function() {
    profileModal.show();
});

document.getElementById('checkout-btn').addEventListener('click', checkout);

// Обработчики для кнопок количества
document.querySelector('.minus-btn').addEventListener('click', function() {
    const input = document.querySelector('.quantity-input');
    if (input.value > 1) input.value--;
});

document.querySelector('.plus-btn').addEventListener('click', function() {
    const input = document.querySelector('.quantity-input');
    input.value++;
});

// Поиск и фильтрация
document.getElementById('search-btn').addEventListener('click', searchProducts);
document.getElementById('search-input').addEventListener('keyup', function(e) {
    if (e.key === 'Enter') searchProducts();
});

document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        filterProductsByCategory(category);
    });
});

function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm)
    );
    renderProducts(filtered);
}

function filterProductsByCategory(category) {
    if (category === 'all') {
        renderProducts(products);
        return;
    }
    
    const filtered = products.filter(product => product.category === category);
    renderProducts(filtered);
}

// Генерация ID заказа
function generateOrderId() {
    return Math.floor(Math.random() * 900000) + 100000;
}

// Отправка заказа в Telegram бот
async function sendOrderToBot(orderData) {
    try {
        // Добавляем информацию о пользователе
        orderData.user = {
            id: tg.initDataUnsafe?.user?.id,
            username: tg.initDataUnsafe?.user?.username,
            firstName: tg.initDataUnsafe?.user?.first_name,
            lastName: tg.initDataUnsafe?.user?.last_name
        };
        
        // Добавляем ID заказа
        orderData.orderId = generateOrderId();
        
        // Показываем индикатор загрузки
        tg.MainButton.showProgress();
        
        // Отправляем данные в бот
        tg.sendData(JSON.stringify(orderData));
        
        // Закрываем WebApp через 2 секунды
        setTimeout(() => {
            tg.close();
        }, 2000);
        
    } catch (error) {
        console.error('Error sending order:', error);
        tg.showAlert('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.');
        tg.MainButton.hideProgress();
    }
}

// Инициализация Telegram WebApp
function initTelegramWebApp() {
    // Развернуть на весь экран
    tg.expand();
    
    // Настройка основной кнопки
    tg.MainButton.setText("ОФОРМИТЬ ЗАКАЗ");
    tg.MainButton.onClick(() => {
        const orderData = {
            items: cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                return {
                    productId: item.productId,
                    name: product?.name || 'Неизвестный товар',
                    quantity: item.quantity,
                    price: product?.price || 0,
                    message: item.message,
                    wrap: item.wrap,
                    wrapPrice: getWrapPrice(item.wrap)
                };
            }),
            total: cart.reduce((sum, item) => {
                const product = products.find(p => p.id === item.productId);
                const wrapPrice = getWrapPrice(item.wrap);
                return sum + (product ? (product.price + wrapPrice) * item.quantity : 0);
            }, 0)
        };
        
        sendOrderToBot(orderData);
    });
    
    // Показать кнопку, когда корзина не пуста
    if (cart.length > 0) {
        tg.MainButton.show();
    }
}

// Обновляем видимость основной кнопки при изменении корзины
function updateMainButtonVisibility() {
    if (cart.length > 0) {
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// Инициализируем при загрузке
document.addEventListener('DOMContentLoaded', initTelegramWebApp);
