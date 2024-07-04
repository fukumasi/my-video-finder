function applyFilters() {
    const sort = document.getElementById('sort').value;
    const results = document.getElementById('results');
    let items = Array.from(results.getElementsByClassName('search-item'));
  
    if (sort === 'date') {
        items.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-date'));
            const dateB = new Date(b.getAttribute('data-date'));
            return dateB - dateA;
        });
    } else if (sort === 'views') {
        items.sort((a, b) => {
            const viewsA = parseInt(a.getAttribute('data-views'), 10);
            const viewsB = parseInt(b.getAttribute('data-views'), 10);
            return viewsB - viewsA;
        });
    } else {
        items.sort((a, b) => a.getAttribute('data-original-order') - b.getAttribute('data-original-order'));
    }
  
    results.innerHTML = '';
    items.forEach(item => {
        results.appendChild(item);
    });
}
  
window.onload = function() {
    const results = document.getElementById('results');
    if (results) {
        let items = Array.from(results.getElementsByClassName('search-item'));
        items.forEach((item, index) => {
            item.setAttribute('data-original-order', index);
        });
    }
};
