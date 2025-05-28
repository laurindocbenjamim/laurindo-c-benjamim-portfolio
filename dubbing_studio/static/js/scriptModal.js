// static/js/scriptModal.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize text editor (using Tiptap as example)
    const editor = new Editor({
        element: document.getElementById('scriptEditor'),
        extensions: [
            new StarterKit(),
            new Underline(),
            new Placeholder({
                placeholder: 'Write your dubbing script here...'
            })
        ],
        content: '<p>Start writing your script...</p>'
    });
    
    // Make modal draggable
    const modal = document.getElementById('scriptModal');
    const modalHeader = modal.querySelector('.draggable-handle');
    
    let isDragging = false;
    let offsetX, offsetY;
    
    modalHeader.addEventListener('mousedown', (e) => {
        if (e.target === modalHeader || e.target.closest('.draggable-handle')) {
            isDragging = true;
            const modalRect = modal.querySelector('.modal-dialog').getBoundingClientRect();
            offsetX = e.clientX - modalRect.left;
            offsetY = e.clientY - modalRect.top;
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const dialog = modal.querySelector('.modal-dialog');
        dialog.style.position = 'fixed';
        dialog.style.left = `${e.clientX - offsetX}px`;
        dialog.style.top = `${e.clientY - offsetY}px`;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Save script
    document.getElementById('saveScriptBtn').addEventListener('click', async () => {
        const scriptContent = editor.getHTML();
        
        try {
            const response = await fetch('/save_script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    video_id: window.currentVideoId,
                    script: scriptContent
                })
            });
            
            const result = await response.json();
            if (result.success) {
                alert('Script saved successfully!');
            } else {
                alert('Failed to save script: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving script:', error);
            alert('Failed to save script');
        }
    });
});