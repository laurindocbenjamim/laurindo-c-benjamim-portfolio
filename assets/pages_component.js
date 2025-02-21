
const loadHTML = (url, elementId) => {
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error(`${response.status} ${response.statusText} - ${response.url}`);
        })
        .then(data => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = data;
            } else {
                console.warn(`Element with ID '${elementId}' not found. Skipping content injection.`);
            }
        })
        .catch(err => console.error(`Failed to load ${url}:`, err));
};

// Load components safely
loadHTML('pages/navbar.html', 'navbar');
loadHTML('pages/sidebar.html', 'sidebar');
loadHTML('pages/footer.html', 'footer');
loadHTML('pages/cv_editor_navbar.html', 'cv_navbar_section');
loadHTML('pages/cv_editor.html', 'cv_body_section');
