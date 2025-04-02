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

        // Read file as array buffer
        const fileReader = new FileReader();

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
    splitBtn.addEventListener('click', function () {
        if (!audioBuffer) return;

        const numberOfChunks = document.getElementById('numberOfChunks').value;
        const duration = audioBuffer.duration;
        const partDuration = duration / numberOfChunks;

        audioParts = [];
        audioPartsDiv.innerHTML = '';

        for (let i = 0; i < numberOfChunks; i++) {
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

                // Copy the samples
                for (let j = startOffset; j < endOffset; j++) {
                    partChannelData[j - startOffset] = channelData[j];
                }
            }

            audioParts.push(partBuffer);

            // Create a download link for this part
            createAudioPartElement(partBuffer, i + 1);
        }

        resultsDiv.classList.remove('d-none');
        statusDiv.textContent = 'Audio split into 3 parts successfully!';
        statusDiv.className = 'text-success';
    });

    // Create UI element for an audio part
    function createAudioPartElement(buffer, partNumber) {
        const partDiv = document.createElement('div');
        partDiv.className = 'col-md-4 audio-part';

        partDiv.innerHTML = `
            <h6>Part ${partNumber}</h6>
            <audio controls class="w-100 mb-2"></audio>
            <button class="btn btn-sm btn-primary download-part">Download Part ${partNumber}</button>
        `;

        const audioElement = partDiv.querySelector('audio');
        const downloadBtn = partDiv.querySelector('.download-part');

        // Create object URL for playback
        const blob = bufferToWavBlob(buffer);
        const objectUrl = URL.createObjectURL(blob);
        audioElement.src = objectUrl;

        // Set up download
        downloadBtn.addEventListener('click', function () {
            downloadAudio(blob, `part_${partNumber}.wav`);
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