
/* ===========================================
   CHEF APP - ORIGINAL DESIGN VERSION
   LIVE ORDERS + SOUND + VIBRATION + TOAST
=========================================== */

"use strict";

const ordersContainer = document.getElementById("ordersContainer");
const emptyOrders = document.getElementById("emptyOrders");
const notificationSound = document.getElementById("notificationSound");

let firstLoad = true;
let unsubscribeOrders = null;
let audioUnlocked = false;
let pendingNotification = false;

/* =========================
   SAFE HTML
========================= */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function escapeAttribute(value) {
  return escapeHTML(value);
}

/* =========================
   SOUND UNLOCK
   Mobile browsers may require
   a user interaction first.
========================= */

async function unlockNotificationSound() {
  if (!notificationSound || audioUnlocked) return;

  try {
    notificationSound.muted = true;
    notificationSound.currentTime = 0;

    await notificationSound.play();

    notificationSound.pause();
    notificationSound.currentTime = 0;
    notificationSound.muted = false;

    audioUnlocked = true;

    if (pendingNotification) {
      pendingNotification = false;
      playNotification();
    }
  } catch (error) {
    notificationSound.muted = false;
    console.log("Tap the page once to enable notification sound.");
  }
}

document.addEventListener("pointerdown", unlockNotificationSound, {
  once: true
});

/* =========================
   LOAD ORDERS
========================= */

function loadOrders() {
  if (!window.db || !window.fb) {
    setTimeout(loadOrders, 300);
    return;
  }

  if (unsubscribeOrders) {
    unsubscribeOrders();
    unsubscribeOrders = null;
  }

  const q = fb.query(
    fb.collection(db, "orders"),
    fb.orderBy("createdAt", "desc")
  );

  unsubscribeOrders = fb.onSnapshot(
    q,
    snapshot => {
      /* New order notification; skip initial page load. */
      if (!firstLoad) {
        const addedOrders = snapshot.docChanges().filter(
          change => change.type === "added"
        );

        if (addedOrders.length > 0) {
          playNotification();
        }
      }

      firstLoad = false;

      if (snapshot.empty) {
        ordersContainer.style.display = "none";
        emptyOrders.style.display = "block";
        ordersContainer.innerHTML = "";
        return;
      }

      ordersContainer.style.display = "grid";
      emptyOrders.style.display = "none";
      ordersContainer.innerHTML = "";

      snapshot.forEach(docSnap => {
        const order = docSnap.data();
        const id = docSnap.id;
        const phone = String(order.customerPhone || "");

        let itemsHTML = "";

        if (Array.isArray(order.items)) {
          order.items.forEach(item => {
            const qty = item.qty ?? item.quantity ?? 1;
            const name = item.name || item.title || "Food item";
            const price = Number(item.price) || 0;

            itemsHTML += `
              <p>
                🍽 ${escapeHTML(qty)} × ${escapeHTML(name)}
                &nbsp;&nbsp; ₹${escapeHTML(price)}
              </p>
            `;
          });
        }

        const card = document.createElement("div");
        card.className = "order-card";

        card.innerHTML = `
          <div class="order-header">
            <h2>
              📞 ${escapeHTML(phone || "No Number")}
            </h2>

            <span class="new-order-label">ORDER</span>
          </div>

          <h3>Ordered Items</h3>

          <div class="order-items">
            ${itemsHTML || "<p>No items found.</p>"}
          </div>

          <div class="total">
            Total : ₹${escapeHTML(order.total ?? 0)}
          </div>

          <div class="button-group">
            <button type="button" class="call-btn"
              data-action="call"
              data-phone="${escapeAttribute(phone)}">
              📞 Call Customer
            </button>

            <button type="button" class="delete-btn"
              data-action="delete"
              data-id="${escapeAttribute(id)}">
              🗑 Delete Order
            </button>
          </div>
        `;

        ordersContainer.appendChild(card);
      });
    },
    error => {
      console.error("CHEF FIREBASE ERROR:", error);

      ordersContainer.style.display = "grid";
      emptyOrders.style.display = "none";

      ordersContainer.innerHTML = `
        <div class="order-card">
          <h2>Firebase Error</h2>
          <p>${escapeHTML(error.message)}</p>
        </div>
      `;
    }
  );
}

/* =========================
   NOTIFICATION
========================= */

async function playNotification() {
  showNotification();

  if ("vibrate" in navigator) {
    navigator.vibrate([300, 200, 300, 200, 500]);
  }

  if (!notificationSound) return;

  if (!audioUnlocked) {
    pendingNotification = true;
    return;
  }

  try {
    notificationSound.currentTime = 0;
    await notificationSound.play();
  } catch (error) {
    console.log("Notification sound could not play:", error);
  }
}

/* =========================
   NOTIFICATION TOAST
========================= */

function showNotification() {
  const oldToast = document.getElementById("chefToast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.id = "chefToast";
  toast.textContent = "🔔 NEW ORDER RECEIVED";

  Object.assign(toast.style, {
    position: "fixed",
    top: "85px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#D4AF37",
    color: "#3B0A16",
    padding: "14px 20px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    textAlign: "center",
    width: "max-content",
    maxWidth: "92vw",
    zIndex: "99999",
    boxShadow: "0 8px 25px rgba(0,0,0,.4)"
  });

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}

/* =========================
   CALL CUSTOMER
========================= */

function callCustomer(phone) {
  const cleanPhone = String(phone || "").replace(/[^\d+]/g, "");

  if (!cleanPhone) {
    alert("Customer mobile number not found.");
    return;
  }

  window.location.href = `tel:${cleanPhone}`;
}

/* =========================
   DELETE ORDER
========================= */

async function deleteOrder(id) {
  if (!id) return;

  if (!confirm("Delete this order?")) return;

  try {
    await fb.deleteDoc(fb.doc(db, "orders", id));
  } catch (error) {
    console.error("Delete order error:", error);
    alert("Unable to delete order. Check Firebase permissions.");
  }
}

/* =========================
   BUTTON EVENTS
========================= */

ordersContainer.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "call") {
    callCustomer(button.dataset.phone);
  }

  if (button.dataset.action === "delete") {
    deleteOrder(button.dataset.id);
  }
});

window.callCustomer = callCustomer;
window.deleteOrder = deleteOrder;

/* =========================
   START APP
========================= */

function startChefApp() {
  loadOrders();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startChefApp, {
    once: true
  });
} else {
  startChefApp();
}
