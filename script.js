let siteSettings = JSON.parse(localStorage.getItem("siteSettings")) || { title:"Cafe Adda" };
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let menu = JSON.parse(localStorage.getItem("menu")) || [];
let combos = JSON.parse(localStorage.getItem("combos")) || [];
let cart = {};

document.getElementById("siteTitleDisplay").innerText = siteSettings.title;

function renderCombos(){
  comboContainer.innerHTML="";
  combos.filter(c=>c.active).forEach(combo=>{
    comboContainer.innerHTML+=`
      <div class="card" style="border:1px solid gold;">
        <h3>${combo.name}</h3>
        <p>₹${combo.price}</p>
        <button onclick="addComboToCart(${combo.id})">Add Combo</button>
      </div>
    `;
  });
}

function renderMenu(){
  menuContainer.innerHTML="";
  categories.forEach(cat=>{
    menuContainer.innerHTML+=`<h2>${cat.name}</h2>`;
    menu.filter(i=>i.categoryId===cat.id && i.active)
        .forEach(item=>{
          menuContainer.innerHTML+=`
            <div class="card">
              <h3>${item.name}</h3>
              <p>₹${item.price}</p>
              ${item.bestseller?"⭐ Bestseller":""}
              <button onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
          `;
        });
  });
}

function addToCart(id){
  const item = menu.find(i=>i.id===id);
  if(cart[id]) cart[id].qty++;
  else cart[id]={name:item.name,price:item.price,qty:1};
  updateCart();
  toggleCart();
}

function addComboToCart(id){
  const combo = combos.find(c=>c.id===id);
  cart["combo_"+id]={name:combo.name+" (Combo)",price:combo.price,qty:1};
  updateCart();
  toggleCart();
}

function changeQty(id,change){
  if(!cart[id]) return;
  cart[id].qty+=change;
  if(cart[id].qty<=0) delete cart[id];
  updateCart();
}

function updateCart(){
  cartItems.innerHTML="";
  let total=0,count=0;
  for(let id in cart){
    const item=cart[id];
    total+=item.price*item.qty;
    count+=item.qty;
    cartItems.innerHTML+=`
      <div class="card">
        ${item.name}
        <br>
        ₹${item.price} × ${item.qty}
        <br>
        <button onclick="changeQty('${id}',-1)">−</button>
        <button onclick="changeQty('${id}',1)">+</button>
      </div>
    `;
  }
  cartTotal.innerText=total;
  cartCount.innerText=count;
}

function toggleCart(){
  cartPanel.classList.toggle("active");
}

function sendWhatsAppOrder(){
  const name=customerName.value.trim();
  const phone=customerPhone.value.trim();
  const address=customerAddress.value.trim();

  if(Object.keys(cart).length===0) return alert("Cart empty");
  if(!name||!phone||!address) return alert("Fill delivery details");

  let message=`Hello ${siteSettings.title}!%0A%0A`;
  message+=`Name: ${name}%0APhone: ${phone}%0AAddress: ${address}%0A%0AOrder:%0A`;

  let total=0;
  for(let id in cart){
    const item=cart[id];
    total+=item.price*item.qty;
    message+=`${item.name} x${item.qty} - ₹${item.price*item.qty}%0A`;
  }
  message+=`%0ATotal: ₹${total}`;

  window.open(`https://wa.me/918669181007?text=${message}`);
  cart={};
  updateCart();
  toggleCart();
}

renderCombos();
renderMenu();
