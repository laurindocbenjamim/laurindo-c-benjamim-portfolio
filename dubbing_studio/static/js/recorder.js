// static/js/recorder.js
let mediaRecorder;
let audioChunks = [];
let recordingStartTime;
let progressInterval;

document.getElementById('recordBtn').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioPlayback = document.getElementById('audioPlayback');
            
            audioPlayback.src = audioUrl;
            audioPlayback.classList.remove('d-none');
            document.getElementById('playBtn').disabled = false;
            document.getElementById('saveRecordingBtn').disabled = false;
            
            clearInterval(progressInterval);
            document.getElementById('progressBar').style.width = '0%';
        };
        
        audioChunks = [];
        mediaRecorder.start();
        recordingStartTime = Date.now();
        
        // Update progress bar
        progressInterval = setInterval(() => {
            const elapsed = Date.now() - recordingStartTime;
            const progress = Math.min((elapsed / (60 * 1000)) * 100, 100); // Max 1 minute
            document.getElementById('progressBar').style.width = `${progress}%`;
        }, 100);
        
        document.getElementById('recordBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please check permissions.');
    }
});

document.getElementById('stopBtn').addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
    }
});

document.getElementById('playBtn').addEventListener('click', () => {
    const audioPlayback = document.getElementById('audioPlayback');
    if (audioPlayback.paused) {
        audioPlayback.play();
    } else {
        audioPlayback.pause();
    }
});

document.getElementById('saveRecordingBtn').addEventListener('click', async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', audioBlob, `recording_${Date.now()}.wav`);
    formData.append('video_id', window.currentVideoId);
    
    try {
        const response = await fetch('/save_recording', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Recording saved successfully!');
            addNewTrack(result.recording_id, result.recording_url);
        } else {
            alert('Failed to save recording: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving recording:', error);
        alert('Failed to save recording');
    }
});