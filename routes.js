// Step 1: Define routes
const routes = {
    '#/': './pages/home.html',
    '#/video-player': './pages/player_video.html',
    /*'#/countries': './pages/countries.html',
    '#/home': './pages/home.html',
    '#/visualizer': './pages/visualizer.html',
    '#/products': './pages/netcaixa/products.html',*/
    // Add more routes here
};


// Step 2: Implementing the router function
// Step 2: Implementing the router function
export const router = () => {
    let path = window.location.hash;
    // Automatically add '#' if it's missing and not just '/'
    // Check if the path is just '/', and if so, prepend '#' to make it '#/'
    if (!path.startsWith('#/') && path !== '/') {
        path = '#/' + path.replace(/^\/|#/g, ''); // Remove leading '/' or '#' before prepending '#/'
        window.location.hash = path; // Update the URL
        return; // Exit the function to allow the hashchange event to trigger router again with corrected hash
    }

    // Get the page path from the routes object
    const page_path = routes[path] || routes['#/']; // Fallback to the home page if the route does not exist/found
    
    // Fetch the page content
    fetch(page_path)
        .then(response => response.text())
        .then(data => {
            // Insert the page content into the container element
            document.querySelector('.container').innerHTML = data;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    localStorage.setItem('current_page', page_path);
    console.log(`Loaded page: ${page_path}`);
};