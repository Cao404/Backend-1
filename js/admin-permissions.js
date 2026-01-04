function toggleSidebar() {
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', document.querySelector('.layout').classList.contains('collapsed'));
}

if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.querySelector('.layout').classList.add('collapsed');
}

function createRole() {
  alert('Tạo vai trò mới');
}

function editRole(id) {
  alert('Chỉnh sửa vai trò #' + id);
}
