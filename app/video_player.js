import {getUrlParams} from './utils.js'

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
alert("Hello git codespace")

const params = getUrlParams()
console.log(params)
console.log(params.file)
const videoSrc = params ? `https:www.d-tuning.com/api/files-storage/video/get/${params.file}` : "https:www.d-tuning.com/api/files-storage/video/get/AI_Agents_And_Agentic_Reasoning.mp4";
video.innerHTML = `<source src="${videoSrc}" type="video/mp4">`;

