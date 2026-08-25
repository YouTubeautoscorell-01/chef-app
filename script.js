/* ===========================================
   CHEF APP - COMPLETE SCRIPT.JS
   SEPARATE ORDER BOX SYSTEM
=========================================== */


/* =========================
   ELEMENTS
========================= */

const ordersContainer =
  document.getElementById("ordersContainer");

const emptyOrders =
  document.getElementById("emptyOrders");

const notificationSound =
  document.getElementById("notificationSound");


/* =========================
   STATE
========================= */

let firstLoad = true;


/* ===========================================
   LOAD ORDERS
=========================================== */

function loadOrders() {

  /* Firebase ready check */

  if (!window.db || !window.fb) {

    setTimeout(() => {

      loadOrders();

    }, 300);

    return;

  }


  /* =========================
     ORDERS QUERY
  ========================= */

  const q = fb.query(

    fb.collection(
      db,
      "orders"
    ),

    fb.orderBy(
      "createdAt",
      "desc"
    )

  );


  /* =========================
     REALTIME LISTENER
  ========================= */

  fb.onSnapshot(

    q,

    (snapshot) => {


      /* =========================
         NEW ORDER DETECTION
      ========================= */

      if (!firstLoad) {

        const newOrders =
          snapshot.docChanges()
            .filter(
              change =>
                change.type === "added"
            );


        if (newOrders.length > 0) {

          playNotification();

        }

      }


      firstLoad = false;


      /* =========================
         EMPTY ORDERS
      ========================= */

      if (snapshot.empty) {

        ordersContainer.style.display =
          "none";

        emptyOrders.style.display =
          "block";

        return;

      }


      /* =========================
         SHOW ORDERS
      ========================= */

      ordersContainer.style.display =
        "grid";

      emptyOrders.style.display =
        "none";


      /* Clear old cards */

      ordersContainer.innerHTML = "";


      /* =========================
         CREATE SEPARATE BOX
         FOR EVERY ORDER
      ========================= */

      snapshot.forEach(
        (docSnap) => {

          const order =
            docSnap.data();

          const id =
            docSnap.id;


          /* =========================
             ITEMS
          ========================= */

          let itemsHTML = "";


          if (
            Array.isArray(
              order.items
            )
          ) {

            order.items.forEach(
              (item) => {

                itemsHTML += `

                  <p>

                    🍽
                    ${escapeHTML(item.qty)}
                    ×
                    ${escapeHTML(item.name)}

                    &nbsp;&nbsp;

                    ₹${escapeHTML(item.price)}

                  </p>

                `;

              }
            );

          }


          /* =========================
             ORDER CARD
          ========================= */

          const card =
            document.createElement(
              "div"
            );


          card.className =
            "order-card";


          card.innerHTML = `

            <div class="order-header">

              <h2>

                📞
                ${
                  escapeHTML(
                    order.customerPhone ||
                    "No Number"
                  )
                }

              </h2>

              <span class="new-order-label">

                ORDER

              </span>

            </div>


            <h3>

              Ordered Items

            </h3>


            <div class="order-items">

              ${itemsHTML}

            </div>


            <div class="total">

              Total :
              ₹${escapeHTML(
                order.total || 0
              )}

            </div>


            <div class="button-group">


              <button
                class="call-btn"
                onclick="callCustomer(
                  '${escapeAttribute(
                    order.customerPhone || ""
                  )}'
                )">

                📞 Call Customer

              </button>


              <button
                class="delete-btn"
                onclick="deleteOrder(
                  '${escapeAttribute(id)}'
                )">

                🗑 Delete Order

              </button>


            </div>

          `;


          ordersContainer.appendChild(
            card
          );

        }
      );

    },


    /* =========================
       FIREBASE ERROR
    ========================= */

    (error) => {

      console.error(
        "CHEF FIREBASE ERROR:",
        error
      );


      ordersContainer.style.display =
        "grid";

      emptyOrders.style.display =
        "none";


      ordersContainer.innerHTML = `

        <div class="order-card">

          <h2>
            Firebase Error
          </h2>

          <p>
            ${escapeHTML(
              error.message
            )}
          </p>

        </div>

      `;

    }

  );

}


/* ===========================================
   NOTIFICATION
=========================================== */

function playNotification() {


  /* =========================
     SOUND
  ========================= */

  if (notificationSound) {

    notificationSound.currentTime = 0;


    const playPromise =
      notificationSound.play();


    if (
      playPromise &&
      typeof playPromise.catch ===
      "function"
    ) {

      playPromise.catch(
        (error) => {

          console.log(
            "Notification sound blocked:",
            error
          );

        }
      );

    }

  }


  /* =========================
     VIBRATION
  ========================= */

  if (
    "vibrate" in navigator
  ) {

    navigator.vibrate([

      300,
      200,
      300,
      200,
      500

    ]);

  }


  /* =========================
     VISUAL TOAST
  ========================= */

  showNotification();

}


/* ===========================================
   NOTIFICATION TOAST
=========================================== */

function showNotification() {


  /* Remove old toast */

  const oldToast =
    document.getElementById(
      "chefToast"
    );


  if (oldToast) {

    oldToast.remove();

  }


  /* Create toast */

  const toast =
    document.createElement(
      "div"
    );


  toast.id =
    "chefToast";


  toast.innerHTML =
    "🔔 NEW ORDER RECEIVED";


  document.body.appendChild(
    toast
  );


  /* Remove after 4 seconds */

  setTimeout(() => {

    if (toast) {

      toast.remove();

    }

  }, 4000);

}


/* ===========================================
   CALL CUSTOMER
=========================================== */

function callCustomer(phone) {


  if (!phone) {

    alert(
      "Customer mobile number not found."
    );

    return;

  }


  window.location.href =
    `tel:${phone}`;

}


/* ===========================================
   DELETE ORDER
=========================================== */

async function deleteOrder(id) {


  if (!id) {

    return;

  }


  const confirmDelete =
    confirm(
      "Delete this order?"
    );


  if (!confirmDelete) {

    return;

  }


  try {


    await fb.deleteDoc(

      fb.doc(
        db,
        "orders",
        id
      )

    );


  } catch (error) {


    console.error(
      "Delete order error:",
      error
    );


    alert(
      "Unable to delete order."
    );

  }

}


/* ===========================================
   SAFE HTML
=========================================== */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ===========================================
   SAFE ATTRIBUTE
=========================================== */

function escapeAttribute(value) {

  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");

}


/* ===========================================
   GLOBAL FUNCTIONS
=========================================== */

window.callCustomer =
  callCustomer;

window.deleteOrder =
  deleteOrder;


/* ===========================================
   START CHEF APP
=========================================== */

function startChefApp() {

  loadOrders();

}


/* =========================
   DOM READY
========================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startChefApp
  );

} else {

  startChefApp();

}


/* ===========================================
   END
=========================================== */
