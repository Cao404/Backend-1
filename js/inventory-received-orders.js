var INVENTORY_ORDERS_KEY='shopvn_inventory_orders';

var inventoryOrders=[];

var statusText={
  paid:'Đã thanh toán',
  cod:'Đã TUYỆT',
  delivered:'Giao hàng',
  failed:'Thất bại',
  pending:'Đang chờ xử lý'
};

function loadInventoryOrders(){
  try{
    var raw=localStorage.getItem(INVENTORY_ORDERS_KEY);
    if(!raw){
      // seed dữ liệu mẫu lần đầu
      inventoryOrders=[
        {id:'#583488/80',customer:'Nguyễn Văn Minh',items:'03',amount:'6.936.000 ₫',paymentStatus:'paid',receivedStatus:'delivered'},
        {id:'#456754/80',customer:'Trần Thị Bích',items:'05',amount:'5.112.000 ₫',paymentStatus:'cod',receivedStatus:'failed'},
        {id:'#578246/80',customer:'Lê Đức Cường',items:'03',amount:'17.640.000 ₫',paymentStatus:'paid',receivedStatus:'delivered'},
        {id:'#348930/80',customer:'Phạm Văn Mạnh',items:'02',amount:'7.776.000 ₫',paymentStatus:'cod',receivedStatus:'pending'},
        {id:'#391367/80',customer:'Hoàng Thị Lan',items:'07',amount:'3.672.000 ₫',paymentStatus:'cod',receivedStatus:'delivered'},
        {id:'#930447/80',customer:'Vũ Văn Hùng',items:'02',amount:'10.176.000 ₫',paymentStatus:'paid',receivedStatus:'failed'},
        {id:'#462397/80',customer:'Đặng Thị Mai',items:'01',amount:'12.504.000 ₫',paymentStatus:'paid',receivedStatus:'pending'},
        {id:'#472356/80',customer:'Bùi Văn Đức',items:'04',amount:'7.512.000 ₫',paymentStatus:'cod',receivedStatus:'delivered'},
        {id:'#448226/80',customer:'Ngô Thị Hương',items:'06',amount:'5.256.000 ₫',paymentStatus:'cod',receivedStatus:'failed'}
      ];
      saveInventoryOrders();
      return;
    }
    var parsed=JSON.parse(raw);
    inventoryOrders=Array.isArray(parsed)?parsed:[];
    
    // Kiểm tra và cập nhật dữ liệu cũ (có $ hoặc tên tiếng Anh)
    var needsUpdate=false;
    if(inventoryOrders.length>0){
      var firstOrder=inventoryOrders[0];
      // Kiểm tra xem có phải dữ liệu cũ không (có $ hoặc tên tiếng Anh)
      if(firstOrder.amount&&(firstOrder.amount.includes('$')||firstOrder.amount.includes('USD'))){
        needsUpdate=true;
      }
      // Kiểm tra tên tiếng Anh (có dấu chấm giữa tên và họ, hoặc tên thường gặp)
      if(firstOrder.customer&&(firstOrder.customer.includes('.')||firstOrder.customer.includes('Michael')||firstOrder.customer.includes('Theresa')||firstOrder.customer.includes('William')||firstOrder.customer.includes('Sarah')||firstOrder.customer.includes('Joe')||firstOrder.customer.includes('Ralph')||firstOrder.customer.includes('Leonie'))){
        needsUpdate=true;
      }
    }
    
    // Nếu cần cập nhật, thay thế toàn bộ dữ liệu
    if(needsUpdate){
      inventoryOrders=[
        {id:'#583488/80',customer:'Nguyễn Văn Minh',items:'03',amount:'6.936.000 ₫',paymentStatus:'paid',receivedStatus:'delivered'},
        {id:'#456754/80',customer:'Trần Thị Bích',items:'05',amount:'5.112.000 ₫',paymentStatus:'cod',receivedStatus:'failed'},
        {id:'#578246/80',customer:'Lê Đức Cường',items:'03',amount:'17.640.000 ₫',paymentStatus:'paid',receivedStatus:'delivered'},
        {id:'#348930/80',customer:'Phạm Văn Mạnh',items:'02',amount:'7.776.000 ₫',paymentStatus:'cod',receivedStatus:'pending'},
        {id:'#391367/80',customer:'Hoàng Thị Lan',items:'07',amount:'3.672.000 ₫',paymentStatus:'cod',receivedStatus:'delivered'},
        {id:'#930447/80',customer:'Vũ Văn Hùng',items:'02',amount:'10.176.000 ₫',paymentStatus:'paid',receivedStatus:'failed'},
        {id:'#462397/80',customer:'Đặng Thị Mai',items:'01',amount:'12.504.000 ₫',paymentStatus:'paid',receivedStatus:'pending'},
        {id:'#472356/80',customer:'Bùi Văn Đức',items:'04',amount:'7.512.000 ₫',paymentStatus:'cod',receivedStatus:'delivered'},
        {id:'#448226/80',customer:'Ngô Thị Hương',items:'06',amount:'5.256.000 ₫',paymentStatus:'cod',receivedStatus:'failed'}
      ];
      saveInventoryOrders();
    }
  }catch(e){
    console.error('Không thể đọc đơn tồn kho',e);
    inventoryOrders=[];
  }
}

