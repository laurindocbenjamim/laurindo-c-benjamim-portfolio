import { router } from './routes.js';
//import ContactComponent from './contactComponent/contact.components.js'; // Step 1: Import the FormDataHandler class
//import { video_player_component } from './app/video_player.components.js'; // Step 1: Import the FormDataHandler class
//import { upload_video_component } from './app/upload_video.components.js'; // Step 1: Import the FormDataHandler class

// Update the add_page function if necessary
// Assuming add_page is already implemented correctly
function removeCanvasChildElement(parent, child){
    try {
        //var old = document.querySelector('canvas')
        if(child){
            parent.removeChild(child)
        }else{
            console.log(child)
        }
    } catch (error) {
        console.log(error)
    }
}

// Step 4: Initialize the router
document.addEventListener('DOMContentLoaded', (e) => {
    localStorage.setItem('current_page', 'home');
    // Initial route
    router();
    
    // Re-route every time the hash changes
    window.addEventListener('load', router);
    window.addEventListener('hashchange', router);
    
    if (localStorage.getItem('current_page') === './pages/home.html') {
        
    }else if (localStorage.getItem('current_page') === './pages/player_video.html') {
        
        /**
         *  This code below is used to add the script tag with
         * the js file path specific of the product page
         */
        let body = document.querySelector('body')        
        let script = document.createElement('script')
        script.setAttribute('id', "video_player")
        script.setAttribute('src', "app/video_player.js")
        const old = document.getElementById("video_player")
        removeCanvasChildElement(body, old)
        body.appendChild(script)

    }

   
});