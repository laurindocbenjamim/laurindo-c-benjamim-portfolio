import {getUrlParams, getSecondParameterValue} from './utils.js'

const video = document.getElementById('videoPlayer');
const videoSource = document.querySelector('video source'); 
const speechText = document.getElementById('speechText');
const progressBar = document.getElementById('progress');
const progressContainer = document.getElementById('progress-bar');
const settingsMenu = document.getElementById('settingsMenu');
const muteButton = document.getElementById('muteButton');

const menuToggle = document.querySelector('.menu-toggle');
const customControls = document.querySelector('.custom-controls');

/*function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};

    for (const [key, value] of params) {
    result[key] = value;
    }

    return result;
}*/


//const params = getUrlParams()
const paramValue = getSecondParameterValue(window.location.search, 'file');
alert("Hello git codespace "+paramValue)
//console.log(params)
const videoSrc = paramValue ? `https:www.d-tuning.com/api/files-storage/video/get/${paramValue}` : "https:www.d-tuning.com/api/files-storage/video/get/AI_Agents_And_Agentic_Reasoning.mp4";
//alert("Hello git codespace "+videoSrc)
video.innerHTML = `<source src="${videoSrc}" type="video/mp4">`;


 // Toggle play and pause functionality
 function playPauseVideo() {
    if (video.paused) {
        video.play();
        document.querySelector('.custom-controls button:first-child i').classList.replace('fa-play', 'fa-pause');
    } else {
        video.pause();
        document.querySelector('.custom-controls button:first-child i').classList.replace('fa-pause', 'fa-play');
    }
}

// Toggle mute/unmute functionality
function toggleMute() {
    video.muted = !video.muted;
    muteButton.querySelector('i').classList.toggle('fa-volume-mute');
    muteButton.querySelector('i').classList.toggle('fa-volume-up');
}

// Toggle captions on/off
function toggleCaptions() {
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = tracks[i].mode === 'showing' ? 'hidden' : 'showing';
    }
}

// Toggle speech text visibility
function toggleSpeechText() {
    speechText.style.display = speechText.style.display === 'none' ? 'block' : 'none';
}

// Update video speed
function updateSpeed(value) {
    document.getElementById('speedValue').textContent = `${parseFloat((value * 100) / 2).toFixed(1)}%/2`;
    video.playbackRate = parseFloat(value);


}

// Update video volume
function updateVolume(value) {
    document.getElementById('volumeValue').textContent = `${parseFloat(value * 100).toFixed(1)}%/100`;

    video.volume = parseFloat(value);

    video.volume = parseFloat(value);

}

// Zoom in the video
function zoomInVideo() {
    const value = (parseFloat(video.style.transform?.match(/scale\((\d*\.?\d+)\)/)?.[1] || 1) + 0.1).toFixed(1)
    document.getElementById('zoomValue').textContent = `${parseFloat((value * 10) / 100).toFixed(1)}%`;

    video.style.transform = `scale(${value})`;

    video.style.transform = `scale(${value})`;


}

// Zoom out the video
function zoomOutVideo() {
    const value = Math.max(1, (parseFloat(video.style.transform?.match(/scale\((\d*\.?\d+)\)/)?.[1] || 1) - 0.1).toFixed(1))
    document.getElementById('zoomValue').textContent = `${value}%`;

    video.style.transform = `scale(${value})`;
}



// Seek to a specific part of the video when clicking the progress bar
function seekVideo(event) {
    const rect = progressContainer.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const width = rect.width;
    const seekTime = (offsetX / width) * video.duration;
    video.currentTime = seekTime;
}

// Update progress bar as video plays
video.addEventListener('timeupdate', () => {
    const progressPercent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
});

// Show the next button when the video ends
video.addEventListener('ended', () => {
    nextButton.style.display = 'block';
});

// Hide the next button when the video is playing
video.addEventListener('play', () => {
    nextButton.style.display = 'none';
});


// Toggle settings menu visibility
function toggleSettings() {
    settingsMenu.classList.toggle('active');
}


// Go fullscreen
function goFullScreen() {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.mozRequestFullScreen) { /* Firefox */
        video.mozRequestFullScreen();
    } else if (video.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) { /* IE/Edge */
        video.msRequestFullscreen();
    }
}

// Next video function (placeholder for actual video switching)
function nextVideo() {
    alert('Load the next video functionality here.');
}

// Toggle main menu visibility
function toggleMainMenu() {
    customControls.style.display = customControls.style.display === 'none' ? 'flex' : 'none';
}

document.querySelector('.custom-controls button:first-child i').classList.replace('fa-play', 'fa-pause');


document.querySelector('.custom-controls button:first-child i').classList.replace('fa-play', 'fa-pause');

// playPauseVideo()
//toggleMute()