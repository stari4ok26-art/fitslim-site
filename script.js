document.addEventListener("DOMContentLoaded", () => {
  const products = {
    start: {
      id: "start",
      title: "СТАРТ 7 днів",
      formValue: "СТАРТ 7 днів — безкоштовно",
      description: "Безкоштовний стартовий план: домашні тренування + базові правила харчування",
      price: 0
    },
    slim21: {
      id: "slim21",
      title: "21 день схуднення",
      formValue: "21 день схуднення — 799 грн",
      description: "Тренування, план харчування, список продуктів і трекер",
      price: 799
    },
    premium30: {
      id: "premium30",
      title: "30 днів фітнесу + меню",
      formValue: "30 днів фітнесу + меню — 1299 грн",
      description: "Повна програма на 30 днів з меню та чек-листами",
      price: 1299
    }
  };

  const cartKey = "fitslim_cart";

  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");

  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartPanel = document.getElementById("cartPanel");
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");

  const orderForm = document.getElementById("orderForm");
  const formMessage = document.getElementById("formMessage");
  const clientProgram = document.getElementById("clientProgram");
  const clientMessage = document.getElementById("clientMessage");
  const year = document.getElementById("year");

  let cart = loadCart();
  let isMenuOpen = false;

  function loadCart() {
    const savedCart = localStorage.getItem(cartKey);

    if (!savedCart) {
      return [];
    }

    try {
      const parsedCart = JSON.parse(savedCart);

      if (!Array.isArray(parsedCart)) {
        return [];
      }

      return parsedCart.filter((item) => products[item.id]);
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }

  function formatPrice(price) {
    if (price === 0) {
      return "Безкоштовно";
    }

    return `${price.toLocaleString("uk-UA")} грн`;
  }

  function formatTotal(price) {
    return `${price.toLocaleString("uk-UA")} грн`;
  }

  function getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => {
      const product = products[item.id];
      return sum + product.price * item.quantity;
    }, 0);
  }

  function openMenu() {
    if (!navLinks || !menuBtn) {
      return;
    }

    isMenuOpen = true;
    navLinks.classList.add("active");
    navLinks.style.display = "flex";
    menuBtn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!navLinks || !menuBtn) {
      return;
    }

    isMenuOpen = false;
    navLinks.classList.remove("active");
    navLinks.style.display = "";
    menuBtn.setAttribute("aria-expanded", "false");
  }

  function toggleMenu(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function addToCart(productId) {
    const product = products[productId];

    if (!product) {
      return;
    }

    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: productId,
        quantity: 1
      });
    }

    saveCart();
    renderCart();
    openCart();
  }

  function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId);
    saveCart();
    renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  function renderCart() {
    if (cartCount) {
      cartCount.textContent = getCartCount();
    }

    if (cartTotal) {
      cartTotal.textContent = formatTotal(getCartTotal());
    }

    if (!cartItems) {
      return;
    }

    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="empty-cart">
          Кошик порожній. Оберіть програму, яка вам підходить.
        </div>
      `;
      return;
    }

    cartItems.innerHTML = cart
      .map((item) => {
        const product = products[item.id];
        const itemTotal = product.price * item.quantity;

        return `
          <div class="cart-item">
            <div>
              <h3>${product.title}</h3>
              <p>${product.description}</p>
              <p>Кількість: ${item.quantity}</p>
              <strong>${formatPrice(itemTotal)}</strong>
            </div>

            <button class="remove-item" data-id="${product.id}" type="button">
              Видалити
            </button>
          </div>
        `;
      })
      .join("");

    document.querySelectorAll(".remove-item").forEach((button) => {
      button.addEventListener("click", () => {
        removeFromCart(button.dataset.id);
      });
    });
  }

  function openCart() {
    if (!cartPanel) {
      return;
    }

    cartPanel.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    if (!cartPanel) {
      return;
    }

    cartPanel.classList.remove("active");
    document.body.style.overflow = "";
  }

  function getOrderSummary() {
    if (cart.length === 0) {
      return "Кошик порожній";
    }

    return cart
      .map((item) => {
        const product = products[item.id];
        return `${product.title} x${item.quantity} — ${formatPrice(product.price)}`;
      })
      .join(", ");
  }

  function getDetailedCartText() {
    if (cart.length === 0) {
      return "Кошик порожній";
    }

    return cart
      .map((item) => {
        const product = products[item.id];
        const itemTotal = product.price * item.quantity;

        return `${product.title} — ${item.quantity} шт. — ${formatPrice(itemTotal)}`;
      })
      .join("\n");
  }

  function getPrimaryCartProduct() {
    if (cart.length === 0) {
      return null;
    }

    return products[cart[0].id] || null;
  }

  function showFormMessage(message, type = "success") {
    if (!formMessage) {
      return;
    }

    formMessage.textContent = message;
    formMessage.style.color = type === "error" ? "#dc2626" : "#16a34a";
  }

  function fillFormFromCart() {
    const primaryProduct = getPrimaryCartProduct();

    closeCart();

    const contactSection = document.getElementById("contact");

    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: "smooth"
      });
    }

    if (!primaryProduct) {
      showFormMessage("Спочатку додайте програму в кошик.", "error");
      return;
    }

    if (clientProgram) {
      clientProgram.value = primaryProduct.formValue;
    }

    if (clientMessage) {
      clientMessage.value = `Хочу оформити заявку через кошик.

Обрана програма: ${getOrderSummary()}
Сума: ${formatTotal(getCartTotal())}`;
    }

    showFormMessage("Дані з кошика додано у форму заявки.");
  }

  async function submitFormWithRedirect(event) {
    event.preventDefault();

    if (!orderForm) {
      return;
    }

    const submitButton = orderForm.querySelector('button[type="submit"]');
    const formData = new FormData(orderForm);

    formData.append("Кошик", getOrderSummary());
    formData.append("Деталі кошика", getDetailedCartText());
    formData.append("Сума замовлення", formatTotal(getCartTotal()));
    formData.append("Сайт", "Форма без понтів");
    formData.append("Посилання на сайт", "https://stari4ok26-art.github.io/fitslim-site/");
    formData.append("Дата заявки", new Date().toLocaleString("uk-UA"));

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Відправляємо...";
      }

      showFormMessage("Заявка відправляється...");

      const response = await fetch(orderForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Formspree submission failed");
      }

      clearCart();
      orderForm.reset();

      window.location.href = "thank-you.html";
    } catch (error) {
      console.error(error);

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Відправити заявку";
      }

      showFormMessage(
        "Не вдалося відправити заявку автоматично. Спробуйте ще раз.",
        "error"
      );
    }
  }

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.id);
    });
  });

  if (menuBtn) {
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.addEventListener("click", toggleMenu);
    menuBtn.addEventListener("touchend", toggleMenu);
  }

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!isMenuOpen || !navLinks || !menuBtn) {
      return;
    }

    const clickedInsideMenu = navLinks.contains(event.target);
    const clickedMenuButton = menuBtn.contains(event.target);

    if (!clickedInsideMenu && !clickedMenuButton) {
      closeMenu();
    }
  });

  if (openCartBtn) {
    openCartBtn.addEventListener("click", openCart);
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", closeCart);
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", clearCart);
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", fillFormFromCart);
  }

  if (orderForm) {
    orderForm.addEventListener("submit", submitFormWithRedirect);
  }

  if (cartPanel) {
    cartPanel.addEventListener("click", (event) => {
      if (event.target === cartPanel) {
        closeCart();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closeCart();
    }
  });

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  renderCart();
});
