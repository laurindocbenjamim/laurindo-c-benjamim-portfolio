// static/js/upload.js
document.getElementById('videoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const videoPreview = document.getElementById('videoPreview');
    const videoURL = URL.createObjectURL(file);
    
    videoPreview.src = videoURL;
    videoPreview.classList.remove('d-none');
    videoPreview.load();
});

document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('videoInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a video file');
        return;
    }
    
    const formData = new FormData();
    formData.append('video', file);
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            window.location.href = `/dubbing/${result.video_id}`;
        } else {
            alert('Upload failed: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Upload failed');
    }
});