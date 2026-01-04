// Common functions used across multiple pages

// Toggle sidebar
function toggleSidebar() {
  const layout = document.querySelector('.layout');
  if (!layout) return;
  
  layout.classList.toggle('collapsed');
  const isCollapsed = layout.classList.contains('collapsed');
  try {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  } catch (e) {
    console.error('Không thể lưu trạng thái sidebar:', e);
  }
}

// Toggle submenu
function toggleSubmenu(element) {
  if (!element || !element.parentElement) return;
  const navItem = element.parentElement;
  navItem.classList.toggle('open');
}

// Restore sidebar state on load
document.addEventListener('DOMContentLoaded', function() {
  try {
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      const layout = document.querySelector('.layout');
      if (layout) {
        layout.classList.add('collapsed');
      }
    }
  } catch (e) {
    console.error('Không thể khôi phục trạng thái sidebar:', e);
  }
});

