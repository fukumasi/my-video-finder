function applyFilters() {
    const sort = document.getElementById('sort').value;
    const results = document.getElementById('results');
    let items = Array.from(results.getElementsByClassName('search-item'));
  
    console.log(`Sorting by: ${sort}`);
    console.log('Before sorting:', items);
  
    if (sort === 'date') {
        items.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-date'));
            const dateB = new Date(b.getAttribute('data-date'));
            console.log(`Comparing dates: ${dateA} and ${dateB}`);
            return dateB - dateA;
        });
    } else if (sort === 'views') {
        items.sort((a, b) => {
            const viewsA = parseInt(a.getAttribute('data-views'), 10);
            const viewsB = parseInt(b.getAttribute('data-views'), 10);
            console.log(`Comparing views: ${viewsA} and ${viewsB}`);
            return viewsB - viewsA;
        });
    } else {
        items.sort((a, b) => a.getAttribute('data-original-order') - b.getAttribute('data-original-order'));
    }
  
    console.log('After sorting:', items.map(item => ({
        title: item.querySelector('h3').innerText,
        date: item.getAttribute('data-date'),
        views: item.getAttribute('data-views')
    })));
  
    results.innerHTML = '';
    items.forEach(item => {
        results.appendChild(item);
        console.log('Appending item:', item.querySelector('h3').textContent);
    });
  
    console.log('Items after appending:', Array.from(results.getElementsByClassName('search-item')));
}
  
// ページロード時に元の順序を設定
window.onload = function() {
    const results = document.getElementById('results');
    if (results) {
        let items = Array.from(results.getElementsByClassName('search-item'));
        items.forEach((item, index) => {
            item.setAttribute('data-original-order', index);
        });
        // 初期ロード時にソートを適用
        applyFilters();
    }
};
