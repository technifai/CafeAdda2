let currentBranch = null;

function login(){
  auth.signInWithEmailAndPassword(email.value,password.value)
    .then(async (cred)=>{

      const userDoc = await db.collection("users")
        .doc(cred.user.uid).get();

      if(!userDoc.exists || userDoc.data().role !== "admin"){
        alert("Not authorized");
        return;
      }

      currentBranch = userDoc.data().branchId;

      loginBox.style.display="none";
      adminPanel.style.display="block";

      loadCategories();
      loadMenu();
      loadCombos();
      loadOrders();
    })
    .catch(error=>alert(error.message));
}

/* CATEGORY */

function addCategory(){
  db.collection("categories").add({
    branchId: currentBranch,
    name: categoryName.value,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  categoryName.value="";
}

function loadCategories(){
  db.collection("categories")
    .where("branchId","==",currentBranch)
    .onSnapshot(snapshot=>{
      categoryList.innerHTML="";
      categorySelect.innerHTML="";
      snapshot.forEach(doc=>{
        const cat=doc.data();
        categoryList.innerHTML+=`<div>${cat.name}</div>`;
        categorySelect.innerHTML+=`<option value="${doc.id}">${cat.name}</option>`;
      });
    });
}

/* MENU */

function addItem(){
  db.collection("menu").add({
    branchId: currentBranch,
    categoryId: categorySelect.value,
    name: itemName.value,
    price: Number(itemPrice.value),
    bestseller: itemBest.checked,
    active: itemActive.checked,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  itemName.value="";
  itemPrice.value="";
  itemBest.checked=false;
  itemActive.checked=true;
}

function loadMenu(){
  db.collection("menu")
    .where("branchId","==",currentBranch)
    .onSnapshot(snapshot=>{
      menuList.innerHTML="";
      comboItemsSelection.innerHTML="";
      snapshot.forEach(doc=>{
        const item=doc.data();
        menuList.innerHTML+=`
          <div>
            ${item.name} - ₹${item.price}
          </div>
        `;
        comboItemsSelection.innerHTML+=`
          <label>
            <input type="checkbox" value="${doc.id}">
            ${item.name}
          </label><br>
        `;
      });
    });
}

/* COMBO */

function addCombo(){
  const selected=[...comboItemsSelection.querySelectorAll("input:checked")]
                  .map(cb=>cb.value);

  db.collection("combos").add({
    branchId: currentBranch,
    name: comboName.value,
    price: Number(comboPrice.value),
    items: selected,
    active: comboActive.checked,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  comboName.value="";
  comboPrice.value="";
}

function loadCombos(){
  db.collection("combos")
    .where("branchId","==",currentBranch)
    .onSnapshot(snapshot=>{
      comboList.innerHTML="";
      snapshot.forEach(doc=>{
        const combo=doc.data();
        comboList.innerHTML+=`
          <div>
            ${combo.name} - ₹${combo.price}
          </div>
        `;
      });
    });
}

/* ORDERS */

function loadOrders(){
  db.collection("orders")
    .where("branchId","==",currentBranch)
    .orderBy("createdAt","desc")
    .onSnapshot(snapshot=>{
      orderList.innerHTML="";
      snapshot.forEach(doc=>{
        const order=doc.data();
        orderList.innerHTML+=`
          <div style="border:1px solid #ccc;padding:10px;margin:10px 0;">
            <b>Order ID:</b> ${doc.id}<br>
            <b>Name:</b> ${order.customerName}<br>
            <b>Total:</b> ₹${order.total}<br>
            <b>Status:</b> ${order.status}<br>
            <button onclick="updateStatus('${doc.id}','Preparing')">Preparing</button>
            <button onclick="updateStatus('${doc.id}','Completed')">Completed</button>
          </div>
        `;
      });
    });
}

function updateStatus(id,status){
  db.collection("orders").doc(id).update({status});
}
