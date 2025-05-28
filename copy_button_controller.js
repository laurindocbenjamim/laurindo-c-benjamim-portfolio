document.addEventListener('DOMContentLoaded', function() {
    const transcriptText = document.getElementById('transcriptText');
    const copyTranscriptTextContentBtn = document.getElementById('copyTranscriptTextContentBtn');
    const copyTranscriptBtn = document.getElementById('copyTranscriptBtn'); // Assuming you want to keep the header button too

    // Function to copy text
    function copyContent(element) {
        if (!element) {
            console.error('Element to copy not found.');
            return;
        }

        const textToCopy = element.innerText; // Get the visible text content
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                console.log('Transcript content copied to clipboard!');
                // Optional: Provide visual feedback (e.g., change icon/text temporarily)
                const originalIcon = element.querySelector('.bi-clipboard');
                const checkIcon = document.createElement('i');
                checkIcon.classList.add('bi', 'bi-check2'); // Bootstrap check icon
                if (originalIcon) {
                    const parentButton = originalIcon.closest('button');
                    if (parentButton) {
                        parentButton.replaceChild(checkIcon, originalIcon);
                        setTimeout(() => {
                            parentButton.replaceChild(originalIcon, checkIcon);
                        }, 1500); // Change back after 1.5 seconds
                    }
                }
            })
            .catch(err => {
                console.error('Failed to copy transcript content: ', err);
                alert('Failed to copy text. Please try again.');
            });
    }

    // Event listener for the new "smooth top" button
    if (copyTranscriptTextContentBtn && transcriptText) {
        copyTranscriptTextContentBtn.addEventListener('click', function() {
            copyContent(transcriptText);
        });
    }

    // Event listener for the header copy button (if you still use it)
    if (copyTranscriptBtn && transcriptText) {
        copyTranscriptBtn.addEventListener('click', function() {
            copyContent(transcriptText);
        });
    }

    // Optional: Show transcript container if it's dynamically populated later
    // For example, if you have a button to start transcription, you might show it then
    // For demonstration, let's assume it becomes visible after some action
    // document.getElementById('transcriptContainer').style.display = 'block';
});