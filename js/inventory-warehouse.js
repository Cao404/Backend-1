var INVENTORY_WAREHOUSE_KEY='shopvn_warehouses';

var warehouses=[];

function loadWarehouses(){
  try{
    var raw=localStorage.getItem(INVENTORY_WAREHOUSE_KEY);
    if(!raw){
      warehouses=[
        {id:'#WH-001',name:'Kho Trung Tâm Hà Nội',location:'123 Đường Trần Duy Hưng, Cầu Giấy, Hà Nội',manager:'Nguyễn Văn An',phone:'024 1234 5678',stock:6490,transfer:3022,revenue:'617.688.000 ₫'},
        {id:'#WH-002',name:'Kho Miền Bắc',location:'456 Đường Láng, Đống Đa, Hà Nội',manager:'Trần Thị Bình',phone:'024 2345 6789',stock:7362,transfer:4253,revenue:'1.616.424.000 ₫'},
        {id:'#WH-003',name:'Kho Miền Trung',location:'789 Đường Lê Duẩn, Hải Châu, Đà Nẵng',manager:'Lê Văn Cường',phone:'0236 3456 7890',stock:8842,transfer:3221,revenue:'1.100.760.000 ₫'},
        {id:'#WH-004',name:'Kho Miền Nam',location:'101 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM',manager:'Phạm Thị Dung',phone:'028 4567 8901',stock:5463,transfer:2100,revenue:'1.311.720.000 ₫'},
        {id:'#WH-005',name:'Kho Bắc Bộ',location:'202 Đường Hoàng Quốc Việt, Cầu Giấy, Hà Nội',manager:'Hoàng Văn Em',phone:'024 5678 9012',stock:12643,transfer:7008,revenue:'2.220.792.000 ₫'},
        {id:'#WH-006',name:'Kho Trung Tâm TP.HCM',location:'303 Đường Nguyễn Trãi, Quận 1, TP.HCM',manager:'Vũ Thị Phương',phone:'028 6789 0123',stock:7553,transfer:5600,revenue:'1.053.552.000 ₫'},
        {id:'#WH-007',name:'Kho Đông Nam Bộ',location:'404 Đường Võ Văn Tần, Quận 3, TP.HCM',manager:'Đặng Văn Giang',phone:'028 7890 1234',stock:9381,transfer:5343,revenue:'1.845.816.000 ₫'},
        {id:'#WH-008',name:'Kho Tây Bắc',location:'505 Đường Hoàng Diệu, Quận 4, TP.HCM',manager:'Bùi Thị Hoa',phone:'028 8901 2345',stock:6500,transfer:3453,revenue:'786.360.000 ₫'},
        {id:'#WH-009',name:'Kho Tây Nguyên',location:'606 Đường Lý Tự Trọng, Quận 1, TP.HCM',manager:'Ngô Văn Khoa',phone:'028 9012 3456',stock:7555,transfer:9000,revenue:'1.621.560.000 ₫'},
        {id:'#WH-010',name:'Kho Đồng Bằng Sông Cửu Long',location:'707 Đường Điện Biên Phủ, Bình Thạnh, TP.HCM',manager:'Lý Thị Lan',phone:'028 0123 4567',stock:5499,transfer:3433,revenue:'1.050.360.000 ₫'}
      ];
      saveWarehouses();
      return;
    }
    var parsed=JSON.parse(raw);
    warehouses=Array.isArray(parsed)?parsed:[];
    
    // Kiểm tra và cập nhật dữ liệu cũ 
    var needsUpdate=false;
    if(warehouses.length>0){
      var firstWarehouse=warehouses[0];
      // Kiểm tra xem có phải dữ liệu cũ không 
      if(firstWarehouse.location&&(firstWarehouse.location.includes('NY')||firstWarehouse.location.includes('CA')||firstWarehouse.location.includes('TX')||firstWarehouse.location.includes('IL')||firstWarehouse.location.includes('MO')||firstWarehouse.location.includes('FL')||firstWarehouse.location.includes('WA')||firstWarehouse.location.includes('AZ')||firstWarehouse.location.includes('MA'))){
        needsUpdate=true;
      }
      if(firstWarehouse.revenue&&(firstWarehouse.revenue.includes('USD')||firstWarehouse.revenue.includes('$'))){
        needsUpdate=true;
      }
      if(firstWarehouse.phone&&firstWarehouse.phone.includes('+1')){
        needsUpdate=true;
      }
    }
    
    // Nếu cần cập nhật, thay thế toàn bộ dữ liệu
    if(needsUpdate){
      warehouses=[
        {id:'#WH-001',name:'Kho Trung Tâm Hà Nội',location:'123 Đường Trần Duy Hưng, Cầu Giấy, Hà Nội',manager:'Nguyễn Văn An',phone:'024 1234 5678',stock:6490,transfer:3022,revenue:'617.688.000 ₫'},
        {id:'#WH-002',name:'Kho Miền Bắc',location:'456 Đường Láng, Đống Đa, Hà Nội',manager:'Trần Thị Bình',phone:'024 2345 6789',stock:7362,transfer:4253,revenue:'1.616.424.000 ₫'},
        {id:'#WH-003',name:'Kho Miền Trung',location:'789 Đường Lê Duẩn, Hải Châu, Đà Nẵng',manager:'Lê Văn Cường',phone:'0236 3456 7890',stock:8842,transfer:3221,revenue:'1.100.760.000 ₫'},
        {id:'#WH-004',name:'Kho Miền Nam',location:'101 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM',manager:'Phạm Thị Dung',phone:'028 4567 8901',stock:5463,transfer:2100,revenue:'1.311.720.000 ₫'},
        {id:'#WH-005',name:'Kho Bắc Bộ',location:'202 Đường Hoàng Quốc Việt, Cầu Giấy, Hà Nội',manager:'Hoàng Văn Em',phone:'024 5678 9012',stock:12643,transfer:7008,revenue:'2.220.792.000 ₫'},
        {id:'#WH-006',name:'Kho Trung Tâm TP.HCM',location:'303 Đường Nguyễn Trãi, Quận 1, TP.HCM',manager:'Vũ Thị Phương',phone:'028 6789 0123',stock:7553,transfer:5600,revenue:'1.053.552.000 ₫'},
        {id:'#WH-007',name:'Kho Đông Nam Bộ',location:'404 Đường Võ Văn Tần, Quận 3, TP.HCM',manager:'Đặng Văn Giang',phone:'028 7890 1234',stock:9381,transfer:5343,revenue:'1.845.816.000 ₫'},
        {id:'#WH-008',name:'Kho Tây Bắc',location:'505 Đường Hoàng Diệu, Quận 4, TP.HCM',manager:'Bùi Thị Hoa',phone:'028 8901 2345',stock:6500,transfer:3453,revenue:'786.360.000 ₫'},
        {id:'#WH-009',name:'Kho Tây Nguyên',location:'606 Đường Lý Tự Trọng, Quận 1, TP.HCM',manager:'Ngô Văn Khoa',phone:'028 9012 3456',stock:7555,transfer:9000,revenue:'1.621.560.000 ₫'},
        {id:'#WH-010',name:'Kho Đồng Bằng Sông Cửu Long',location:'707 Đường Điện Biên Phủ, Bình Thạnh, TP.HCM',manager:'Lý Thị Lan',phone:'028 0123 4567',stock:5499,transfer:3433,revenue:'1.050.360.000 ₫'}
      ];
      saveWarehouses();
    }
  }catch(e){
    console.error('Không thể đọc danh sách kho',e);
    warehouses=[];
  }
}

