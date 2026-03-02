const branchId="main";
let cart={};
let minimumOrder = 100;
let deliveryCharge = 20;

db.collection("categories")
  .where("branchId","==",branchId)
  .onSnapshot(catSnap=>{
    menuContainer.innerHTML="";
    catSnap.forEach(catDoc=>{
      const cat=catDoc.data();
      menuContainer.innerHTML+=`<h2>${cat.name}</h2>`;

      db.collection("menu")
        .where("categoryId","==",catDoc.id)
        .where("active","==",true)
        .onSnapshot(menuSnap=>{
          menuSnap.forEach(doc=>{
            const item=doc.data();
            menuContainer.innerHTML+=`
              <div>
                ${item.name} - ₹${item.price}
                <button onclick="addToCart('${doc.id}','${item.name}',${item.price})">
                  Add
                </button>
              </div>
            `;
          });
        });
    });
  });

db.collection("combos")
  .where("branchId","==",branchId)
  .where("active","==",true)
  .onSnapshot(snapshot=>{
    comboContainer.innerHTML="";
    snapshot.forEach(doc=>{
      const combo=doc.data();
      comboContainer.innerHTML+=`
        <div>
          ${combo.name} - ₹${combo.price}
          <button onclick="addToCart('combo_${doc.id}','${combo.name}',${combo.price})">
            Add Combo
          </button>
        </div>
      `;
    });
  });

function addToCart(id,name,price){
  if(cart[id]) cart[id].qty++;
  else cart[id]={name,price,qty:1};
  updateCart();
}

function updateCart(){
  cartItems.innerHTML="";
  let subtotal=0;

  for(let id in cart){
    const item=cart[id];
    subtotal+=item.price*item.qty;
    cartItems.innerHTML+=`
      <div>
        ${item.name} x${item.qty}
      </div>
    `;
  }

  let total=subtotal;
  if(subtotal < minimumOrder){
    total += deliveryCharge;
  }

  cartTotal.innerText=total;
}

function sendWhatsAppOrder(){
  const name=customerName.value.trim();
  const phone=customerPhone.value.trim();
  const address=customerAddress.value.trim();

  if(Object.keys(cart).length===0) return alert("Cart empty");
  if(!name||!phone||!address) return alert("Fill delivery details");

  let subtotal=0;
  for(let id in cart){
    subtotal+=cart[id].price*cart[id].qty;
  }

  let total=subtotal;
  if(subtotal < minimumOrder){
    total += deliveryCharge;
  }

  db.collection("orders").add({
    branchId: branchId,
    customerName: name,
    customerPhone: phone,
    customerAddress: address,
    items: Object.values(cart),
    subtotal: subtotal,
    deliveryCharge: subtotal < minimumOrder ? deliveryCharge : 0,
    total: total,
    status: "Pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(docRef=>{
      let message=`Order ID: ${docRef.id}%0A`;
      message+=`Name: ${name}%0A`;
      message+=`Address: ${address}%0A%0A`;

      for(let id in cart){
        message+=`${cart[id].name} x${cart[id].qty}%0A`;
      }

      message+=`%0ATotal: ₹${total}`;

      window.open(`https://wa.me/918669181007?text=${message}`);
      cart={};
      updateCart();
  });
}
