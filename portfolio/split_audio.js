

document.addEventListener('DOMContentLoaded', function () {
    const audioFileInput = document.getElementById('audioFile');
    const audioInfoDiv = document.getElementById('audioInfo');
    const splitControlsDiv = document.getElementById('splitControls');
    const resultsDiv = document.getElementById('results');
    const audioPlayer = document.getElementById('audioPlayer');
    const fileNamePara = document.getElementById('fileName');
    const fileDurationPara = document.getElementById('fileDuration');
    const splitBtn = document.getElementById('splitBtn');
    const sendToServerBtn = document.getElementById('sendToServerBtn');
    const uploadForm = document.getElementById('uploadForm');
    const statusDiv = document.getElementById('status');
    const audioPartsDiv = document.getElementById('audioParts');

    let audioBuffer = null;
    let audioContext = null;
    let audioParts = [];


    // Initialize audio context
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Read file as array buffer
    const fileReader = new FileReader();

    // Handle file upload
    // Handle file upload with progress
    audioFileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        initAudioContext();

        // Reset UI
        fileNamePara.textContent = `File: ${file.name}`;
        audioPlayer.src = '';
        audioInfoDiv.classList.remove('d-none');
        splitControlsDiv.classList.add('d-none');
        resultsDiv.classList.add('d-none');
        statusDiv.textContent = '';

        // Show decoding progress
        const decodeProgressContainer = document.getElementById('decodeProgressContainer');
        const decodeProgress = document.getElementById('decodeProgress');
        const decodeProgressText = document.getElementById('decodeProgressText');

        decodeProgressContainer.classList.remove('d-none');
        decodeProgress.style.width = '0%';
        decodeProgressText.textContent = 'Decoding audio: 0%';

        // Create object URL for audio player
        const objectUrl = URL.createObjectURL(file);
        audioPlayer.src = objectUrl;



        // Update progress during file reading
        fileReader.onprogress = function (e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 50); // First half of progress
                decodeProgress.style.width = `${percent}%`;
                decodeProgressText.textContent = `Loading file: ${percent}%`;
            }
        };

        fileReader.onload = function (e) {
            decodeProgress.style.width = '50%';
            decodeProgressText.textContent = 'Decoding audio data...';

            audioContext.decodeAudioData(e.target.result,
                function (buffer) {
                    // Success
                    decodeProgress.style.width = '100%';
                    decodeProgressText.textContent = 'Decoding complete!';

                    setTimeout(() => {
                        decodeProgressContainer.classList.add('d-none');
                    }, 1000);

                    audioBuffer = buffer;
                    const duration = buffer.duration;
                    const minutes = Math.floor(duration / 60);
                    const seconds = Math.floor(duration % 60);
                    fileDurationPara.textContent = `Duration: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                    splitControlsDiv.classList.remove('d-none');
                    statusDiv.textContent = 'Audio file loaded successfully!';
                    statusDiv.className = 'text-success';
                },
                function (error) {
                    // Error
                    decodeProgressContainer.classList.add('d-none');
                    statusDiv.textContent = 'Error decoding audio file: ' + error.message;
                    statusDiv.className = 'text-danger';
                }
            );
        };

        fileReader.onerror = function () {
            decodeProgressContainer.classList.add('d-none');
            statusDiv.textContent = 'Error reading file';
            statusDiv.className = 'text-danger';
        };

        fileReader.readAsArrayBuffer(file);
    });

    // Split audio into 3 parts
    const progressBarContainer = document.getElementById('progressBarContainer')
    const progressBar = document.getElementById('progressBar')

    let percent = 0;
    splitBtn.addEventListener('click', function () {
        percent = 1;
        progressBarContainer.classList.remove('d-none');
        // Update progress during file reading
        progressBar.style.width = `${percent}%`;
        progressBar.textContent = `${percent}%`;

        if (!audioBuffer) return;

        const numberOfChunks = document.getElementById('numberOfChunks').value;
        const duration = audioBuffer.duration;
        const partDuration = duration / numberOfChunks;

        audioParts = [];
        audioPartsDiv.innerHTML = '';

        percent += 2;
        // Update progress during file reading
        progressBar.style.width = `${percent}%`;
        progressBar.textContent = `${percent}%`;

        for (let i = 0; i < numberOfChunks; i++) {

            percent += Math.round((i / numberOfChunks) * 100);

            const startTime = i * partDuration;
            const endTime = (i + 1) * partDuration;

            // Create a new buffer for this part
            const partBuffer = audioContext.createBuffer(
                audioBuffer.numberOfChannels,
                audioBuffer.sampleRate * partDuration,
                audioBuffer.sampleRate
            );

            // Copy the data for each channel
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                const channelData = audioBuffer.getChannelData(channel);
                const partChannelData = partBuffer.getChannelData(channel);

                // Calculate sample positions
                const startOffset = Math.floor(startTime * audioBuffer.sampleRate);
                const endOffset = Math.floor(endTime * audioBuffer.sampleRate);
                console.log(`Part ${i + 1}: Start: ${startOffset}, End: ${endTime}`);
                // Copy the samples
                for (let j = startOffset; j < endOffset; j++) {
                    partChannelData[j - startOffset] = channelData[j];
                }
            }

            audioParts.push(partBuffer);


            // Create a download link for this part
            createAudioPartElement(partBuffer, i + 1);


            console.log(`Splitting audio: ${percent}%`);
            progressBar.style.width = `${percent}%`;
            progressBar.textContent = `${percent}%`;
        }

        resultsDiv.classList.remove('d-none');
        statusDiv.textContent = 'Audio split into 3 parts successfully!';
        statusDiv.className = 'text-success';
    });

    // Create UI element for an audio part
    function createAudioPartElement(buffer, partNumber) {
        const partDiv = document.createElement('div');
        partDiv.className = 'col-md-4 audio-part';

        // Create the audio item with properly organized controls
        partDiv.innerHTML = `<div class="audio-item">
<div class="audio-header">
    <div class="audio-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#50fa7b" width="18" height="18">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
    </div>
    <div class="audio-info">
        <h4 class="audio-title">Part ${partNumber}</h4>
        <p class="audio-meta">Loading...</p>
    </div>
</div>

<div class="audio-footer">
    <audio controls class="audio-player">
        <source src="part_${partNumber}.mp3" type="audio/mpeg">
    </audio>
    <button class="download-btn" title="Download">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
        </svg>
    </button>
</div>
</div>`;

        // Add responsive styles
        const style = document.createElement('style');
        style.textContent = `
.audio-item {

background-color: #282a36;
border-radius: 8px;
display: flex;
flex-direction: column;
text-align: left;
padding: 9px;
margin-bottom: 12px;
min-width: 300px;
max-width: 500px;
}

.audio-header {

display: flex;
align-items: left;
text-align: left;
justify-content: left;
align-items: flex-start;
gap: 10px;
margin-bottom: 4px;
}

.audio-icon {
flex-shrink: 0;
display: flex;
align-items: center;
margin-top: 2px;
}

.audio-info {
flex: 1;
min-width: 0;
}

.audio-title {
margin: 0;
font-size: 0.95rem;
color: #f8f8f2;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
}

.audio-meta {
margin: 4px 0 0;
font-size: 0.8rem;
color: #6272a4;
}

.audio-footer {
display: flex;
align-items: center;
gap: 12px;
width: 100%;
}

.audio-player {
flex: 1;
min-width: 0;
height: 36px;
}

.audio-player::-webkit-media-controls-panel {
background-color: #44475a;
border-radius: 6px;
padding: 0 8px;
}

.download-btn {
background: none;
border: none;
color: #50fa7b;
cursor: pointer;
padding: 6px;
border-radius: 4px;
flex-shrink: 0;
display: flex;
align-items: center;
justify-content: center;
transition: background-color 0.2s;
}

.download-btn:hover {
background-color: rgba(80, 250, 123, 0.1);
}

@media (max-width: 600px) {
.audio-item {
    padding: 10px;
    min-width: auto;
}

.audio-footer {
    flex-direction: column;
    gap: 8px;
}

.audio-player {
    width: 100%;
}

.download-btn {
    align-self: flex-end;
}
}
`;
        document.head.appendChild(style);

        const audioElement = partDiv.querySelector('audio');
        const downloadBtn = partDiv.querySelector('.download-btn');
        const audioMeta = partDiv.querySelector('.audio-meta');

        // Create object URL for playback
        const blob = bufferToWavBlob(buffer);
        const objectUrl = URL.createObjectURL(blob);
        audioElement.src = objectUrl;

        // Calculate and display file size and duration
        audioElement.addEventListener('loadedmetadata', function () {
            const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(1);
            const duration = audioElement.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
            audioMeta.textContent = `MP3 • ${fileSizeMB} MB • ${minutes}:${seconds}`;
        });

        // Set up download
        downloadBtn.addEventListener('click', function () {
            downloadAudio(blob, `part_${partNumber}.mp3`);
        });

        audioPartsDiv.appendChild(partDiv);
    }

    // Convert AudioBuffer to WAV Blob
    function bufferToWavBlob(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const length = buffer.length;

        // Create a buffer for the WAV header
        const wavHeaderSize = 44;
        const totalSize = wavHeaderSize + length * numChannels * 2; // 16-bit samples
        const wavBuffer = new ArrayBuffer(totalSize);
        const view = new DataView(wavBuffer);

        // Write the WAV header
        writeString(view, 0, 'RIFF');
        view.setUint32(4, totalSize - 8, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
        view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
        view.setUint16(32, numChannels * 2, true); // BlockAlign
        view.setUint16(34, 16, true); // BitsPerSample
        writeString(view, 36, 'data');
        view.setUint32(40, length * numChannels * 2, true);

        // Write the PCM samples
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i])); // clamp
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }

        return new Blob([wavBuffer], { type: 'audio/wav' });
    }

    // Helper function to write strings to the DataView
    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    // Download audio file
    function downloadAudio(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    // Send all parts to server
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Updated server upload function with progress simulation

        if (audioParts.length === 0) return;

        const uploadProgressContainer = document.getElementById('uploadProgressContainer');
        const uploadProgress = document.getElementById('uploadProgress');
        const uploadProgressText = document.getElementById('uploadProgressText');

        uploadProgressContainer.classList.remove('d-none');
        uploadProgress.style.width = '0%';
        uploadProgressText.textContent = 'Preparing upload...';

        statusDiv.textContent = 'Uploading parts to server...';
        statusDiv.className = 'text-info';

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);

                uploadProgressText.textContent = 'Upload complete!';
                statusDiv.textContent = 'All parts uploaded to server successfully!';
                statusDiv.className = 'text-success';

                setTimeout(() => {
                    uploadProgressContainer.classList.add('d-none');
                }, 2000);
            } else {
                uploadProgress.style.width = `${progress}%`;
                uploadProgressText.textContent = `Uploading: ${Math.round(progress)}%`;
            }
        }, 300);

        // In a real implementation, you would use XMLHttpRequest with progress event:
        /*
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                uploadProgress.style.width = `${percent}%`;
                uploadProgressText.textContent = `Uploading: ${Math.round(percent)}%`;
            }
        };
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                uploadProgress.style.width = '100%';
                uploadProgressText.textContent = 'Upload complete!';
                statusDiv.textContent = 'Upload successful!';
                statusDiv.className = 'text-success';
            } else {
                statusDiv.textContent = 'Upload failed: ' + xhr.statusText;
                statusDiv.className = 'text-danger';
            }
        };
        
        xhr.open('POST', '/upload', true);
        xhr.send(formData);
        */
    });
});