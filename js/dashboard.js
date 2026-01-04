// Animate stats on load
document.addEventListener('DOMContentLoaded', function() {
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'all 0.5s ease';
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50);
    }, index * 100);
  });

  // Animate bars
  const bars = document.querySelectorAll('.bar');
  bars.forEach((bar, index) => {
    const height = bar.style.height;
    bar.style.height = '0%';
    setTimeout(() => {
      bar.style.transition = 'height 1s ease';
      bar.style.height = height;
    }, 500 + index * 50);
  });

  // Real-time clock
  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('vi-VN');
    // You can add a clock element if needed
  }
  setInterval(updateClock, 1000);

  // Simulate real-time updates
  setInterval(() => {
    const activities = document.querySelector('.activity-list');
    const firstActivity = activities.firstElementChild;
    
    // Add subtle pulse animation to first item
    if (firstActivity) {
      firstActivity.style.animation = 'pulse 2s ease';
    }
  }, 5000);
});

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
`;
document.head.appendChild(style);

// Toggle sidebar
function toggleSidebar() {
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', document.querySelector('.layout').classList.contains('collapsed'));
}

// Toggle submenu
function toggleSubmenu(element) {
  const navItem = element.parentElement;
  navItem.classList.toggle('open');
}

// Restore sidebar state on load
if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.querySelector('.layout').classList.add('collapsed');
}
