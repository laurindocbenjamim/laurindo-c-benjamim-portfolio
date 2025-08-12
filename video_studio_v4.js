
document.addEventListener("DOMContentLoaded", () => {
    //const toggleListBtn = document.querySelector(".toggle-list-btn");
    const fileList = document.getElementById("fileList");

    /*toggleListBtn.addEventListener("click", () => {
        const isExpanded = toggleListBtn.getAttribute("aria-expanded") === "true";
        toggleListBtn.setAttribute("aria-expanded", !isExpanded);
        fileList.style.maxHeight = isExpanded ? "0" : "200px";
    });*/



    // Server configuration
    let baseURL = window.location.origin.includes('laurindocbenjamim.github.io')
        ? window.location.origin + '/laurindo-c-benjamim-portfolio'
        : window.location.origin;

    let serverDomain = 'https://192.168.1.167:8443';//'http://localhost:5000';

    if (baseURL.includes('.github.io') || baseURL.includes('laurindocbenjamim.pt')) {
        serverDomain = 'https://www.d-tuning.com';
    }

    // Simulate fetching files from the server
    fetch(`${serverDomain}/api/v1/cloud_storage/files/list`)
        .then(response => response.json())
        .then(data => {
            console.log("Files.....")
            console.log(data)
            
            if (data.files) { 
                fileList.innerHTML = ""; // Clear existing list items
                data.files.forEach(file => {
                    
                    const listItem = document.createElement("li"); //class="list-group-item"
                    listItem.className = "file-item";
                    /*listItem.innerHTML = `<span class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover" >
                    <span>${file}</span></span>`;*/
                    const fileIcons = {
                        '.txt': 'fas fa-file-alt text-info',
                        '.mp4': 'fas fa-file-video text-primary',
                        '.mp3': 'fas fa-file-audio text-success'
                    };

                    const fileActions = {
                        '.txt': `<button class="btn btn-sm btn-link text-secondary">
                                    <i class="fas fa-eye"></i>
                                </button>`,
                        '.mp4': `<button onclick="loadVideoFromApi(${file}, ${true})" class="btn btn-sm btn-link text-secondary">
                                    <i class="fas fa-play"></i>
                                </button>`,
                        '.mp3': `<button onclick="loadAudioFromApi(${file})" class="btn btn-sm btn-link text-secondary">
                                    <i class="fas fa-play"></i>
                                </button>`
                    };

                    const fileExtension = Object.keys(fileIcons).find(ext => file.includes(ext));

                    if (fileExtension) {
                        listItem.innerHTML = `
                            <i class="${fileIcons[fileExtension]} me-2"></i>
                            <span>${file}</span>
                            <div class="file-actions">
                                ${fileActions[fileExtension]}
                                <button class="btn btn-sm btn-link text-secondary">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>`;
                    }


                   fileList.appendChild(listItem);
                });
                const testFileItem = document.createElement("li");
                testFileItem.className = "file-item";

                const fileIcon = document.createElement("i");
                fileIcon.className = "fas fa-file-video text-primary me-2";

                const fileName = document.createElement("span");
                fileName.textContent = "This is a test of component.mp4";

                const fileActions = document.createElement("div");
                fileActions.className = "file-actions";

                const playButton = document.createElement("button");
                playButton.className = "btn btn-sm btn-link text-secondary";
                const playIcon = document.createElement("i");
                playIcon.className = "fas fa-play";
                playButton.appendChild(playIcon);

                const downloadButton = document.createElement("button");
                downloadButton.className = "btn btn-sm btn-link text-secondary";
                const downloadIcon = document.createElement("i");
                downloadIcon.className = "fas fa-download";
                downloadButton.appendChild(downloadIcon);

                fileActions.appendChild(playButton);
                fileActions.appendChild(downloadButton);

                testFileItem.appendChild(fileIcon);
                testFileItem.appendChild(fileName);
                testFileItem.appendChild(fileActions);

                //fileList.appendChild(testFileItem);
            }else if(data.message){
                alert("Error found. "+data.message)
            }

        })
        .catch(error => {
            console.error("Error fetching files:", error);
            fileList.innerHTML = `<li class="list-group-item text-danger">Failed to load files</li>`;
        });

    // Initialize Bootstrap components
    const uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));
    const uploadTabs = new bootstrap.Tab(document.getElementById('uploadTabs'));

    // DOM elements
    const uploadBtn = document.getElementById('uploadBtn');
    const submitUpload = document.getElementById('submitUpload');
    const mediaFilesInput = document.getElementById('mediaFiles');
    const videoPlayer = document.getElementById('videoPlayer');
    const audioPlayer = document.getElementById('audioPlayer');
    const textContainer = document.getElementById('textContainer');
    const videoContainer = document.getElementById('videoContainer');
    const audioSection = document.getElementById('audioSection');
    const textSection = document.getElementById('textSection');
    const urlUploadForm = document.getElementById('urlUploadForm');
    const urlLoadingIndicator = document.getElementById('urlLoadingIndicator');
    const urlErrorMessage = document.getElementById('urlErrorMessage');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    


    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) return cookieValue;
        }
        return null;
    }

    function getOptions(method, formData) {
        if (!method || !formData) { return null; };

        const headers = {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token'),
        };
        const options = {
            method: method,
            credentials: 'include',// method === 'GET' ? 'same-origin' : 'include',
            headers: headers,
        };
        if (method !== 'GET') {
            options.body = formData;
        }
        console.log(options)
        return options;
    };

    // Track current active tab
    let currentTab = 'file';

    // Tab change event
    document.getElementById('uploadTabs').addEventListener('shown.bs.tab', function (event) {
        currentTab = event.target.id.split('-')[0]; // 'file' or 'url'
    });

    // Toggle sidebar on mobile
    sidebarToggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function (event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggle = sidebarToggle.contains(event.target);

        if (!isClickInsideSidebar && !isClickOnToggle && window.innerWidth < 992) {
            sidebar.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    });

    // Open modal when upload button is clicked
    uploadBtn.addEventListener('click', function () {
        uploadModal.show();
    });

    // Handle form submission based on active tab
    submitUpload.addEventListener('click', function () {
        if (currentTab === 'file') {
            handleFileUpload();
        } else {
            handleUrlUpload();
        }
    });

    function handleFileUpload() {
        const files = mediaFilesInput.files;
        const autoPlay = document.getElementById('autoPlay').checked;

        if (files.length === 0) {
            alert('Please select at least one file to upload');
            return;
        }

        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileType = file.type.split('/')[0];

            if (fileType === 'video') {
                handleVideoUpload(file, autoPlay);
            } else if (fileType === 'audio') {
                handleAudioUpload(file);
            } else if (file.type === 'text/plain') {
                handleTextUpload(file);
            } else {
                console.log('Unsupported file type:', file.type);
            }
        }

        uploadModal.hide();
        document.getElementById('uploadForm').reset();
    }

    async function handleUrlUpload() {
        const url = document.getElementById('mediaUrl').value.trim();
        const urlType = document.getElementById('urlType').value;
        const autoPlay = document.getElementById('urlAutoPlay').checked;

        /*if (!url) {
            showUrlError('Please enter a valid URL');
            return;
        }
        
        // Validate URL format
        let validUrl;
        try {
            validUrl = new URL(url);
        } catch (e) {
            showUrlError('Please enter a valid URL');
            return;
        }*/


        // Show loading indicator
        urlLoadingIndicator.classList.add('active');
        urlErrorMessage.textContent = '';

        try {
            if (urlType === 'text') {
                await loadTextFromUrl(url);
            } else if (urlType === 'video') {
                await loadVideoFromApi(url, autoPlay);
            } else if (urlType === 'audio') {
                await loadAudioFromApi(url);
            }
            uploadModal.hide();
            urlUploadForm.reset();
        } catch (error) {
            console.error('Error loading from URL:', error);
            console.log(error)
            showUrlError(error.message || 'Failed to load media from URL. Please check the URL and try again.');
        } finally {
            urlLoadingIndicator.classList.remove('active');
        }
    }

    async function loadVideoFromApi(url, autoPlay) {

        try {
            urlLoadingIndicator.querySelector('p').textContent = 'Fetching video from API...';


            const response = await fetch(`${serverDomain}/api/v1/video/get/${url}`);

            if (!response.ok) {
                throw new Error('Network response was not OK');
            }

            const reader = response.body.getReader();

            const stream = new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                controller.close();
                                return;
                            }
                            controller.enqueue(value);
                            push();
                        });
                    }
                    push();
                }
            });

            const blobResponse = await new Response(stream).blob();
            const videoUrl = URL.createObjectURL(blobResponse);

            //document.getElementById('videoPlayer').src = videoUrl;

            videoPlayer.classList.remove('d-none');
            videoContainer.querySelector('.empty-state').classList.add('d-none');

            videoPlayer.src = videoUrl;
            videoPlayer.load();

            /******** end **** */


            /*if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API request failed');
            }

            const videoData = await response.json();

            // Assuming the API returns a direct video URL or a streaming URL
            if (!videoData.url) {
                throw new Error('No video URL returned from API');
            }

            videoPlayer.classList.remove('d-none');
            videoContainer.querySelector('.empty-state').classList.add('d-none');

            videoPlayer.src = videoData.url;
            videoPlayer.load();*/

            if (autoPlay) {
                try {
                    await videoPlayer.play();
                } catch (e) {
                    console.log('Autoplay prevented:', e);
                }
            }

            addVideoControls();

        } catch (error) {
            console.error('Error loading video:', error);
            throw error;
        }
    }


    async function loadAudioFromApi(url) {
        try {
            urlLoadingIndicator.querySelector('p').textContent = 'Fetching audio from API...';

            // You might use the same endpoint or a different one for audio
            /*const response = await fetch(`${serverDomain}/api/v1/video/get`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // Add if your API requires auth
                },
                body: JSON.stringify({
                    url: url,
                    // Add any additional parameters your API expects
                })
            });*/

            const response = await fetch(`${serverDomain}/api/v1/video/get/${url}`);

            if (!response.ok) {
                throw new Error('Network response was not OK');
            }

            const reader = response.body.getReader();

            const stream = new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                controller.close();
                                return;
                            }
                            controller.enqueue(value);
                            push();
                        });
                    }
                    push();
                }
            });

            const blobResponse = await new Response(stream).blob();
            const videoUrl = URL.createObjectURL(blobResponse);



            /* if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'API request failed');
             }
 
             const audioData = await response.json();
 
             if (!audioData.url) {
                 throw new Error('No audio URL returned from API');
             }*/

            audioSection.classList.remove('d-none');
            audioPlayer.src = videoUrl;
            audioPlayer.load();
            addAudioControls();

        } catch (error) {
            console.error('Error loading audio:', error);
            throw error;
        }
    }

    async function loadTextFromUrl(url) {
        try {
            urlLoadingIndicator.querySelector('p').textContent = 'Fetching text content...';

            // In a real app, you might want to proxy this through your API
            const response = await fetch(`${serverDomain}/api/v1/text/get`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch text');
            }

            const textData = await response.json();

            textSection.classList.remove('d-none');
            textContainer.textContent = textData.content || 'No content available';
        } catch (error) {
            console.error('Error loading text:', error);
            throw error;
        }
    }

    function showUrlError(message) {
        urlErrorMessage.textContent = message;
    }

    function handleVideoUpload(file, autoPlay) {
        const videoURL = URL.createObjectURL(file);

        // Show video player and hide empty state
        videoPlayer.classList.remove('d-none');
        videoContainer.querySelector('.empty-state').classList.add('d-none');

        videoPlayer.src = videoURL;
        videoPlayer.load();

        if (autoPlay) {
            videoPlayer.play().catch(e => console.log('Autoplay prevented:', e));
        }

        // Add video controls
        addVideoControls();
    }

    function handleAudioUpload(file) {
        const audioURL = URL.createObjectURL(file);

        // Show audio section
        audioSection.classList.remove('d-none');

        audioPlayer.src = audioURL;
        audioPlayer.load();

        // Add audio controls event listeners
        addAudioControls();
    }

    function handleTextUpload(file) {
        // Show text section
        textSection.classList.remove('d-none');

        const reader = new FileReader();
        reader.onload = function (e) {
            textContainer.textContent = e.target.result;
        };
        reader.readAsText(file);
    }

    function addVideoControls() {
        // Speed control
        const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
        let currentSpeedIndex = 2; // Default to 1.0

        // Add event listener for speed control if not already added
        if (!videoPlayer.hasAttribute('data-speed-control-added')) {
            videoPlayer.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                currentSpeedIndex = (currentSpeedIndex + 1) % speedOptions.length;
                videoPlayer.playbackRate = speedOptions[currentSpeedIndex];

                // Show speed indicator
                const indicator = document.createElement('div');
                indicator.className = 'speed-indicator';
                indicator.textContent = speedOptions[currentSpeedIndex] + 'x';
                videoContainer.appendChild(indicator);

                setTimeout(() => {
                    indicator.remove();
                }, 1000);
            });

            videoPlayer.setAttribute('data-speed-control-added', 'true');
        }
    }

    function addAudioControls() {
        const speedControl = document.querySelector('.audio-controls .speed-control');
        const repeatControl = document.querySelector('.audio-controls .repeat-control');
        const muteControl = document.querySelector('.audio-controls .mute-control');

        const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
        let currentSpeedIndex = 2; // Default to 1.0
        let isRepeating = false;

        // Speed control
        speedControl.addEventListener('click', function () {
            currentSpeedIndex = (currentSpeedIndex + 1) % speedOptions.length;
            audioPlayer.playbackRate = speedOptions[currentSpeedIndex];
            speedControl.textContent = speedOptions[currentSpeedIndex] + 'x';
        });

        // Repeat control
        repeatControl.addEventListener('click', function () {
            isRepeating = !isRepeating;
            audioPlayer.loop = isRepeating;
            repeatControl.classList.toggle('active', isRepeating);
        });

        // Mute control
        muteControl.addEventListener('click', function () {
            audioPlayer.muted = !audioPlayer.muted;
            if (audioPlayer.muted) {
                muteControl.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else {
                muteControl.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        });
    }

    // Handle window resize
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 992) {
            sidebar.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    });

    // Custom right-click menu prevention for video (except for our speed control)
    document.addEventListener('contextmenu', function (e) {
        if (e.target === videoPlayer) {
            return; // Let our speed control work
        }
        e.preventDefault();
    }, false);
});