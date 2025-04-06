 // Scroll progress indicator
 window.addEventListener('scroll', function() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollProgress = (scrollTop / scrollHeight) * 100;
    document.querySelector('.scroll-progress').style.width = scrollProgress + '%';
});

// Scroll animation for article cards
function animateOnScroll() {
    const articleCards = document.querySelectorAll('.article-card');
    const windowHeight = window.innerHeight;
    const triggerPoint = windowHeight * 0.8;

    articleCards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        
        if (cardTop < triggerPoint) {
            card.classList.add('visible');
        }
    });
}

// Initialize animation on load
window.addEventListener('load', animateOnScroll);

// Update animation on scroll
window.addEventListener('scroll', animateOnScroll);

// Animate all cards immediately if page is loaded scrolled down
document.addEventListener('DOMContentLoaded', function() {
    if (window.scrollY > 0) {
        animateOnScroll();
    }
});



    // Function to fetch and populate the list
    async function populateProjectList() {
        try {
            // Fetch the JSON file
            const response = await fetch('../assets/articles.json');
            const articles = await response.json();
            
            // Get the UL element
            const articleList = document.querySelector('.articles-grid');

            // Clear any existing items
            articleList.innerHTML = '';

            // Create and append list items for each service
            articles.forEach(article => {
                const articleItem = document.createElement('article');
                articleItem.classList.add('article-card');

                const articleImage = `<div class="article-image">
                        <img src="${article.image}" 
                             alt="Data Pipeline Visualization" 
                             class="img-fluid rounded"
                             loading="lazy">
                    </div>`;
                    
               
                    if(article.welcome) {
                        articleItem.classList.add('featured-article');
                    }
    
                    articleItem.innerHTML += `
                        <div>
                        ${article.welcome? '<span class="article-category">Data Science</span>' : ''}
                            
                            <h3 class="article-title">${article.title}</h3>
                            <p class="article-excerpt">${article.description}</p>
                            <a href="${article.url}" class="read-more">
                                Read Article
                                <i class="fas fa-arrow-right"></i>
                            </a>
                            <div class="article-meta">
                                <span class="article-date">${article.datePublished}</span>
                                <span class="article-read-time">
                                    <i class="far fa-clock"></i> ${article.timeToRead}
                                </span>
                            </div>
                        </div>
                        ${article.image? articleImage : ''}
                        </div>
                        `;

        
                articleList.appendChild(articleItem);
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