var INVENTORY_ORDERS_KEY='shopvn_inventory_orders';

function loadInventoryOrders(){
  try{
    var raw=localStorage.getItem(INVENTORY_ORDERS_KEY);
    if(!raw)return [];
    var parsed=JSON.parse(raw);
    return Array.isArray(parsed)?parsed:[];
  }catch(e){
    console.error('Không thể đọc đơn tồn kho',e);
    return [];
  }
}

function saveInventoryOrders(orders){
  try{
    localStorage.setItem(INVENTORY_ORDERS_KEY,JSON.stringify(orders));
  }catch(e){
    console.error('Không thể lưu đơn tồn kho',e);
  }
}

function initOrderDetailPage(){
  var indexStr=localStorage.getItem('inventoryOrderSelectedIndex');
  var mode=localStorage.getItem('inventoryOrderSelectedMode')||'view';
  var index=indexStr?parseInt(indexStr,10):NaN;
  var orders=loadInventoryOrders();

  var idInput=document.getElementById('detail-order-id');
  var customerInput=document.getElementById('detail-order-customer');
  var itemsInput=document.getElementById('detail-order-items');
  var amountInput=document.getElementById('detail-order-amount');
  var paymentSelect=document.getElementById('detail-order-payment');
  var receivedSelect=document.getElementById('detail-order-received');
  var form=document.getElementById('orderDetailForm');
  var saveBtn=document.getElementById('detail-save-btn');

  if(!form||!idInput||!customerInput||!itemsInput||!amountInput||!paymentSelect||!receivedSelect){
    return;
  }

  var isView=mode==='view';
  [idInput,customerInput,itemsInput,amountInput,paymentSelect,receivedSelect].forEach(function(el){
    el.disabled=isView;
  });
  if(isView&&saveBtn){
    saveBtn.style.display='none';
  }

  var order=null;
  if(!isNaN(index)&&orders[index]){
    order=orders[index];
  }

  if(order){
    idInput.value=order.id||'';
    customerInput.value=order.customer||'';
    itemsInput.value=order.items||'0';
    amountInput.value=order.amount||'';
    paymentSelect.value=order.paymentStatus||'paid';
    receivedSelect.value=order.receivedStatus||'pending';
  }else{
    // Nếu không tìm thấy đơn, disable form
    [idInput,customerInput,itemsInput,amountInput,paymentSelect,receivedSelect].forEach(function(el){
      el.disabled=true;
    });
    if(saveBtn){
      saveBtn.style.display='none';
    }
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(isView)return;
    if(isNaN(index)||!orders[index])return;

    var updated={
      id:idInput.value||'',
      customer:customerInput.value||'',
      items:itemsInput.value||'0',
      amount:amountInput.value||'',
      paymentStatus:paymentSelect.value||'paid',
      receivedStatus:receivedSelect.value||'pending'
    };

    if(!updated.id){
      alert('Vui lòng nhập ID đơn hàng');
      return;
    }

    orders[index]=updated;
    saveInventoryOrders(orders);
    alert('Đã lưu thay đổi đơn hàng');
    goBackToInventoryList();
  });
}

function goBackToInventoryList(){
  window.location.href='inventory-received-orders.html';
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

document.addEventListener('DOMContentLoaded',initOrderDetailPage);
