document.addEventListener('DOMContentLoaded', () => {
    // --- Globals & State ---
    const workflowCanvas = document.getElementById('workflow-canvas');
    const connectionsSvg = document.getElementById('connections-svg');
    const draggableSourceItems = document.querySelectorAll('.draggable-source-item');
    const videoInfoArea = document.getElementById('video-info-area');
    const videoFilenameEl = document.getElementById('video-filename');
    const videoPreviewPlaceholder = document.getElementById('video-preview-placeholder');
    const canvasInstructions = document.querySelector('.canvas-instructions');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    const saveWorkflowBtn = document.getElementById('saveWorkflowBtn');
    const loadWorkflowBtn = document.getElementById('loadWorkflowBtn');


    let nodes = {}; // { id: { el, x, y, type, config: {}, connections: [...] } }
    let connections = []; // { id, fromNode, toNode, fromCp, toCp }
    let activeLine = null;
    let selectedNodeForConnection = null;
    let selectedCpElement = null;
    let globalUploadedVideoInfo = null; // Store info about the uploaded video

    // --- Utility Functions ---
    function generateId(prefix = 'node-') {
        return `${prefix}${uuid.v4()}`;
    }

    function getCanvasOffset() {
        const rect = workflowCanvas.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
        };
    }

    function updateCanvasInstructions() {
        if (Object.keys(nodes).length === 0 && canvasInstructions) {
            canvasInstructions.style.display = 'block';
        } else if (canvasInstructions) {
            canvasInstructions.style.display = 'none';
        }
    }

    // --- Video Upload (Logic largely same, but tied to global var) ---
    const videoUploadModalEl = document.getElementById('videoUploadModal');
    const videoUploadModal = new bootstrap.Modal(videoUploadModalEl);
    const videoFileInput = document.getElementById('videoFile');
    const confirmUploadBtn = document.getElementById('confirmUploadBtn');
    const dropZone = document.getElementById('drop-zone');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadProgressContainer = document.getElementById('upload-progress-container');
    const uploadStatus = document.getElementById('upload-status');
    let tempUploadedFile = null; // Temporary file for modal interaction

    dropZone.addEventListener('click', () => videoFileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('video/')) {
            handleFile(files[0]);
        } else {
            uploadStatus.textContent = 'Please drop a valid video file.';
            uploadStatus.className = 'mt-2 text-danger';
        }
    });
    videoFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        tempUploadedFile = file;
        dropZone.innerHTML = `Selected: ${file.name} <br><small class="text-muted">Drag another or click to change</small>`;
        uploadStatus.textContent = '';
        confirmUploadBtn.disabled = false;
        uploadProgressContainer.classList.add('d-none');
        uploadProgressBar.style.width = '0%';
        uploadProgressBar.textContent = '0%';
    }

    confirmUploadBtn.addEventListener('click', () => {
        if (tempUploadedFile) {
            uploadStatus.textContent = `Processing ${tempUploadedFile.name}...`;
            uploadStatus.className = 'mt-2 text-info';
            uploadProgressContainer.classList.remove('d-none');
            let progress = 0;
            const interval = setInterval(() => {
                progress += 20; // Faster simulation
                uploadProgressBar.style.width = `${progress}%`;
                uploadProgressBar.textContent = `${progress}%`;
                if (progress >= 100) {
                    clearInterval(interval);
                    uploadStatus.textContent = `${tempUploadedFile.name} ready as source!`;
                    uploadStatus.className = 'mt-2 text-success';

                    globalUploadedVideoInfo = { name: tempUploadedFile.name, type: tempUploadedFile.type, size: tempUploadedFile.size };
                    videoFilenameEl.textContent = globalUploadedVideoInfo.name;
                    videoInfoArea.classList.remove('d-none');
                    videoPreviewPlaceholder.innerHTML = `<i class="fas fa-check-circle fa-2x text-success"></i><p class="mt-1 small">Video source set</p>`;

                    setTimeout(() => videoUploadModal.hide(), 1000);
                }
            }, 100);
        }
    });
    videoUploadModalEl.addEventListener('hidden.bs.modal', () => { /* Reset modal: same as before */
        dropZone.innerHTML = 'Drag & Drop video here or click to select';
        videoFileInput.value = ''; confirmUploadBtn.disabled = true; tempUploadedFile = null;
        uploadStatus.textContent = ''; uploadProgressContainer.classList.add('d-none');
        uploadProgressBar.style.width = '0%'; uploadProgressBar.textContent = '0%';
    });


    // --- Palette Item Drag & Drop ---
    draggableSourceItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            const blockType = e.target.closest('.draggable-source-item').dataset.blockType;
            e.dataTransfer.setData('text/plain', `new-block:${blockType}`);
            e.dataTransfer.effectAllowed = 'copy';
            item.classList.add('dragging-source'); // Optional: style source while dragging
            updateCanvasInstructions();
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging-source');
        });
    });

    workflowCanvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    workflowCanvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        if (data.startsWith('new-block:')) {
            const blockType = data.split(':')[1];
            const canvasOffset = getCanvasOffset();
            // Center the block under the mouse, considering a typical block width/height
            const x = e.clientX - canvasOffset.left - 110; // Approx half width of block
            const y = e.clientY - canvasOffset.top - 50;  // Approx half height of header
            createWorkflowBlock(blockType, x, y);
        }
    });

    // --- Workflow Block Creation & Functionality ---
    function createWorkflowBlock(type, x, y, existingNodeData = null) {
        const nodeId = existingNodeData ? existingNodeData.id : generateId('block-');
        const blockEl = document.createElement('div');
        blockEl.className = 'workflow-block'; // Renamed class
        blockEl.id = nodeId;
        blockEl.style.left = `${x}px`;
        blockEl.style.top = `${y}px`;

        let blockContentHTML = '';
        let blockTitle = 'Workflow Block';
        let blockIcon = 'fas fa-puzzle-piece'; // Default icon

        // --- BLOCK TYPE SPECIFIC UI ---
        switch (type) {
            case 'generic-task':
                blockTitle = 'Generic Task';
                blockIcon = 'fas fa-cogs';
                blockContentHTML = `
                    <div class="mb-2">
                        <label for="${nodeId}-taskName" class="form-label">Task Name:</label>
                        <input type="text" id="${nodeId}-taskName" class="form-control form-control-sm" value="${existingNodeData?.config?.taskName || 'Untitled Task'}">
                    </div>
                    <div>
                        <label for="${nodeId}-description" class="form-label">Description:</label>
                        <textarea id="${nodeId}-description" class="form-control form-control-sm" rows="2" placeholder="Details about this task...">${existingNodeData?.config?.description || ''}</textarea>
                    </div>
                `;
                break;
            case 'data-input':
                blockTitle = 'Data Input';
                blockIcon = 'fas fa-keyboard';
                blockContentHTML = `
                    <div class="mb-2">
                        <label for="${nodeId}-dataField" class="form-label">Data Field:</label>
                        <input type="text" id="${nodeId}-dataField" class="form-control form-control-sm" value="${existingNodeData?.config?.dataField || ''}" placeholder="e.g., User Name">
                    </div>
                    <div>
                        <label for="${nodeId}-dataType" class="form-label">Data Type:</label>
                        <select id="${nodeId}-dataType" class="form-select form-select-sm">
                            <option value="text" ${existingNodeData?.config?.dataType === 'text' ? 'selected' : ''}>Text</option>
                            <option value="number" ${existingNodeData?.config?.dataType === 'number' ? 'selected' : ''}>Number</option>
                            <option value="boolean" ${existingNodeData?.config?.dataType === 'boolean' ? 'selected' : ''}>Boolean</option>
                        </select>
                    </div>
                `;
                break;
            case 'send-email':
                blockTitle = 'Send Email';
                blockIcon = 'fas fa-envelope';
                blockContentHTML = `
                    <div class="mb-2">
                        <label for="${nodeId}-recipient" class="form-label">To:</label>
                        <input type="email" id="${nodeId}-recipient" class="form-control form-control-sm" value="${existingNodeData?.config?.recipient || ''}" placeholder="recipient@example.com">
                    </div>
                    <div class="mb-2">
                        <label for="${nodeId}-subject" class="form-label">Subject:</label>
                        <input type="text" id="${nodeId}-subject" class="form-control form-control-sm" value="${existingNodeData?.config?.subject || ''}" placeholder="Email Subject">
                    </div>
                `;
                break;
            default:
                blockContentHTML = `<p class="text-muted">Unknown block type: ${type}</p>`;
        }

        blockEl.innerHTML = `
            <div class="block-header bg-light">
                <span><i class="${blockIcon} block-icon text-secondary"></i>${blockTitle}</span>
                <button class="btn-close btn-sm delete-block-btn" aria-label="Delete"></button>
            </div>
            <div class="block-content">
                ${blockContentHTML}
            </div>
            <div class="connection-point cp-top" data-cp-id="top"></div>
            <div class="connection-point cp-bottom" data-cp-id="bottom"></div>
            <div class="connection-point cp-left" data-cp-id="left"></div>
            <div class="connection-point cp-right" data-cp-id="right"></div>
        `;

        workflowCanvas.appendChild(blockEl);

        nodes[nodeId] = {
            el: blockEl,
            x,
            y,
            type,
            config: existingNodeData ? existingNodeData.config : {}, // Initialize or load config
            connections: existingNodeData ? existingNodeData.connections : []
        };

        // Add event listeners for block controls
        makeBlockDraggable(blockEl);
        blockEl.querySelector('.delete-block-btn').addEventListener('click', () => deleteBlock(nodeId));
        blockEl.querySelectorAll('.connection-point').forEach(cp => {
            cp.addEventListener('click', (e) => handleConnectionPointClick(e, nodeId, cp));
        });

        // Listen for changes in config fields to update nodes[nodeId].config
        blockEl.querySelectorAll('.block-content input, .block-content textarea, .block-content select').forEach(input => {
            input.addEventListener('change', (e) => {
                nodes[nodeId].config[e.target.id.split('-')[1]] = e.target.value; // e.g., config.taskName = value
            });
             input.addEventListener('input', (e) => { // For real-time update on textareas/inputs
                if (e.target.tagName === 'TEXTAREA' || e.target.type === 'text' || e.target.type === 'email') {
                    nodes[nodeId].config[e.target.id.split('-')[1]] = e.target.value;
                }
            });
        });
        updateCanvasInstructions();
        return blockEl;
    }

    function makeBlockDraggable(blockEl) { // Renamed from makeNodeDraggable
        let offsetX, offsetY;
        let isDraggingBlock = false;

        const header = blockEl.querySelector('.block-header'); // Drag only by header
        (header || blockEl).addEventListener('mousedown', (e) => {
            if (e.target.closest('input, textarea, select, .connection-point, .delete-block-btn')) {
                return;
            }
            isDraggingBlock = true;
            blockEl.classList.add('dragging');
            blockEl.style.zIndex = (parseInt(blockEl.style.zIndex) || 10) + 100;

            const rect = blockEl.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            if (!isDraggingBlock) return;
            const canvasOffset = getCanvasOffset();
            let newX = e.clientX - canvasOffset.left - offsetX;
            let newY = e.clientY - canvasOffset.top - offsetY;

            // Basic boundary checks
            newX = Math.max(0, Math.min(newX, workflowCanvas.offsetWidth - blockEl.offsetWidth));
            newY = Math.max(0, Math.min(newY, workflowCanvas.offsetHeight - blockEl.offsetHeight));

            blockEl.style.left = `${newX}px`;
            blockEl.style.top = `${newY}px`;
            nodes[blockEl.id].x = newX;
            nodes[blockEl.id].y = newY;
            updateConnectionsForBlock(blockEl.id);
        }

        function onMouseUp() {
            if (!isDraggingBlock) return;
            isDraggingBlock = false;
            blockEl.classList.remove('dragging');
            blockEl.style.zIndex = (parseInt(blockEl.style.zIndex) || 110) - 100 +10; // Reset z-index relative to others
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    function deleteBlock(blockId) { // Renamed from deleteNode
        if (nodes[blockId]) {
            connections = connections.filter(conn => {
                if (conn.fromNode === blockId || conn.toNode === blockId) {
                    const lineEl = document.getElementById(conn.id);
                    if (lineEl) lineEl.remove();
                    return false;
                }
                return true;
            });
            nodes[blockId].el.remove();
            delete nodes[blockId];
            updateAllConnections();
            updateCanvasInstructions();
        }
    }

    clearCanvasBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear the entire canvas? This cannot be undone.")) {
            Object.keys(nodes).forEach(nodeId => {
                if (nodes[nodeId] && nodes[nodeId].el) {
                     nodes[nodeId].el.remove();
                }
            });
            nodes = {};
            connections = [];
            connectionsSvg.innerHTML = '';
            updateCanvasInstructions();
            if (globalUploadedVideoInfo) { // Optionally clear video info too, or keep it
                // videoInfoArea.classList.add('d-none');
                // globalUploadedVideoInfo = null;
            }
        }
    });

    // --- Node Connections (Logic largely same, renamed variables for clarity) ---
    function handleConnectionPointClick(event, blockId, cpElement) {
        event.stopPropagation();
        if (!selectedNodeForConnection) {
            selectedNodeForConnection = blockId;
            selectedCpElement = cpElement;
            cpElement.style.backgroundColor = '#0dcaf0'; // Highlight selected CP (Bootstrap info)
            nodes[blockId].el.classList.add('selected-for-connection');

            const startPos = getCpPosition(blockId, cpElement.dataset.cpId);
            activeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            activeLine.setAttribute('x1', startPos.x);
            activeLine.setAttribute('y1', startPos.y);
            activeLine.setAttribute('x2', startPos.x);
            activeLine.setAttribute('y2', startPos.y);
            activeLine.classList.add('active-drawing'); // For styling temp line
            connectionsSvg.appendChild(activeLine);

            workflowCanvas.addEventListener('mousemove', onDrawingConnection);
            // Click anywhere else on canvas (not a CP) to cancel
            workflowCanvas.addEventListener('click', cancelConnectionAttemptOnClick, { once: true });

        } else if (selectedNodeForConnection !== blockId) {
            const fromNodeId = selectedNodeForConnection;
            const toNodeId = blockId;
            const fromCpId = selectedCpElement.dataset.cpId;
            const toCpId = cpElement.dataset.cpId;

            // Prevent connecting a CP to itself or multiple outgoing from same CP (optional rule)
            // For simplicity, basic duplicate check:
            const existing = connections.find(c =>
                (c.fromNode === fromNodeId && c.toNode === toNodeId && c.fromCp === fromCpId && c.toCp === toCpId) ||
                (c.fromNode === toNodeId && c.toNode === fromNodeId && c.fromCp === toCpId && c.toCp === fromCpId)
            );

            if (!existing) {
                const connId = generateId('conn-');
                connections.push({ id: connId, fromNode: fromNodeId, toNode: toNodeId, fromCp: fromCpId, toCp: toCpId });
                // You might want to store connection info in the node objects themselves too
                // nodes[fromNodeId].connections.push({ to: toNodeId, cp: fromCpId, type: 'outgoing' });
                // nodes[toNodeId].connections.push({ from: fromNodeId, cp: toCpId, type: 'incoming' });
                drawConnection(connections[connections.length - 1]);
            }
            resetConnectionState();
        } else { // Clicked same node or same CP again
            resetConnectionState();
        }
    }

    function onDrawingConnection(e) {
        if (!activeLine) return;
        const canvasOffset = getCanvasOffset();
        const mouseX = e.clientX - canvasOffset.left;
        const mouseY = e.clientY - canvasOffset.top;
        activeLine.setAttribute('x2', mouseX);
        activeLine.setAttribute('y2', mouseY);
    }
    
    function cancelConnectionAttemptOnClick(e) {
        // If the click that triggered this was on a connection point,
        // handleConnectionPointClick would have already run and potentially reset state.
        // This ensures that if the click was *not* on a CP, the connection attempt is cancelled.
        if (selectedNodeForConnection && !e.target.closest('.connection-point')) {
            resetConnectionState();
        }
    }


    function resetConnectionState() {
        if (selectedNodeForConnection && nodes[selectedNodeForConnection] && nodes[selectedNodeForConnection].el) {
            nodes[selectedNodeForConnection].el.classList.remove('selected-for-connection');
        }
        if (selectedCpElement) {
            selectedCpElement.style.backgroundColor = ''; // Reset CP color
        }
        selectedNodeForConnection = null;
        selectedCpElement = null;
        if (activeLine) {
            activeLine.remove();
            activeLine = null;
        }
        workflowCanvas.removeEventListener('mousemove', onDrawingConnection);
        // The 'click' listener for cancelConnectionAttemptOnClick is {once: true}, so it auto-removes.
        // However, if another CP was clicked to complete a connection, it might not have fired.
        // It's safer to explicitly remove if needed, but {once:true} is often sufficient.
    }

    function getCpPosition(blockId, cpId) { // blockId instead of nodeId
        const node = nodes[blockId];
        if (!node || !node.el) return { x: 0, y: 0 }; // Robustness
        const blockEl = node.el;

        // Use stored relative positions (node.x, node.y) as they are relative to canvas
        let x = node.x;
        let y = node.y;

        const cpSize = 14; // Match CSS
        const cpOffset = cpSize / 2;

        switch (cpId) {
            case 'top':    return { x: x + blockEl.offsetWidth / 2, y: y };
            case 'bottom': return { x: x + blockEl.offsetWidth / 2, y: y + blockEl.offsetHeight };
            case 'left':   return { x: x, y: y + blockEl.offsetHeight / 2 };
            case 'right':  return { x: x + blockEl.offsetWidth, y: y + blockEl.offsetHeight / 2 };
            default:       return { x: x + blockEl.offsetWidth / 2, y: y + blockEl.offsetHeight / 2 };
        }
    }

    function drawConnection(conn) {
        const lineId = conn.id;
        let lineEl = document.getElementById(lineId);
        if (!lineEl) {
            lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            lineEl.id = lineId;
            lineEl.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent canvas click if line is over it
                confirmDeleteConnection(lineId);
            });
            connectionsSvg.appendChild(lineEl);
        }

        if (!nodes[conn.fromNode] || !nodes[conn.toNode]) { // If a node was deleted
             if(lineEl) lineEl.remove();
             connections = connections.filter(c => c.id !== conn.id); // Clean up
             return;
        }

        const pos1 = getCpPosition(conn.fromNode, conn.fromCp);
        const pos2 = getCpPosition(conn.toNode, conn.toCp);
        lineEl.setAttribute('x1', pos1.x);
        lineEl.setAttribute('y1', pos1.y);
        lineEl.setAttribute('x2', pos2.x);
        lineEl.setAttribute('y2', pos2.y);
    }

    function confirmDeleteConnection(connId) {
        if (confirm("Delete this connection?")) {
            deleteConnection(connId);
        }
    }

    function deleteConnection(connId) {
        const connIndex = connections.findIndex(c => c.id === connId);
        if (connIndex > -1) {
            connections.splice(connIndex, 1);
            const lineEl = document.getElementById(connId);
            if (lineEl) lineEl.remove();
        }
        resetConnectionState(); // Good practice to reset any pending connection UI
    }

    function updateConnectionsForBlock(blockId) { // blockId
        connections.forEach(conn => {
            if (conn.fromNode === blockId || conn.toNode === blockId) {
                drawConnection(conn);
            }
        });
    }

    function updateAllConnections() {
        // Efficiently redraw: Get all line elements, update or remove
        const existingLines = {};
        Array.from(connectionsSvg.children).forEach(line => existingLines[line.id] = line);

        connections.forEach(conn => {
            drawConnection(conn); // This will create if not exists or update if exists
            delete existingLines[conn.id]; // Mark as handled
        });
        // Remove any lines that are no longer in the connections array
        for (const lineId in existingLines) {
            existingLines[lineId].remove();
        }
    }

    // --- Save & Load Workflow ---
    saveWorkflowBtn.addEventListener('click', () => {
        const workflowData = {
            nodes: Object.values(nodes).map(node => ({ // Don't save node.el (DOM element)
                id: node.el.id,
                x: node.x,
                y: node.y,
                type: node.type,
                config: node.config
            })),
            connections: connections,
            videoSource: globalUploadedVideoInfo // Save video info if any
        };
        const jsonData = JSON.stringify(workflowData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'workflow.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Workflow saved!');
    });

    loadWorkflowBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const loadedData = JSON.parse(event.target.result);
                        rebuildWorkflowFromData(loadedData);
                        alert('Workflow loaded!');
                    } catch (error) {
                        console.error("Error loading workflow:", error);
                        alert('Failed to load workflow. Invalid file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    });

    function rebuildWorkflowFromData(data) {
        // Clear existing canvas
        Object.values(nodes).forEach(node => node.el.remove());
        connectionsSvg.innerHTML = '';
        nodes = {};
        connections = [];

        // Load video source info
        if (data.videoSource) {
            globalUploadedVideoInfo = data.videoSource;
            videoFilenameEl.textContent = globalUploadedVideoInfo.name;
            videoInfoArea.classList.remove('d-none');
            videoPreviewPlaceholder.innerHTML = `<i class="fas fa-check-circle fa-2x text-success"></i><p class="mt-1 small">Video source loaded</p>`;
        } else {
            videoInfoArea.classList.add('d-none');
            globalUploadedVideoInfo = null;
        }


        // Recreate nodes
        if (data.nodes) {
            data.nodes.forEach(nodeData => {
                createWorkflowBlock(nodeData.type, nodeData.x, nodeData.y, nodeData);
            });
        }

        // Recreate connections
        if (data.connections) {
            connections = data.connections;
            updateAllConnections();
        }
        updateCanvasInstructions();
    }

    // --- Initial Setup ---
    updateCanvasInstructions();
});