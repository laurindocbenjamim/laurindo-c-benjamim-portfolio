   // Function to fetch and populate the list
   async function populateProjectList() {
    try {
        // Fetch the JSON file
        const response = await fetch('../assets/projects.json');
        const projects = await response.json();
        
        // Get the UL element
        const projectsList = document.querySelector('.projects-grid');

        // Clear any existing items
        projectsList.innerHTML = '';

        // Create and append list items for each service
        projects.forEach(project => {
            const listItem = document.createElement('div');
            listItem.classList.add("project-card");

            listItem.innerHTML = `
      
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="tech-stack">`;
                    
                   
                      for (const [key, value] of Object.entries(project.techStacks)) {
                        listItem.innerHTML += `<span class="tech-badge"><i class="${value}"></i> ${key}</span>`;
                      };   
                      
                    listItem.innerHTML += `</div>
                    <div class="project-links">
                        <a href="${project.url}" target="${project.target}">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Demo
                        </a>
                        <a href="${project.repository}" target="_blank">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                    </div>

    `;
    projectsList.appendChild(listItem);
        });

    } catch (error) {
        console.error('Error loading the services:', error);
        // Fallback to default items if JSON fails to load
        const projects = document.querySelector('.projects-grid');
        projects.innerHTML = `
    <div class="project-card">
                    <h3 class="project-title">MSpeeText - Stream</h3>
                    <p class="project-description">A test model application that uses the OpenAI API to convert audio speech into text in Streaming.</p>
                    <div class="tech-stack">
                        <span class="tech-badge"><i class="fas fa-robot"></i> OpenAI API</span>
                        <span class="tech-badge"><i class="fab fa-python"></i> Python</span>
                        <span class="tech-badge"><i class="fas fa-flask"></i> Flask</span>
                        <span class="tech-badge"><i class="fab fa-js"></i> JavaScript</span>
                        <span class="tech-badge"><i class="fab fa-bootstrap"></i> Bootstrap</span>
                        <span class="tech-badge"><i class="fab fa-html5"></i> HTML & CSS</span>
                    </div>
                    <div class="project-links">
                        <a href="stream-convert-speech-to-text.html" target="">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Demo
                        </a>
                        <a href="https://github.com/laurindocbenjamim/pylau-app-flask/tree/main/app/package_prompts/speech" target="_blank">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                    </div>
                </div>
    
  `;
    }
}
// Function to fetch and populate the list
// Run when the page loads
document.addEventListener('DOMContentLoaded', populateProjectList);