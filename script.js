const products = {
  start: {
    id: "start",
    title: "7 днів легкого старту",
    description: "Домашні тренування + базові правила харчування",
    price: 299
  },
  slim21: {
    id: "slim21",
    title: "21 день схуднення",
    description: "Тренування, план харчування, список продуктів і трекер",
    price: 799
  },
  premium30: {
    id: "premium30",
    title: "30 днів фітнесу + меню",
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
const year = document.getElementById("year");

let cart = loadCart();

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
  cartCount.textContent = getCartCount();
  cartTotal.textContent = formatPrice(getCartTotal());

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
  cartPanel.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartPanel.classList.remove("active");
  document.body.style.overflow = "";
}

function getOrderSummary() {
  if (cart.length === 0) {
    return "";
  }

  return cart
    .map((item) => {
      const product = products[item.id];
      return `${product.title} x${item.quantity}`;
    })
    .join(", ");
}

function fillFormFromCart() {
  const summary = getOrderSummary();

  closeCart();

  document.getElementById("contact").scrollIntoView({
    behavior: "smooth"
  });

  if (!summary) {
    formMessage.textContent = "Спочатку додайте програму в кошик.";
    return;
  }

  const fullMessage = `Хочу оформити замовлення: ${summary}. Сума: ${formatPrice(getCartTotal())}`;
  orderForm.elements.message.value = fullMessage;
  formMessage.textContent = "Дані з кошика додано у форму заявки.";
}

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    addToCart(button.dataset.id);
  });
});

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
clearCartBtn.addEventListener("click", clearCart);
checkoutBtn.addEventListener("click", fillFormFromCart);

cartPanel.addEventListener("click", (event) => {
  if (event.target === cartPanel) {
    closeCart();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
  }
});

year.textContent = new Date().getFullYear();

renderCart();