function saveInventoryOrders(){
  try{
    localStorage.setItem(INVENTORY_ORDERS_KEY,JSON.stringify(inventoryOrders));
  }catch(e){
    console.error('Không thể lưu đơn tồn kho',e);
  }
}

function renderInventoryOrdersTable(){
  var tbody=document.getElementById('tableBody');
  if(!tbody)return;

  tbody.innerHTML=inventoryOrders.map(function(order,index){
    return (
      '<tr>'+
      '  <td class="chk"><input type="checkbox"/></td>'+
      '  <td><div class="tag">'+order.id+'</div></td>'+
      '  <td>'+order.customer+'</td>'+
      '  <td>'+order.items+'</td>'+
      '  <td style="font-weight:700">'+order.amount+'</td>'+
      '  <td><span class="badge '+order.paymentStatus+'">'+(statusText[order.paymentStatus]||'')+'</span></td>'+
      '  <td><span class="badge '+order.receivedStatus+'">'+(statusText[order.receivedStatus]||'')+'</span></td>'+
      '  <td>'+
      '    <div class="act">'+
      '      <div class="pill view" title="Xem" onclick="viewInventoryOrder('+index+')">'+
      '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16">'+
      '          <circle cx="12" cy="12" r="3" stroke="currentColor"/>'+
      '          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor"/>'+
      '        </svg>'+
      '      </div>'+
      '      <div class="pill edit" title="Sửa" onclick="editInventoryOrder('+index+')">'+
      '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16">'+
      '          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"/>'+
      '          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"/>'+
      '        </svg>'+
      '      </div>'+
      '      <div class="pill del" title="Xóa" onclick="deleteInventoryOrder('+index+')">'+
      '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16">'+
      '          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor"/>'+
      '        </svg>'+
      '      </div>'+
      '    </div>'+
      '  </td>'+
      '</tr>'
    );
  }).join('');
}

function openInventoryOrderModal(mode,index){
  var backdrop=document.getElementById('inventory-order-modal-backdrop');
  var title=document.getElementById('inventory-order-modal-title');
  var idInput=document.getElementById('inv-order-id');
  var customerInput=document.getElementById('inv-order-customer');
  var itemsInput=document.getElementById('inv-order-items');
  var amountInput=document.getElementById('inv-order-amount');
  var paymentSelect=document.getElementById('inv-order-payment');
  var receivedSelect=document.getElementById('inv-order-received');
  if(!backdrop||!title||!idInput||!customerInput||!itemsInput||!amountInput||!paymentSelect||!receivedSelect)return;

  var isView=mode==='view';
  backdrop.dataset.mode=mode;
  backdrop.dataset.index=typeof index==='number'?String(index):'';

  [customerInput,itemsInput,amountInput,paymentSelect,receivedSelect].forEach(function(el){
    el.disabled=isView;
  });

  if(typeof index==='number'&&inventoryOrders[index]){
    var order=inventoryOrders[index];
    idInput.value=order.id||'';
    customerInput.value=order.customer||'';
    itemsInput.value=order.items||'';
    amountInput.value=order.amount||'';
    paymentSelect.value=order.paymentStatus||'paid';
    receivedSelect.value=order.receivedStatus||'pending';
    title.textContent=isView?'Xem đơn hàng':'Chỉnh sửa đơn hàng';
  }else{
    idInput.value='';
    customerInput.value='';
    itemsInput.value='';
    amountInput.value='';
    paymentSelect.value='paid';
    receivedSelect.value='pending';
    title.textContent='Thêm đơn hàng';
  }

  backdrop.style.display='flex';
}

