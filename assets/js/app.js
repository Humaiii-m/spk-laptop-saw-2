// Main Application Logic - Dark Mode, UI state, Init Data

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Dark Mode
    initDarkMode();
    
    // 2. Initialize Navigation Sidebar links
    initNavigation();
    
    // 3. Load Data
    await Store.initData();

    // 4. Render specific page content based on URL
    renderPageContent();
});

// --- Navigation & Sidebar ---
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    // Highlight active link based on current path
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('active', 'bg-gray-100', 'dark:bg-gray-700', 'font-semibold', 'text-primary');
        
        // Match path ending (handles nested directories or index.html)
        if (currentPath.endsWith(href) || (currentPath.endsWith('/') && href === 'index.html')) {
            link.classList.add('active', 'bg-gray-100', 'dark:bg-gray-700', 'font-semibold', 'text-primary');
            // Update page title
            const pageTitle = document.getElementById('page-title');
            if(pageTitle) pageTitle.textContent = link.textContent.trim();
        }
    });

    // Mobile sidebar toggle
    if(sidebarToggle && mobileOverlay) {
        sidebarToggle.addEventListener('click', toggleSidebar);
        mobileOverlay.addEventListener('click', toggleSidebar);
    }

    function toggleSidebar() {
        sidebar.classList.toggle('hidden');
        sidebar.classList.toggle('fixed');
        sidebar.classList.toggle('inset-y-0');
        sidebar.classList.toggle('left-0');
        sidebar.classList.toggle('shadow-2xl');
        mobileOverlay.classList.toggle('hidden');
    }
}

// --- Render Page Based on ID ---
function renderPageContent() {
    // Check which section is present in the DOM
    if (document.getElementById('dashboard-section')) {
        initDashboard();
    }
    if (document.getElementById('criteria-section')) {
        if(typeof renderCriteria === 'function') renderCriteria();
    }
    if (document.getElementById('alternatives-section')) {
        if(typeof renderAlternatives === 'function') renderAlternatives();
    }
    if (document.getElementById('calculation-section')) {
        if(typeof renderCalculation === 'function') renderCalculation();
    }
    if (document.getElementById('ranking-section')) {
        if(typeof renderRanking === 'function') renderRanking();
    }
}

// --- Dark Mode ---
function initDarkMode() {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    const htmlClass = document.documentElement.classList;
    
    // Check local storage or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlClass.add('dark');
    } else {
        htmlClass.remove('dark');
    }

    if(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            htmlClass.toggle('dark');
            if (htmlClass.contains('dark')) {
                localStorage.theme = 'dark';
            } else {
                localStorage.theme = 'light';
            }
            
            // Re-render chart to update colors if we are on dashboard
            if(window.rankingChartInstance) {
                initDashboard();
            }
        });
    }
}

// --- Dashboard ---
let rankingChartInstance = null;
window.rankingChartInstance = rankingChartInstance;

function initDashboard() {
    const statCriteria = document.getElementById('stat-criteria');
    const statAlternatives = document.getElementById('stat-alternatives');
    
    if(!statCriteria || !statAlternatives) return; // Not on dashboard

    const criteria = Store.getCriteria();
    const alternatives = Store.getAlternatives();

    statCriteria.textContent = criteria.length;
    statAlternatives.textContent = alternatives.length;

    // Calculate ranking for dashboard chart
    if(typeof calculateSAW === 'function' && criteria.length > 0 && alternatives.length > 0) {
        const result = calculateSAW();
        if(!result.error) {
            // Sort and get top 5
            const sorted = [...result.vMatrix].sort((a, b) => b.total - a.total).slice(0, 5);
            renderChart(sorted);
        }
    }
}

function renderChart(top5) {
    const canvas = document.getElementById('rankingChart');
    if(!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    
    const textColor = isDark ? '#f3f4f6' : '#1f2937';
    const gridColor = isDark ? '#374151' : '#e5e7eb';

    if (window.rankingChartInstance) {
        window.rankingChartInstance.destroy();
    }

    window.rankingChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top5.map(item => item.name),
            datasets: [{
                label: 'Nilai Preferensi',
                data: top5.map(item => item.total),
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // Primary blue
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Nilai: ${context.parsed.y.toFixed(4)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textColor }
                }
            }
        }
    });
}

// --- Modal Helper Functions ---
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('active');
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(!modal) return;
    
    modal.classList.remove('active');
    
    // Reset form if exists
    const form = modal.querySelector('form');
    if(form) form.reset();
};
