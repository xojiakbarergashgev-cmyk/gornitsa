/**
 * GORNITSA O'ZBEKISTON — INTERACTIVE SCRIPT
 * Interactive Size Selector (like User Reference Photo), Cart Drawer, Checkout, Tabs
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let cart = [];

    // --- DOM Elements ---
    const cartCounter = document.getElementById('cart-counter');
    const drawerCount = document.getElementById('drawer-count');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBackdrop = document.getElementById('cart-backdrop');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMsg = document.getElementById('empty-cart-message');
    const cartTotalUsd = document.getElementById('cart-total-usd');
    const cartTotalUzs = document.getElementById('cart-total-uzs');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Checkout Modal
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutModal = document.getElementById('close-checkout-modal');
    const orderForm = document.getElementById('order-form');
    const modalSummary = document.getElementById('modal-summary');

    // Toasts
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // Contact Form
    const contactForm = document.getElementById('contact-form');

    // Mobile Menu
    const menuToggle = document.getElementById('menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');

    if (menuToggle && mobileDrawer) {
        menuToggle.addEventListener('click', () => {
            mobileDrawer.classList.toggle('open');
        });

        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
            });
        });
    }

    // Currency Formatting
    const formatUsd = (amount) => {
        return amount.toFixed(1).replace('.0', '') + " $";
    };

    const formatUzs = (amount) => {
        return amount.toLocaleString('uz-UZ') + " so'm";
    };

    // Show Toast
    const showToast = (message) => {
        toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    };

    // --- INTERACTIVE SIZE SELECTOR (Exactly like user photo) ---
    document.querySelectorAll('.master-product-card').forEach(card => {
        const pills = card.querySelectorAll('.size-pill');
        const img = card.querySelector('.master-img');
        const optomTag = card.querySelector('.optom-tag');
        const usdDisplay = card.querySelector('.active-price-usd');
        const uzsDisplay = card.querySelector('.active-price-uzs');
        const addBtn = card.querySelector('.master-add-btn');

        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                // Toggle active state
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const size = pill.getAttribute('data-size');
                const usd = parseFloat(pill.getAttribute('data-usd'));
                const uzs = parseInt(pill.getAttribute('data-uzs'), 10);
                const scaleClass = pill.getAttribute('data-scale');

                // Update Tag & Prices with pop animation
                if (optomTag) {
                    optomTag.textContent = `OPTOM NARXI: ${size} uchun`;
                }
                if (usdDisplay) {
                    usdDisplay.textContent = `${usd} $`;
                    usdDisplay.style.animation = 'none';
                    void usdDisplay.offsetWidth;
                    usdDisplay.style.animation = 'pricePop 0.3s ease';
                }
                if (uzsDisplay) {
                    uzsDisplay.textContent = `~ ${formatUzs(uzs)}`;
                }

                // Update Image Scale with smooth spring bounce animation
                if (img && scaleClass) {
                    img.classList.remove('animate-size');
                    void img.offsetWidth; // Force reflow to re-trigger CSS keyframe
                    img.className = 'master-img ' + scaleClass + ' animate-size';
                }

                // Update Add to Cart Button attributes
                if (addBtn) {
                    addBtn.setAttribute('data-size', size);
                    addBtn.setAttribute('data-usd', usd);
                    addBtn.setAttribute('data-uzs', uzs);
                }
            });
        });
    });

    // --- Category Filtering ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const productCards = document.querySelectorAll('.master-product-card');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selectedCategory = button.getAttribute('data-category');

            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // --- Shopping Cart Drawer ---
    const toggleCart = (open) => {
        if (open) {
            cartDrawer.classList.add('open');
            cartBackdrop.classList.add('open');
            document.body.style.overflow = 'hidden';
        } else {
            cartDrawer.classList.remove('open');
            cartBackdrop.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    openCartBtn.addEventListener('click', () => toggleCart(true));
    closeCartBtn.addEventListener('click', () => toggleCart(false));
    cartBackdrop.addEventListener('click', () => toggleCart(false));

    // Render Cart Items
    const updateCartUI = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
        drawerCount.textContent = totalItems;

        // Clear previous items
        const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
        existingItems.forEach(el => el.remove());

        if (cart.length === 0) {
            emptyCartMsg.style.display = 'flex';
            cartTotalUsd.textContent = "0 $";
            cartTotalUzs.textContent = "0 so'm";
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.5';
            return;
        }

        emptyCartMsg.style.display = 'none';
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';

        let totalUsd = 0;
        let totalUzs = 0;

        cart.forEach(item => {
            const itemUsd = item.usd * item.quantity;
            const itemUzs = item.uzs * item.quantity;
            totalUsd += itemUsd;
            totalUzs += itemUzs;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">${formatUsd(item.usd)} <span style="font-size:0.75rem; color:#f5a623;">(${formatUzs(item.uzs)})</span></p>
                    <div class="cart-item-controls">
                        <button class="qty-btn minus-btn" data-id="${item.id}">−</button>
                        <span class="qty-number">${item.quantity}</span>
                        <button class="qty-btn plus-btn" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}" title="O'chirish">&times;</button>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        cartTotalUsd.textContent = formatUsd(totalUsd);
        cartTotalUzs.textContent = "~ " + formatUzs(totalUzs);

        // Plus / Minus / Remove handlers
        cartItemsContainer.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const target = cart.find(i => i.id === id);
                if (target) {
                    target.quantity += 1;
                    updateCartUI();
                }
            });
        });

        cartItemsContainer.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const target = cart.find(i => i.id === id);
                if (target) {
                    target.quantity -= 1;
                    if (target.quantity <= 0) {
                        cart = cart.filter(i => i.id !== id);
                    }
                    updateCartUI();
                }
            });
        });

        cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                cart = cart.filter(i => i.id !== id);
                updateCartUI();
                showToast("Mahsulot savatchadan olib tashlandi");
            });
        });
    };

    // Add To Cart for Master Cards
    document.querySelectorAll('.master-add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const baseName = btn.getAttribute('data-base-name');
            const size = btn.getAttribute('data-size');
            const fullName = `${baseName} (${size})`;
            const usd = parseFloat(btn.getAttribute('data-usd'));
            const uzs = parseInt(btn.getAttribute('data-uzs'), 10);
            const img = btn.getAttribute('data-img');
            const id = fullName.replace(/\s+/g, '-').toLowerCase();

            const existing = cart.find(item => item.id === id);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ id, name: fullName, usd, uzs, img, quantity: 1 });
            }

            updateCartUI();
            showToast(`"${fullName}" savatchaga qo'shildi!`);
            toggleCart(true);
        });
    });

    // Add To Cart for Direct Buttons (Spotlight 10 talik nabor)
    // Savatga to'g'ridan-to'g'ri qo'shish (keyin qo'shiladigan kartochkalar uchun ham ishlaydi)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-direct');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const usd = parseFloat(btn.getAttribute('data-usd')) || 0;
        const uzs = parseInt(btn.getAttribute('data-uzs'), 10) || 0;
        const img = btn.getAttribute('data-img');

        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ id, name, usd, uzs, img, quantity: 1 });
        }

        updateCartUI();
        showToast(`"${name}" savatchaga qo'shildi!`);
        toggleCart(true);
    });

    // --- Checkout Flow ---
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        toggleCart(false);

        let summaryHTML = '<strong>Tanlangan mahsulotlar:</strong><ul style="margin: 8px 0 12px 18px; line-height: 1.6;">';
        let totalUsd = 0;
        let totalUzs = 0;
        cart.forEach(item => {
            const subUsd = item.usd * item.quantity;
            const subUzs = item.uzs * item.quantity;
            totalUsd += subUsd;
            totalUzs += subUzs;
            summaryHTML += `<li>${item.name} (${item.quantity} dona) — <strong>${formatUsd(subUsd)}</strong> (~${formatUzs(subUzs)})</li>`;
        });
        summaryHTML += `</ul><div style="font-weight: 800; font-size: 1.15rem; color: #e52e2e;">Jami: ${formatUsd(totalUsd)} (~${formatUzs(totalUzs)})</div>`;

        modalSummary.innerHTML = summaryHTML;
        orderForm.style.display = 'block';
        checkoutModal.classList.add('open');
    });

    closeCheckoutModal.addEventListener('click', () => {
        checkoutModal.classList.remove('open');
    });

    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.classList.remove('open');
        }
    });

    // --- TELEGRAM BOT & ADMIN SOZLAMALARI ---
    const TELEGRAM_CONFIG = {
        botToken: '', // ochiq saytda maxfiy token saqlanmaydi
        chatId: '8313616979', // Ergashev (@ergashev_395)
        managerUsername: 'ergashev_395'
    };

    // Helper: Telegram Bot orqali avtomatik yuborish
    const sendToTelegramBot = async (text) => {
        if (!TELEGRAM_CONFIG.botToken) return false;
        try {
            const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CONFIG.chatId,
                    text: text
                })
            });
            const data = await response.json();
            return data.ok;
        } catch (e) {
            console.error('Telegram bot yuborishda xatolik:', e);
            return false;
        }
    };

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('confirm-order-btn');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Tasdiqlash';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '⏳ Yuborilmoqda...';
        }

        const name = document.getElementById('order-name').value.trim();
        const phone = document.getElementById('order-phone').value.trim();
        const address = document.getElementById('order-address').value.trim();
        const paymentInput = document.querySelector('input[name="payment"]:checked');
        const payment = paymentInput ? (paymentInput.value === 'click' ? 'Click / Payme' : 'Naqd / Karta') : 'Naqd';

        if (cart.length === 0) {
            showToast("Savatchangiz bo'sh!");
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
            return;
        }

        // Mahsulotlar ro'yxati va summasini shakllantirish
        let totalUsd = 0;
        let totalUzs = 0;
        let itemsText = '';

        cart.forEach((item, index) => {
            const subUsd = item.usd * item.quantity;
            const subUzs = item.uzs * item.quantity;
            totalUsd += subUsd;
            totalUzs += subUzs;
            itemsText += `${index + 1}. ${item.name} — ${item.quantity} dona — ${formatUsd(subUsd)} (~${formatUzs(subUzs)})\n`;
        });

        const dateStr = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

        // Telegram uchun to'liq xabar matni
        const telegramMessage = 
`🛍 YANGI BUYURTMA — GORNITSA O'ZBEKISTON

👤 Xaridor: ${name}
📞 Telefon: ${phone}
📍 Yetkazish manzili: ${address}
💳 To'lov usuli: ${payment}

📦 Tanlangan mahsulotlar:
${itemsText}
💰 JAMI SUMMA: ${formatUsd(totalUsd)} (~${formatUzs(totalUzs)})
⏰ Vaqt: ${dateStr}`;

        // 1. Telegram bot orqali AVTOMATIK yuborish!
        const sent = await sendToTelegramBot(telegramMessage);

        const tgDirectUrl = `https://t.me/${TELEGRAM_CONFIG.managerUsername}?text=${encodeURIComponent(telegramMessage)}`;

        // Muvaffaqiyatli qabul qilingani haqida chiroyli xabar chiqarish
        modalSummary.innerHTML = `
            <div style="text-align: center; padding: 25px 15px;">
                <div style="font-size: 3rem; margin-bottom: 12px;">🎉</div>
                <h3 style="color: #26201c; font-size: 1.4rem; margin-bottom: 8px;">Buyurtmangiz Qabul Qilindi!</h3>
                <p style="color: #6c6258; font-size: 0.95rem; margin-bottom: 20px; line-height: 1.5;">
                    Rahmat, <strong>${name}</strong>! ${sent ? "Buyurtmangiz Telegramimizga yetib bordi. Tez orada operatorimiz siz bilan bog'lanadi." : "Buyurtmani yakunlash uchun pastdagi tugmani bosing: buyurtma matni Telegramda tayyor bo'lib ochiladi, faqat yuborish qoladi."}
                </p>
                <a href="${tgDirectUrl}" target="_blank" class="btn ${sent ? 'btn-outline' : 'btn-primary'} btn-block" style="font-size: 0.9rem; padding: 10px 18px; text-decoration: none;">
                    💬 ${sent ? 'Telegramda @' + TELEGRAM_CONFIG.managerUsername + ' bilan yozishish' : 'Buyurtmani Telegramda yuborish'}
                </a>
            </div>
        `;
        orderForm.style.display = 'none';

        // Savatni tozalash va hisoblagichni yangilash
        cart = [];
        updateCartUI();
        showToast(sent ? "Buyurtma Telegramga muvaffaqiyatli yuborildi! ✅" : "Buyurtma tayyor — Telegramda yuboring");

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    // --- Contact Form (Tezkor Buyurtma) ---
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-contact-btn');
            const origText = submitBtn ? submitBtn.innerHTML : 'Yuborish';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '⏳ Yuborilmoqda...';
            }

            const name = document.getElementById('c-name').value.trim();
            const phone = document.getElementById('c-phone').value.trim();
            const note = document.getElementById('c-note') ? document.getElementById('c-note').value.trim() : '';
            const dateStr = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

            const quickMessage = 
`📞 TEZKOR QO'NG'IROQ SO'ROVI — GORNITSA

👤 Ism: ${name}
📞 Telefon: ${phone}
📝 Qiziqqan mahsulot: ${note || "Katalog bo'yicha maslahat"}
⏰ Vaqt: ${dateStr}`;

            await sendToTelegramBot(quickMessage);

            contactForm.reset();
            showToast(`Rahmat, ${name}! So'rovingiz Telegramga yuborildi. ✅`);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origText;
            }
        });
    }

    // Initialize UI
    updateCartUI();
});
