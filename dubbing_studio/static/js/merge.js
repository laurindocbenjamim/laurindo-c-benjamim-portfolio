// static/js/merge.js
document.addEventListener('DOMContentLoaded', function() {
    const mergeArea = document.getElementById('mergeArea');
    const mergeItems = document.getElementById('mergeItems');
    const mergeBtn = document.getElementById('mergeBtn');
    
    // Allow dropping
    mergeArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        mergeArea.classList.add('bg-light');
    });
    
    mergeArea.addEventListener('dragleave', () => {
        mergeArea.classList.remove('bg-light');
    });
    
    mergeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        mergeArea.classList.remove('bg-light');
        
        const trackId = e.dataTransfer.getData('text/plain');
        if (trackId) {
            addToMergeArea(trackId, 'track');
        }
    });
    
    function addToMergeArea(id, type) {
        // Check if already added
        if (document.querySelector(`.merge-item[data-id="${id}"]`)) return;
        
        const item = document.createElement('div');
        item.className = 'merge-item badge bg-primary p-2';
        item.dataset.id = id;
        item.dataset.type = type;
        
        if (type === 'track') {
            item.innerHTML = `<i class="fas fa-music me-1"></i>Track ${id.slice(0, 4)}`;
        } else {
            item.innerHTML = `<i class="fas fa-video me-1"></i>Video`;
        }
        
        mergeItems.appendChild(item);
        mergeBtn.disabled = false;
    }
    
    mergeBtn.addEventListener('click', async () => {
        const items = Array.from(document.querySelectorAll('.merge-item')).map(item => ({
            id: item.dataset.id,
            type: item.dataset.type
        }));
        
        try {
            const response = await fetch('/merge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    video_id: window.currentVideoId,
                    items: items
                })
            });
            
            const result = await response.json();
            if (result.success) {
                alert('Merge completed successfully!');
                // Optionally redirect to download or preview merged file
            } else {
                alert('Merge failed: ' + result.message);
            }
        } catch (error) {
            console.error('Error merging:', error);
            alert('Merge failed');
        }
    });
});