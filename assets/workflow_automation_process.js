$(document).ready(function() {
    // First, ensure jsPlumb is loaded
    if (typeof jsPlumb === 'undefined') {
        console.error("jsPlumb not loaded");
        // Show user-friendly error message
        Swal.fire({
            icon: 'error',
            title: 'Loading Error',
            text: 'Required libraries failed to load. Please refresh the page.',
            confirmButtonText: 'Refresh',
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
            }
        });
        return;
    }

    // Initialize the workflow builder
    initWorkflowBuilder();
});

function initWorkflowBuilder() {
    // Initialize jsPlumb instance
    const jsPlumbInstance = jsPlumb.getInstance({
        Container: "workflow-canvas",
        Connector: ["Flowchart", { curviness: 20 }],
        Anchors: ["BottomCenter", "TopCenter"],
        Endpoint: ["Dot", { radius: 5 }],
        PaintStyle: { stroke: "#0d6efd", strokeWidth: 2 },
        HoverPaintStyle: { stroke: "#0b5ed7", strokeWidth: 3 },
        ConnectionOverlays: [
            ["Arrow", { 
                location: 1, 
                width: 12, 
                length: 12,
                foldback: 0.8
            }]
        ],
        DragOptions: { cursor: "move", zIndex: 2000 }
    });

    // State variables
    let activeNode = null;
    let isConnecting = false;
    let nodes = [];
    let connections = [];
    let nextNodeId = 1;
    let selectedColor = "#0d6efd"; // Default color

    // Initialize draggable components
    $(".draggable").draggable({
        helper: "clone",
        cursor: "grabbing",
        revert: "invalid",
        zIndex: 1000,
        start: function() {
            $(this).css('opacity', '0.5');
        },
        stop: function() {
            $(this).css('opacity', '1');
        }
    });

    // Initialize droppable canvas
    $("#workflow-canvas").droppable({
        accept: ".draggable",
        drop: function(event, ui) {
            const type = $(ui.draggable).data("type");
            const offset = $(this).offset();
            const x = event.pageX - offset.left - 90; // Center the node
            const y = event.pageY - offset.top - 60;
            
            createNode(type, x, y);
        },
        over: function() {
            $(this).addClass('canvas-hover');
        },
        out: function() {
            $(this).removeClass('canvas-hover');
        }
    });

    // Create a new workflow node
    function createNode(type, x, y) {
        const nodeId = `node-${nextNodeId++}`;
        let title, icon;
        
        switch(type) {
            case "text":
                title = "Text Node";
                icon = "fa-font";
                break;
            case "input":
                title = "Input Node";
                icon = "fa-keyboard";
                break;
            case "decision":
                title = "Decision Node";
                icon = "fa-code-branch";
                break;
            case "action":
                title = "Action Node";
                icon = "fa-bolt";
                break;
            default:
                title = "Node";
                icon = "fa-circle";
        }
        
        const nodeHtml = `
            <div class="workflow-node node-type-${type}" id="${nodeId}" style="left:${x}px;top:${y}px">
                <div class="node-header" style="background-color:${selectedColor}">
                    <span><i class="fas ${icon} me-1"></i>${title}</span>
                    <i class="fas fa-ellipsis-v node-menu-btn"></i>
                </div>
                <div class="node-body">
                    Double-click to edit content
                </div>
                <div class="node-connector source" data-node-id="${nodeId}"></div>
                <div class="node-connector target" data-node-id="${nodeId}"></div>
            </div>
        `;
        
        const $node = $(nodeHtml);
        $("#workflow-canvas").append($node);
        
        // Make node draggable
        jsPlumbInstance.draggable(nodeId, {
            stop: function() {
                saveWorkflowState();
            }
        });
        
        // Add event listeners
        $node.find(".node-menu-btn").click(function(e) {
            e.stopPropagation();
            showContextMenu(nodeId, e.pageX, e.pageY);
        });
        
        $node.dblclick(function() {
            editNode(nodeId);
        });
        
        // Initialize connectors
        jsPlumbInstance.addEndpoint(nodeId, {
            anchor: "BottomCenter",
            uuid: `${nodeId}-source`,
            isSource: true,
            isTarget: false,
            maxConnections: -1
        }, {
            anchor: "TopCenter",
            uuid: `${nodeId}-target`,
            isSource: false,
            isTarget: true,
            maxConnections: -1
        });
        
        // Save node data
        nodes.push({
            id: nodeId,
            type: type,
            title: title,
            content: "Double-click to edit content",
            x: x,
            y: y,
            color: selectedColor
        });
        
        saveWorkflowState();
        return nodeId;
    }
    
    // Show context menu for node
    function showContextMenu(nodeId, x, y) {
        activeNode = nodeId;
        $("#node-context-menu")
            .css({
                display: "block",
                left: x + "px",
                top: y + "px"
            })
            .data("node-id", nodeId);
    }
    
    // Hide context menu
    $(document).click(function() {
        $("#node-context-menu").hide();
    });
    
    // Handle context menu actions
    $(".node-action").click(function() {
        const action = $(this).data("action");
        const nodeId = $("#node-context-menu").data("node-id");
        
        switch(action) {
            case "connect":
                toggleConnectionMode(nodeId);
                break;
            case "edit":
                editNode(nodeId);
                break;
            case "delete":
                deleteNode(nodeId);
                break;
            case "color":
                changeNodeColor(nodeId);
                break;
        }
        
        $("#node-context-menu").hide();
    });
    
    // Toggle connection mode
    function toggleConnectionMode(sourceNodeId) {
        isConnecting = !isConnecting;
        
        if (isConnecting) {
            $(".workflow-node").addClass("connection-mode-active");
            $(`#${sourceNodeId}`).addClass("connection-source");
            showConnectionModeIndicator(sourceNodeId);
        } else {
            $(".workflow-node").removeClass("connection-mode-active");
            $(".workflow-node").removeClass("connection-source");
            hideConnectionModeIndicator();
        }
    }
    
    // Show connection mode indicator
    function showConnectionModeIndicator(sourceNodeId) {
        const sourceTitle = $(`#${sourceNodeId} .node-header span`).text().trim();
        $("<div class='connection-mode'><i class='fas fa-link me-2'></i>Connecting from: " + sourceTitle + "<br>Click on target node</div>")
            .appendTo("body")
            .fadeIn();
    }
    
    // Hide connection mode indicator
    function hideConnectionModeIndicator() {
        $(".connection-mode").fadeOut(function() {
            $(this).remove();
        });
    }
    
    // Handle node clicks in connection mode
    $("#workflow-canvas").on("click", ".workflow-node", function() {
        if (!isConnecting) return;
        
        const targetNodeId = $(this).attr("id");
        const sourceNodeId = $(".connection-source").attr("id");
        
        if (sourceNodeId === targetNodeId) {
            Swal.fire({
                icon: "error",
                title: "Invalid Connection",
                text: "Cannot connect a node to itself",
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }
        
        // Check if connection already exists
        const existingConnection = connections.find(conn => 
            conn.source === sourceNodeId && conn.target === targetNodeId);
        
        if (existingConnection) {
            Swal.fire({
                icon: "error",
                title: "Duplicate Connection",
                text: "These nodes are already connected",
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }
        
        // Create connection
        jsPlumbInstance.connect({
            source: `${sourceNodeId}-source`,
            target: `${targetNodeId}-target`,
            anchors: ["BottomCenter", "TopCenter"],
            detachable: true,
            deleteEndpointsOnDetach: false
        });
        
        // Save connection
        connections.push({
            source: sourceNodeId,
            target: targetNodeId
        });
        
        saveWorkflowState();
        toggleConnectionMode(); // Exit connection mode
    });
    
    // Edit node content
    function editNode(nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        $("#nodeTitle").val(node.title);
        $("#nodeContent").val(node.content);
        
        const modal = new bootstrap.Modal("#editNodeModal");
        modal.show();
        
        $("#saveNodeChanges").off("click").on("click", function() {
            const newTitle = $("#nodeTitle").val();
            const newContent = $("#nodeContent").val();
            
            // Update node in DOM
            $(`#${nodeId} .node-header span`).html(
                `<i class="fas ${getNodeIcon(node.type)} me-1"></i>${newTitle}`
            );
            $(`#${nodeId} .node-body`).text(newContent);
            
            // Update node in data
            node.title = newTitle;
            node.content = newContent;
            
            saveWorkflowState();
            modal.hide();
        });
    }
    
    // Get icon for node type
    function getNodeIcon(type) {
        switch(type) {
            case "text": return "fa-font";
            case "input": return "fa-keyboard";
            case "decision": return "fa-code-branch";
            case "action": return "fa-bolt";
            default: return "fa-circle";
        }
    }
    
    // Delete node
    function deleteNode(nodeId) {
        Swal.fire({
            title: "Delete Node?",
            text: "This will also remove all connections to this node",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                // Remove connections
                connections = connections.filter(conn => 
                    conn.source !== nodeId && conn.target !== nodeId);
                
                // Remove from DOM and jsPlumb
                jsPlumbInstance.remove(nodeId);
                $(`#${nodeId}`).remove();
                
                // Remove from nodes array
                nodes = nodes.filter(n => n.id !== nodeId);
                
                saveWorkflowState();
                
                Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text: "Node has been removed",
                    showConfirmButton: false,
                    timer: 1000
                });
            }
        });
    }
    
    // Change node color
    function changeNodeColor(nodeId) {
        const colors = [
            { name: "Blue", value: "#0d6efd" },
            { name: "Green", value: "#198754" },
            { name: "Red", value: "#dc3545" },
            { name: "Yellow", value: "#ffc107" },
            { name: "Purple", value: "#6f42c1" },
            { name: "Teal", value: "#20c997" }
        ];
        
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        const currentColor = node.color || "#0d6efd";
        
        Swal.fire({
            title: "Select Node Color",
            html: `<div class="color-palette">
                ${colors.map(color => `
                    <div class="color-option ${currentColor === color.value ? 'selected' : ''}" 
                         style="background-color:${color.value}" 
                         data-color="${color.value}" 
                         title="${color.name}">
                    </div>
                `).join('')}
            </div>`,
            showConfirmButton: true,
            confirmButtonText: "Apply",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            focusConfirm: false,
            didOpen: () => {
                $(".color-option").click(function() {
                    $(".color-option").removeClass("selected");
                    $(this).addClass("selected");
                    selectedColor = $(this).data("color");
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Update node color
                $(`#${nodeId} .node-header`).css("background-color", selectedColor);
                node.color = selectedColor;
                
                saveWorkflowState();
            }
        });
    }
    
    // Save workflow state
    function saveWorkflowState() {
        // Update node positions
        nodes.forEach(node => {
            const $node = $(`#${node.id}`);
            if ($node.length) {
                node.x = parseInt($node.css("left"));
                node.y = parseInt($node.css("top"));
            }
        });
        
        // Save to localStorage
        const workflowState = {
            nodes: nodes,
            connections: connections,
            nextNodeId: nextNodeId
        };
        
        localStorage.setItem("workflowState", JSON.stringify(workflowState));
    }
    
    // Load workflow state
    function loadWorkflowState() {
        const savedState = localStorage.getItem("workflowState");
        if (savedState) {
            const workflowState = JSON.parse(savedState);
            nodes = workflowState.nodes || [];
            connections = workflowState.connections || [];
            nextNodeId = workflowState.nextNodeId || 1;
            
            // Recreate nodes
            nodes.forEach(node => {
                const nodeHtml = `
                    <div class="workflow-node node-type-${node.type}" id="${node.id}" style="left:${node.x}px;top:${node.y}px">
                        <div class="node-header" style="background-color:${node.color || '#0d6efd'}">
                            <span><i class="fas ${getNodeIcon(node.type)} me-1"></i>${node.title}</span>
                            <i class="fas fa-ellipsis-v node-menu-btn"></i>
                        </div>
                        <div class="node-body">
                            ${node.content}
                        </div>
                        <div class="node-connector source" data-node-id="${node.id}"></div>
                        <div class="node-connector target" data-node-id="${node.id}"></div>
                    </div>
                `;
                
                $("#workflow-canvas").append(nodeHtml);
                
                // Make node draggable
                jsPlumbInstance.draggable(node.id, {
                    stop: function() {
                        saveWorkflowState();
                    }
                });
                
                // Add event listeners
                $(`#${node.id} .node-menu-btn`).click(function(e) {
                    e.stopPropagation();
                    showContextMenu(node.id, e.pageX, e.pageY);
                });
                
                $(`#${node.id}`).dblclick(function() {
                    editNode(node.id);
                });
                
                // Initialize endpoints
                jsPlumbInstance.addEndpoint(node.id, {
                    anchor: "BottomCenter",
                    uuid: `${node.id}-source`,
                    isSource: true,
                    isTarget: false,
                    maxConnections: -1
                }, {
                    anchor: "TopCenter",
                    uuid: `${node.id}-target`,
                    isSource: false,
                    isTarget: true,
                    maxConnections: -1
                });
            });
            
            // Recreate connections
            connections.forEach(conn => {
                jsPlumbInstance.connect({
                    source: `${conn.source}-source`,
                    target: `${conn.target}-target`,
                    anchors: ["BottomCenter", "TopCenter"],
                    detachable: true,
                    deleteEndpointsOnDetach: false
                });
            });
        }
    }
    
    // Clear workflow
    $("#clear-btn").click(function() {
        Swal.fire({
            title: "Clear Workflow?",
            text: "This will remove all nodes and connections",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Clear All",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                // Remove all nodes
                $(".workflow-node").each(function() {
                    jsPlumbInstance.remove(this.id);
                    $(this).remove();
                });
                
                // Reset state
                nodes = [];
                connections = [];
                nextNodeId = 1;
                
                saveWorkflowState();
                
                Swal.fire({
                    icon: "success",
                    title: "Cleared",
                    text: "Workflow canvas has been cleared",
                    showConfirmButton: false,
                    timer: 1000
                });
            }
        });
    });
    
    // Save workflow
    $("#save-btn").click(function() {
        saveWorkflowState();
        Swal.fire({
            icon: "success",
            title: "Saved",
            text: "Your workflow has been saved",
            showConfirmButton: false,
            timer: 1000
        });
    });
    
    // Initialize jsPlumb connection events
    jsPlumbInstance.bind("connection", function(info) {
        const sourceId = info.sourceId.replace("-source", "");
        const targetId = info.targetId.replace("-target", "");
        
        // Add to connections if not already present
        if (!connections.some(conn => conn.source === sourceId && conn.target === targetId)) {
            connections.push({
                source: sourceId,
                target: targetId
            });
            saveWorkflowState();
        }
    });
    
    jsPlumbInstance.bind("connectionDetached", function(info) {
        const sourceId = info.sourceId.replace("-source", "");
        const targetId = info.targetId.replace("-target", "");
        
        // Remove from connections
        connections = connections.filter(conn => 
            !(conn.source === sourceId && conn.target === targetId));
        
        saveWorkflowState();
    });
    
    // Load any saved state on startup
    loadWorkflowState();
    
    // Make canvas droppable
    jsPlumbInstance.setContainer("workflow-canvas");
    
    // Close modal when clicking outside
    $('#editNodeModal').on('show.bs.modal', function () {
        $('.modal-backdrop').appendTo('#workflow-canvas');
    });
}