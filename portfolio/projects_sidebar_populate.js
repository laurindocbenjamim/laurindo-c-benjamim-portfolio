   // Function to fetch and populate the list
   async function populateProjectList() {
    try {
        // Fetch the JSON file
        const response = await fetch('../assets/projects.json');
        const services = await response.json();
        
        // Get the UL element
        const articleList = document.querySelector('.article-list');

        // Clear any existing items
        articleList.innerHTML = '';

        // Create and append list items for each service
        services.forEach(service => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
      <a href="${service.url}">
        <strong>${service.title}</strong>
        <div class="article-meta">
          <span><i class="far fa-clock"></i> ${service.description}</span>
        </div>
      </a>
    `;
            articleList.appendChild(listItem);
        });

    } catch (error) {
        console.error('Error loading the services:', error);
        // Fallback to default items if JSON fails to load
        const articleList = document.querySelector('.article-list');
        articleList.innerHTML = `
    <li>
      <a href="#">
        <strong>Audio Transcription Service</strong>
        <div class="article-meta">
          <span><i class="far fa-clock"></i> Fast processing</span>
        </div>
      </a>
    </li>
    
  `;
    }
}
// Function to fetch and populate the list
// Run when the page loads
document.addEventListener('DOMContentLoaded', populateProjectList);