/**
 * TOURS EXPLORE PAGE FUNCTIONALITY
 */

// Filter Functions
function updateFilter(param, value) {
    const url = new URL(window.location.href);
    if (value) {
        url.searchParams.set(param, value);
    } else {
        url.searchParams.delete(param);
    }
    url.searchParams.delete('page'); // Reset to first page
    window.location.href = url.toString();
}

function toggleFeatureFilter(feature) {
    const url = new URL(window.location.href);
    const features = url.searchParams.getAll('features') || [];
    
    if (features.includes(feature)) {
        url.searchParams.delete('features', feature);
    } else {
        url.searchParams.append('features', feature);
    }
    
    url.searchParams.delete('page');
    window.location.href = url.toString();
}

function toggleRatingFilter(rating) {
    const url = new URL(window.location.href);
    const ratings = url.searchParams.getAll('rating') || [];
    const ratingStr = rating.toString();
    
    if (ratings.includes(ratingStr)) {
        const newRatings = ratings.filter(r => r !== ratingStr);
        url.searchParams.delete('rating');
        newRatings.forEach(r => url.searchParams.append('rating', r));
    } else {
        url.searchParams.append('rating', ratingStr);
    }
    
    url.searchParams.delete('page');
    window.location.href = url.toString();
}

function applyPriceFilter() {
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    updateFilter('price_min', minPrice);
    updateFilter('price_max', maxPrice);
}

function applyDateFilter() {
    const startDate = document.querySelector('input[name="start_date"]').value;
    updateFilter('start_date', startDate);
}

function clearDateFilter() {
    updateFilter('start_date', '');
}

// Favorite Functionality
function toggleFavorite(tourId) {
    const favoriteBtn = document.querySelector(`.btn-favorite[data-tour-id="${tourId}"]`);
    const isActive = favoriteBtn.classList.contains('active');
    
    // Toggle UI
    favoriteBtn.classList.toggle('active');
    favoriteBtn.querySelector('i').classList.toggle('far');
    favoriteBtn.querySelector('i').classList.toggle('fas');
    
    // Send AJAX request
    fetch('/api/toggle-favorite/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ tour_id: tourId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show toast notification
            showToast(isActive ? 'Removed from favorites' : 'Added to favorites', 'success');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Revert UI on error
        favoriteBtn.classList.toggle('active');
        favoriteBtn.querySelector('i').classList.toggle('far');
        favoriteBtn.querySelector('i').classList.toggle('fas');
        showToast('Error updating favorites', 'error');
    });
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas ${getToastIcon(type)} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '1060';
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Cookie Helper
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Infinite Scroll (Optional)
function setupInfiniteScroll() {
    const toursGrid = document.getElementById('tours-grid');
    if (!toursGrid) return;
    
    let isLoading = false;
    let currentPage = 2;
    let hasMorePages = true;
    
    window.addEventListener('scroll', () => {
        if (isLoading || !hasMorePages) return;
        
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageEnd = document.documentElement.offsetHeight - 100;
        
        if (scrollPosition >= pageEnd) {
            loadMoreTours();
        }
    });
    
    function loadMoreTours() {
        isLoading = true;
        
        // Show loading indicator
        const loader = document.createElement('div');
        loader.className = 'col-12 text-center py-5';
        loader.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
        toursGrid.appendChild(loader);
        
        const url = new URL(window.location.href);
        url.searchParams.set('page', currentPage);
        
        fetch(url, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.text())
        .then(html => {
            loader.remove();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newCards = doc.querySelectorAll('#tours-grid > .col-xl-4');
            
            if (newCards.length === 0) {
                hasMorePages = false;
                return;
            }
            
            newCards.forEach(card => {
                toursGrid.appendChild(card);
            });
            
            currentPage++;
            isLoading = false;
        })
        .catch(error => {
            console.error('Error loading more tours:', error);
            loader.remove();
            isLoading = false;
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Setup favorite buttons
    document.querySelectorAll('.btn-favorite').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const tourId = this.getAttribute('data-tour-id');
            toggleFavorite(tourId);
        });
    });
    
    // Setup quick view modals
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-bs-target');
            const modal = new bootstrap.Modal(document.querySelector(modalId));
            modal.show();
        });
    });
    
    // Setup filter toggles
    document.querySelectorAll('.filter-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const target = this.getAttribute('data-bs-target');
            const filterSection = document.querySelector(target);
            filterSection.classList.toggle('show');
        });
    });
    
    // Initialize infinite scroll if enabled
    if (document.body.classList.contains('infinite-scroll-enabled')) {
        setupInfiniteScroll();
    }
    
    // Price range slider initialization (if using noUiSlider)
    if (typeof noUiSlider !== 'undefined') {
        initializePriceSlider();
    }
});

// Price Slider with noUiSlider (if included)
function initializePriceSlider() {
    const priceSlider = document.getElementById('priceSlider');
    if (!priceSlider) return;
    
    const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || 10000;
    
    noUiSlider.create(priceSlider, {
        start: [minPrice, maxPrice],
        connect: true,
        range: {
            'min': 0,
            'max': 10000
        },
        step: 100,
        format: {
            to: value => Math.round(value),
            from: value => parseFloat(value)
        }
    });
    
    priceSlider.noUiSlider.on('update', function(values) {
        document.getElementById('minPrice').value = values[0];
        document.getElementById('maxPrice').value = values[1];
        document.getElementById('priceRangeValue').textContent = 
            `$${parseInt(values[0]).toLocaleString()} - $${parseInt(values[1]).toLocaleString()}`;
    });
}