function closeInventoryOrderModal(){
  var backdrop=document.getElementById('inventory-order-modal-backdrop');
  if(backdrop){
    backdrop.style.display='none';
    backdrop.dataset.mode='';
    backdrop.dataset.index='';
  }
}

function viewInventoryOrder(index){
  localStorage.setItem('inventoryOrderSelectedIndex',String(index));
  localStorage.setItem('inventoryOrderSelectedMode','view');
  window.location.href='inventory-order-details.html';
}

function editInventoryOrder(index){
  localStorage.setItem('inventoryOrderSelectedIndex',String(index));
  localStorage.setItem('inventoryOrderSelectedMode','edit');
  window.location.href='inventory-order-details.html';
}

function deleteInventoryOrder(index){
  if(!confirm('Bạn có chắc muốn xóa đơn hàng này?'))return;
  if(index<0||index>=inventoryOrders.length)return;
  inventoryOrders.splice(index,1);
  saveInventoryOrders();
  renderInventoryOrdersTable();
}

document.addEventListener('DOMContentLoaded',function(){
  loadInventoryOrders();
  renderInventoryOrdersTable();

  var form=document.getElementById('inventory-order-form');
  if(form){
    form.addEventListener('submit',function(event){
      event.preventDefault();
      var backdrop=document.getElementById('inventory-order-modal-backdrop');
      var mode=backdrop?backdrop.dataset.mode:'edit';
      var indexStr=backdrop?backdrop.dataset.index:null;
      var idInput=document.getElementById('inv-order-id');
      var customerInput=document.getElementById('inv-order-customer');
      var itemsInput=document.getElementById('inv-order-items');
      var amountInput=document.getElementById('inv-order-amount');
      var paymentSelect=document.getElementById('inv-order-payment');
      var receivedSelect=document.getElementById('inv-order-received');
      if(!idInput||!customerInput||!itemsInput||!amountInput||!paymentSelect||!receivedSelect)return;

      var data={
        id:idInput.value||'',
        customer:customerInput.value||'',
        items:itemsInput.value||'0',
        amount:amountInput.value||'',
        paymentStatus:paymentSelect.value||'paid',
        receivedStatus:receivedSelect.value||'pending'
      };

      if(!data.id){
        alert('Vui lòng nhập ID đơn hàng');
        return;
      }

      if(mode==='edit'&&indexStr!==null&&indexStr!==''){
        var idx=parseInt(indexStr,10);
        if(!isNaN(idx)&&inventoryOrders[idx]){
          inventoryOrders[idx]=data;
        }
      }else{
        inventoryOrders.push(data);
      }

      saveInventoryOrders();
      renderInventoryOrdersTable();
      closeInventoryOrderModal();
    });
  }

  var backdrop=document.getElementById('inventory-order-modal-backdrop');
  if(backdrop){
    backdrop.addEventListener('click',function(event){
      if(event.target===backdrop){
        closeInventoryOrderModal();
      }
    });
  }
});

function toggleSidebar(){
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed',document.querySelector('.layout').classList.contains('collapsed'));
}

if(localStorage.getItem('sidebarCollapsed')==='true'){
  document.querySelector('.layout').classList.add('collapsed');
}

function toggleSubmenu(element){
  var navItem=element.parentElement;
  navItem.classList.toggle('open');
}
