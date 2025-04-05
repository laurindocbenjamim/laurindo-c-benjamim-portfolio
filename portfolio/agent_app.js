document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const aiPrompt = document.getElementById('aiPrompt');
    const executeAI = document.getElementById('executeAI');
    const aiResponse = document.getElementById('aiResponse');
    const aiProvider = document.getElementById('aiProvider');
    const startControl = document.getElementById('startControl');
    const stopControl = document.getElementById('stopControl');
    const cursorCanvas = document.getElementById('cursorCanvas');
    const openWebsiteBtn = document.getElementById('openWebsiteBtn');
    const websiteUrl = document.getElementById('websiteUrl');
    
    // Canvas setup
    const ctx = cursorCanvas.getContext('2d');
    let cursorPosition = { x: cursorCanvas.width / 2, y: cursorCanvas.height / 2 };
    let isControlling = false;
    
    // Draw cursor on canvas
    function drawCursor() {
        ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
        
        // Draw cursor
        ctx.beginPath();
        ctx.moveTo(cursorPosition.x, cursorPosition.y);
        ctx.lineTo(cursorPosition.x + 10, cursorPosition.y + 15);
        ctx.lineTo(cursorPosition.x + 5, cursorPosition.y + 12);
        ctx.lineTo(cursorPosition.x, cursorPosition.y + 20);
        ctx.closePath();
        ctx.fillStyle = 'black';
        ctx.fill();
    }
    
    // Initialize canvas
    drawCursor();
    
    // Task Management
    let tasks = [];
    
    function addTask(text) {
        if (text.trim() === '') return;
        
        const task = {
            id: Date.now(),
            text: text,
            completed: false
        };
        
        tasks.push(task);
        renderTasks();
        taskInput.value = '';
    }
    
    function renderTasks() {
        taskList.innerHTML = '';
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `list-group-item d-flex justify-content-between align-items-center task-item ${task.completed ? 'list-group-item-success' : ''}`;
            li.innerHTML = `
                <span>${task.text}</span>
                <div>
                    <button class="btn btn-sm ${task.completed ? 'btn-warning' : 'btn-success'} complete-btn me-1" data-id="${task.id}">
                        ${task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${task.id}">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }
    
    // Event listeners for tasks
    addTaskBtn.addEventListener('click', () => addTask(taskInput.value));
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask(taskInput.value);
    });
    
    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('complete-btn')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const task = tasks.find(t => t.id === id);
            if (task) task.completed = !task.completed;
            renderTasks();
        }
        
        if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        }
    });
    
    // Cursor Control
    startControl.addEventListener('click', () => {
        isControlling = true;
        aiResponse.innerHTML = '<p class="text-success">Cursor control activated. AI can now move the cursor.</p>';
    });
    
    stopControl.addEventListener('click', () => {
        isControlling = false;
        aiResponse.innerHTML = '<p class="text-danger">Cursor control deactivated.</p>';
    });
    
    // Move cursor function
    function moveCursor(dx, dy) {
        if (!isControlling) return;
        
        cursorPosition.x = Math.max(0, Math.min(cursorCanvas.width, cursorPosition.x + dx));
        cursorPosition.y = Math.max(0, Math.min(cursorCanvas.height, cursorPosition.y + dy));
        drawCursor();
    }
    
    // Open website
    openWebsiteBtn.addEventListener('click', () => {
        const url = websiteUrl.value.trim();
        if (url) {
            window.open(url, '_blank');
        }
    });
    
    // AI Integration
    executeAI.addEventListener('click', async () => {
        const prompt = aiPrompt.value.trim();
        if (!prompt) return;
        
        aiResponse.innerHTML = '<p>Processing your request with AI...</p>';
        
        try {
            const response = await callAIAPI(prompt, aiProvider.value);
            processAIResponse(response);
        } catch (error) {
            aiResponse.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
        }
    });
    
    // Mock AI API call (replace with actual API calls)
    async function callAIAPI(prompt, provider) {
        // In a real app, you would make actual API calls here
        // This is a mock implementation for demonstration
        
        return new Promise((resolve) => {
            setTimeout(() => {
                let response;
                
                if (provider === 'openai') {
                    response = {
                        text: `OpenAI response to: "${prompt}". Based on your request, I'll perform the following actions:`,
                        actions: []
                    };
                    
                    if (prompt.toLowerCase().includes('move cursor')) {
                        response.actions.push({
                            type: 'move_cursor',
                            dx: Math.floor(Math.random() * 50) - 25,
                            dy: Math.floor(Math.random() * 50) - 25
                        });
                    }
                    
                    if (prompt.toLowerCase().includes('open website') || prompt.toLowerCase().includes('open ')) {
                        const websites = {
                            'google': 'https://google.com',
                            'youtube': 'https://youtube.com',
                            'github': 'https://github.com',
                            'twitter': 'https://twitter.com'
                        };
                        
                        for (const [site, url] of Object.entries(websites)) {
                            if (prompt.toLowerCase().includes(site)) {
                                response.actions.push({
                                    type: 'open_website',
                                    url: url
                                });
                                break;
                            }
                        }
                    }
                    
                    if (prompt.toLowerCase().includes('add task')) {
                        const taskText = prompt.replace(/add task/i, '').trim();
                        if (taskText) {
                            response.actions.push({
                                type: 'add_task',
                                text: taskText
                            });
                        }
                    }
                } else { // DeepSeek
                    response = {
                        text: `DeepSeek response to: "${prompt}". I'll help you with that.`,
                        actions: []
                    };
                    
                    // Similar logic for DeepSeek
                    if (prompt.toLowerCase().includes('move')) {
                        response.actions.push({
                            type: 'move_cursor',
                            dx: Math.floor(Math.random() * 30) - 15,
                            dy: Math.floor(Math.random() * 30) - 15
                        });
                    }
                }
                
                resolve(response);
            }, 1500);
        });
    }
    
    // Process AI response and execute actions
    function processAIResponse(response) {
        let html = `<p>${response.text}</p><ul>`;
        
        if (response.actions && response.actions.length > 0) {
            response.actions.forEach(action => {
                html += `<li>Executing: ${JSON.stringify(action)}</li>`;
                
                switch (action.type) {
                    case 'move_cursor':
                        moveCursor(action.dx, action.dy);
                        break;
                    case 'open_website':
                        window.open(action.url, '_blank');
                        websiteUrl.value = action.url;
                        break;
                    case 'add_task':
                        addTask(action.text);
                        break;
                }
            });
        } else {
            html += `<li>No actions to execute</li>`;
        }
        
        html += '</ul>';
        aiResponse.innerHTML = html;
    }
    
    // For demonstration: simulate cursor movement with arrow keys
    document.addEventListener('keydown', (e) => {
        if (!isControlling) return;
        
        switch (e.key) {
            case 'ArrowUp':
                moveCursor(0, -10);
                break;
            case 'ArrowDown':
                moveCursor(0, 10);
                break;
            case 'ArrowLeft':
                moveCursor(-10, 0);
                break;
            case 'ArrowRight':
                moveCursor(10, 0);
                break;
        }
    });
});