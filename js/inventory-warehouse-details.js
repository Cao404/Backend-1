var INVENTORY_WAREHOUSE_KEY='shopvn_warehouses';

function loadWarehouses(){
  try{
    var raw=localStorage.getItem(INVENTORY_WAREHOUSE_KEY);
    if(!raw)return [];
    var parsed=JSON.parse(raw);
    return Array.isArray(parsed)?parsed:[];
  }catch(e){
    console.error('Không thể đọc danh sách kho',e);
    return [];
  }
}

function saveWarehouses(warehouses){
  try{
    localStorage.setItem(INVENTORY_WAREHOUSE_KEY,JSON.stringify(warehouses));
  }catch(e){
    console.error('Không thể lưu danh sách kho',e);
  }
}

function initWarehouseDetailPage(){
  var indexStr=localStorage.getItem('inventoryWarehouseSelectedIndex');
  var mode=localStorage.getItem('inventoryWarehouseSelectedMode')||'view';
  var index=indexStr?parseInt(indexStr,10):NaN;
  var warehouses=loadWarehouses();

  var idInput=document.getElementById('detail-wh-id');
  var nameInput=document.getElementById('detail-wh-name');
  var locationInput=document.getElementById('detail-wh-location');
  var managerInput=document.getElementById('detail-wh-manager');
  var phoneInput=document.getElementById('detail-wh-phone');
  var stockInput=document.getElementById('detail-wh-stock');
  var transferInput=document.getElementById('detail-wh-transfer');
  var revenueInput=document.getElementById('detail-wh-revenue');
  var form=document.getElementById('warehouseDetailForm');
  var saveBtn=document.getElementById('wh-detail-save-btn');

  if(!form||!idInput||!nameInput||!locationInput||!managerInput||!phoneInput||!stockInput||!transferInput||!revenueInput){
    return;
  }

  var isView=mode==='view';
  [idInput,nameInput,locationInput,managerInput,phoneInput,stockInput,transferInput,revenueInput].forEach(function(el){
    el.disabled=isView;
  });
  if(isView&&saveBtn){
    saveBtn.style.display='none';
  }

  var warehouse=null;
  if(!isNaN(index)&&warehouses[index]){
    warehouse=warehouses[index];
  }

  if(warehouse){
    idInput.value=warehouse.id||'';
    nameInput.value=warehouse.name||'';
    locationInput.value=warehouse.location||'';
    managerInput.value=warehouse.manager||'';
    phoneInput.value=warehouse.phone||'';
    stockInput.value=warehouse.stock||0;
    transferInput.value=warehouse.transfer||0;
    revenueInput.value=warehouse.revenue||'';
  }else{
    [idInput,nameInput,locationInput,managerInput,phoneInput,stockInput,transferInput,revenueInput].forEach(function(el){
      el.disabled=true;
    });
    if(saveBtn){
      saveBtn.style.display='none';
    }
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(isView)return;
    if(isNaN(index)||!warehouses[index])return;

    var updated={
      id:idInput.value||'',
      name:nameInput.value||'',
      location:locationInput.value||'',
      manager:managerInput.value||'',
      phone:phoneInput.value||'',
      stock:Number(stockInput.value||0),
      transfer:Number(transferInput.value||0),
      revenue:revenueInput.value||''
    };

    if(!updated.id){
      alert('Vui lòng nhập ID kho');
      return;
    }

    warehouses[index]=updated;
    saveWarehouses(warehouses);
    alert('Đã lưu thay đổi kho hàng');
    goBackToWarehouseList();
  });
}

function goBackToWarehouseList(){
  window.location.href='inventory-warehouse.html';
}

function toggleSidebar(){
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed',document.querySelector('.layout').classList.contains('collapsed'));
}

if(localStorage.getItem('sidebarCollapsed')==='true'){
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelector('.layout').classList.add('collapsed');
  });
}

document.addEventListener('DOMContentLoaded',initWarehouseDetailPage);
