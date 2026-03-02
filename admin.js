let siteSettings = JSON.parse(localStorage.getItem("siteSettings")) || {
  title: "Cafe Adda"
};

let categories = JSON.parse(localStorage.getItem("categories")) || [];
let menu = JSON.parse(localStorage.getItem("menu")) || [];
let combos = JSON.parse(localStorage.getItem("combos")) || [];

let editingId = null;

function saveAll(){
  localStorage.setItem("siteSettings", JSON.stringify(siteSettings));
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("menu", JSON.stringify(menu));
  localStorage.setItem("combos", JSON.stringify(combos));
}

/* WEBSITE TITLE */

function updateTitle(){
  siteSettings.title = siteTitle.value;
  saveAll();
  alert("Title Updated");
}

/* CATEGORY */

function addCategory(){
  if(!categoryName.value) return;

  categories.push({
    id: Date.now(),
    name: categoryName.value
  });

  categoryName.value="";
  saveAll();
  renderCategories();
}

function renderCategories(){
  categoryList.innerHTML="";
  categorySelect.innerHTML="";

  categories.forEach(cat=>{
    categoryList.innerHTML+=`
      <div>${cat.name}</div>
    `;
    categorySelect.innerHTML+=`
      <option value="${cat.id}">${cat.name}</option>
    `;
  });
}

/* MENU */

function saveItem(){
  if(!itemName.value || !itemPrice.value) return;

  if(editingId){
    const item = menu.find(i=>i.id===editingId);
    item.name = itemName.value;
    item.price = Number(itemPrice.value);
    item.categoryId = Number(categorySelect.value);
    item.bestseller = itemBest.checked;
    item.active = itemActive.checked;
    editingId = null;
  } else {
    menu.push({
      id: Date.now(),
      name: itemName.value,
      price: Number(itemPrice.value),
      categoryId: Number(categorySelect.value),
      bestseller: itemBest.checked,
      active: itemActive.checked
    });
  }

  itemName.value="";
  itemPrice.value="";
  itemBest.checked=false;
  itemActive.checked=true;

  saveAll();
  renderMenu();
  renderComboItemSelection();
}

function renderMenu(){
  menuList.innerHTML="";

  menu.forEach(item=>{
    const category = categories.find(c=>c.id===item.categoryId);

    menuList.innerHTML+=`
      <div class="card ${!item.active ? 'hidden' : ''}">
        <b>${item.name}</b> - ₹${item.price}
        (${category ? category.name : ""})
        ${item.bestseller ? "⭐" : ""}
        <br>
        <button onclick="editItem(${item.id})">Edit</button>
        <button onclick="deleteItem(${item.id})">Delete</button>
      </div>
    `;
  });
}

function editItem(id){
  const item = menu.find(i=>i.id===id);
  editingId = id;
  itemName.value = item.name;
  itemPrice.value = item.price;
  categorySelect.value = item.categoryId;
  itemBest.checked = item.bestseller;
  itemActive.checked = item.active;
}

function deleteItem(id){
  menu = menu.filter(item=>item.id!==id);
  saveAll();
  renderMenu();
  renderComboItemSelection();
}

/* COMBO SYSTEM */

function renderComboItemSelection(){
  comboItemsSelection.innerHTML="";

  menu.forEach(item=>{
    comboItemsSelection.innerHTML+=`
      <label>
        <input type="checkbox" value="${item.id}">
        ${item.name} (₹${item.price})
      </label><br>
    `;
  });
}

function addCombo(){

  const selected = [...comboItemsSelection.querySelectorAll("input:checked")]
                   .map(cb=>Number(cb.value));

  if(!comboName.value || !comboPrice.value || selected.length===0){
    alert("Fill all combo details");
    return;
  }

  combos.push({
    id: Date.now(),
    name: comboName.value,
    price: Number(comboPrice.value),
    items: selected,
    active: comboActive.checked
  });

  comboName.value="";
  comboPrice.value="";
  comboActive.checked=true;

  saveAll();
  renderCombos();
}

function renderCombos(){
  comboList.innerHTML="";

  combos.forEach(combo=>{
    comboList.innerHTML+=`
      <div class="card ${!combo.active?'hidden':''}">
        <b>${combo.name}</b> - ₹${combo.price}
        <br>
        ${combo.items.map(id=>{
          const item = menu.find(i=>i.id===id);
          return item ? item.name : "";
        }).join(", ")}
        <br>
        <button onclick="toggleCombo(${combo.id})">
          ${combo.active?"Disable":"Enable"}
        </button>
        <button onclick="deleteCombo(${combo.id})">Delete</button>
      </div>
    `;
  });
}

function toggleCombo(id){
  const combo = combos.find(c=>c.id===id);
  combo.active = !combo.active;
  saveAll();
  renderCombos();
}

function deleteCombo(id){
  combos = combos.filter(c=>c.id!==id);
  saveAll();
  renderCombos();
}

/* INIT */

siteTitle.value = siteSettings.title;
renderCategories();
renderMenu();
renderComboItemSelection();
renderCombos();
