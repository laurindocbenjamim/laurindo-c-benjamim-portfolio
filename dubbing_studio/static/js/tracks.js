// static/js/tracks.js
function addNewTrack(trackId, trackUrl) {
    const tracksContainer = document.getElementById('tracksContainer');
    const trackElement = document.createElement('div');
    trackElement.className = 'track-item mb-3 p-3 border rounded';
    trackElement.dataset.trackId = trackId;
    trackElement.draggable = true;
    
    trackElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h6>Recording ${document.querySelectorAll('.track-item').length + 1}</h6>
                <audio src="${trackUrl}" controls class="w-100"></audio>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-danger delete-track">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    tracksContainer.appendChild(trackElement);
    
    // Add drag events
    trackElement.addEventListener('dragstart', handleDragStart);
    
    // Add delete functionality
    trackElement.querySelector('.delete-track').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this track?')) {
            deleteTrack(trackId, trackElement);
        }
    });
}

async function deleteTrack(trackId, element) {
    try {
        const response = await fetch(`/delete_track/${trackId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            element.remove();
        } else {
            alert('Failed to delete track: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting track:', error);
        alert('Failed to delete track');
    }
}

// Initialize drag and drop for tracks
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.trackId);
    e.dataTransfer.effectAllowed = 'move';
}