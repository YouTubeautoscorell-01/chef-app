/* ===========================================
   CHEF SCRIPT.JS
   PART 4A-1
=========================================== */

const ordersContainer =
document.getElementById("ordersContainer");

const emptyOrders =
document.getElementById("emptyOrders");

/* =========================
   LOAD ORDERS
========================= */

function loadOrders(){

const q = fb.query(

fb.collection(db,"orders"),

fb.orderBy("createdAt","desc")

);

fb.onSnapshot(q,(snapshot)=>{

ordersContainer.innerHTML="";

if(snapshot.empty){

ordersContainer.style.display="none";

emptyOrders.style.display="block";

return;

}

ordersContainer.style.display="grid";

emptyOrders.style.display="none";

snapshot.forEach((docSnap)=>{

const order = docSnap.data();

const id = docSnap.id;

let itemsHTML = "";

if(order.items){

order.items.forEach(item=>{

itemsHTML += `

<p>

🍽 ${item.qty} × ${item.name}

&nbsp;&nbsp;

₹${item.price}

</p>

`;

});

}

const card = document.createElement("div");

card.className = "order-card";

card.innerHTML = `

<h2>
📞 ${order.customerPhone || "No Number"}
</h2>

<h3>
Ordered Items
</h3>

${itemsHTML}

<div class="total">
Total : ₹${order.total}
</div>

<div class="button-group">

<button
class="call-btn"
onclick="callCustomer('${order.customerPhone || ""}')">

📞 Call Customer

</button>

<button
class="delete-btn"
onclick="deleteOrder('${id}')">

🗑 Delete Order

</button>

</div>

`;

ordersContainer.appendChild(card);

});

});

}

/* ===========================================
   PART 4B
   CALL CUSTOMER + DELETE ORDER
=========================================== */

/* =========================
   CALL CUSTOMER
========================= */

function callCustomer(phone){

if(!phone){

alert("Customer mobile number not found.");

return;

}

window.location.href = `tel:${phone}`;

}

/* =========================
   DELETE ORDER
========================= */

async function deleteOrder(id){

const confirmDelete = confirm(
"Delete this order?"
);

if(!confirmDelete){

return;

}

try{

await fb.deleteDoc(

fb.doc(db,"orders",id)

);

}catch(error){

console.log(error);

alert("Unable to delete order.");

}

}

/* =========================
   GLOBAL FUNCTIONS
========================= */

window.callCustomer = callCustomer;

window.deleteOrder = deleteOrder;

/* ===========================================
   PART 4C
   START REALTIME LISTENER
=========================================== */

/* =========================
   START APP
========================= */

document.addEventListener("DOMContentLoaded",()=>{

loadOrders();

});

/* ===========================================
   END OF FILE
=========================================== */