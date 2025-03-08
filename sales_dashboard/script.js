document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('video');
    const playPauseBtn = document.getElementById('play-pause');
    const muteUnmuteBtn = document.getElementById('mute-unmute');
    const settingsBtn = document.getElementById('settings');
    const fullscreenBtn = document.getElementById('fullscreen');
    const settingsMenu = document.getElementById('settings-menu');
    const nextVideoBtn = document.getElementById('next-video');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');
    const playbackSpeedSelect = document.getElementById('playback-speed');
    const videoQualitySelect = document.getElementById('video-quality');

    // Play/Pause functionality
    playPauseBtn.addEventListener('click', function () {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        }
    });

    // Mute/Unmute functionality
    muteUnmuteBtn.addEventListener('click', function () {
        video.muted = !video.muted;
        muteUnmuteBtn.innerHTML = video.muted ? '<i class="bi bi-volume-mute-fill"></i>' : '<i class="bi bi-volume-up-fill"></i>';
    });

    // Settings menu toggle
    settingsBtn.addEventListener('click', function () {
        settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'block' : 'none';
    });

    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', function () {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.mozRequestFullScreen) { // Firefox
            video.mozRequestFullScreen();
        } else if (video.webkitRequestFullscreen) { // Chrome, Safari and Opera
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) { // IE/Edge
            video.msRequestFullscreen();
        }
    });

    // Update current time and total time
    video.addEventListener('timeupdate', function () {
        const currentMinutes = Math.floor(video.currentTime / 60);
        const currentSeconds = Math.floor(video.currentTime % 60);
        const totalMinutes = Math.floor(video.duration / 60);
        const totalSeconds = Math.floor(video.duration % 60);
        currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
        totalTimeDisplay.textContent = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
    });

    // Playback speed change
    playbackSpeedSelect.addEventListener('change', function () {
        video.playbackRate = playbackSpeedSelect.value;
    });

    // Video quality change (this is a placeholder, actual implementation depends on video source)
    videoQualitySelect.addEventListener('change', function () {
        alert(`Quality changed to ${videoQualitySelect.value}`);
    });

    // Show next video button when video ends
    video.addEventListener('ended', function () {
        nextVideoBtn.style.display = 'block';
    });

    // Next video button functionality (placeholder)
    nextVideoBtn.addEventListener('click', function () {
        alert('Next video function not implemented');
    });
});