function saveWarehouses(){
  try{
    localStorage.setItem(INVENTORY_WAREHOUSE_KEY,JSON.stringify(warehouses));
  }catch(e){
    console.error('Không thể lưu danh sách kho',e);
  }
}

function renderWarehouseTable(){
  const tbody=document.getElementById('tableBody');
  if(!tbody)return;
  tbody.innerHTML=warehouses.map((w,index)=>`<tr><td class="chk"><input type="checkbox"/></td><td><div class="tag">${w.id}</div></td><td><div class="name">${w.name}</div></td><td>${w.location}</td><td>${w.manager}</td><td>${w.phone}</td><td>${w.stock}</td><td>${w.transfer}</td><td style="font-weight:700;color:var(--accent)">${w.revenue}</td><td><div class="act"><div class="pill view" title="Xem" onclick="viewWarehouse(${index})"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="3" stroke="currentColor"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor"/></svg></div><div class="pill edit" title="Sửa" onclick="editWarehouse(${index})"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"/></svg></div><div class="pill del" title="Xóa" onclick="deleteWarehouse(${index})"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor"/></svg></div></div></td></tr>`).join('');
}

function viewWarehouse(index){
  localStorage.setItem('inventoryWarehouseSelectedIndex',String(index));
  localStorage.setItem('inventoryWarehouseSelectedMode','view');
  window.location.href='inventory-warehouse-details.html';
}

function editWarehouse(index){
  localStorage.setItem('inventoryWarehouseSelectedIndex',String(index));
  localStorage.setItem('inventoryWarehouseSelectedMode','edit');
  window.location.href='inventory-warehouse-details.html';
}

function deleteWarehouse(index){
  if(!confirm('Bạn có chắc muốn xóa kho này?'))return;
  if(index<0||index>=warehouses.length)return;
  warehouses.splice(index,1);
  saveWarehouses();
  renderWarehouseTable();
}

function toggleSidebar(){document.querySelector('.layout').classList.toggle('collapsed');localStorage.setItem('sidebarCollapsed',document.querySelector('.layout').classList.contains('collapsed'));}

if(localStorage.getItem('sidebarCollapsed')==='true'){document.querySelector('.layout').classList.add('collapsed');}

function toggleSubmenu(element){const navItem=element.parentElement;navItem.classList.toggle('open');}

document.addEventListener('DOMContentLoaded',function(){
  loadWarehouses();
  renderWarehouseTable();
});
