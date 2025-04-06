

    // Function to fetch and populate the list
    async function populateProjectList() {
        try {
            // Fetch the JSON file
            const response = await fetch('../assets/articles.json');
            const articles = await response.json();
            
            // Get the UL element 
            const articleList = document.querySelector('.article-list');
            const articleListMobile = document.getElementById('articleListMobile');

            // Clear any existing items
            articleList.innerHTML = '';
            articleListMobile.innerHTML = '';

            // Create and append list items for each service
            articles.forEach(article => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
          <a href="${article.url}">
                                <strong>${article.title}</strong>
                                <div class="article-meta">
                                    <span><i class="far fa-calendar"></i> ${article.datePublished}</span>
                                    <span><i class="far fa-clock"></i> ${article.timeToRead}</span>
                                </div>
                            </a>

        `;
                articleList.appendChild(listItem);
                articleListMobile.appendChild(listItem.cloneNode(true)); // Clone the list item for mobile
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


document.addEventListener("DOMContentLoaded", function () {

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
        });
    });

    // Mobile sidebar toggle
    const mobileSidebarToggle = document.querySelector('.mobile-sidebar-toggle');
    const mobileSidebar = document.querySelector('.mobile-sidebar');
    const mobileSidebarClose = document.querySelector('.mobile-sidebar-close');
    const mobileSidebarOverlay = document.querySelector('.mobile-sidebar-overlay');

    function toggleMobileSidebar() {
        mobileSidebar.classList.toggle('active');
        mobileSidebarOverlay.classList.toggle('active');
        document.body.style.overflow = mobileSidebar.classList.contains('active') ? 'hidden' : '';
    }

    mobileSidebarToggle.addEventListener('click', toggleMobileSidebar);
    mobileSidebarClose.addEventListener('click', toggleMobileSidebar);
    mobileSidebarOverlay.addEventListener('click', toggleMobileSidebar);

    // Close sidebar when clicking on a link
    document.querySelectorAll('.mobile-sidebar a').forEach(link => {
        link.addEventListener('click', toggleMobileSidebar);
    });

    // Prevent body scroll when sidebar is open
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileSidebar.classList.contains('active')) {
            toggleMobileSidebar();
        }
    });
});
