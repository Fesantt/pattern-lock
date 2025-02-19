const PATERN_CONFIG = {
    nodeRadius: 15,
    cols: 3,
    rows: 3,
    activeColor: '#2196F3',
    inactiveColor: '#e0e0e0'
};

const patern_state = {
    canvas: null,
    ctx: null,
    nodes: [],
    currentPath: [],
    isDrawing: false
};

function patern_init() {
    patern_state.canvas = document.getElementById('patern_canvas');
    patern_state.ctx = patern_state.canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = patern_state.canvas.getBoundingClientRect();
    patern_state.canvas.width = rect.width * dpr;
    patern_state.canvas.height = rect.height * dpr;
    patern_state.ctx.scale(dpr, dpr);

    patern_initGrid();
    patern_setupEventListeners();
}

function patern_initGrid() {
    const width = patern_state.canvas.width / (PATERN_CONFIG.cols + 1);
    const height = patern_state.canvas.height / (PATERN_CONFIG.rows + 1);
    
    for(let i = 0; i < PATERN_CONFIG.cols; i++) {
        for(let j = 0; j < PATERN_CONFIG.rows; j++) {
            patern_state.nodes.push({
                x: width * (i + 1),
                y: height * (j + 1),
                number: (j * PATERN_CONFIG.cols) + i + 1,
                active: false
            });
        }
    }
    patern_drawGrid();
}

function patern_drawGrid() {
    patern_state.ctx.clearRect(0, 0, patern_state.canvas.width, patern_state.canvas.height);
    
    if(patern_state.currentPath.length > 1) {
        patern_state.ctx.beginPath();
        patern_state.ctx.moveTo(patern_state.currentPath[0].x, patern_state.currentPath[0].y);
        patern_state.ctx.lineWidth = 3;
        patern_state.ctx.strokeStyle = PATERN_CONFIG.activeColor;
        
        patern_state.currentPath.forEach(node => {
            patern_state.ctx.lineTo(node.x, node.y);
        });
        patern_state.ctx.stroke();
    }

    patern_state.nodes.forEach(node => {
        patern_state.ctx.beginPath();
        patern_state.ctx.arc(node.x, node.y, PATERN_CONFIG.nodeRadius, 0, Math.PI * 2);
        patern_state.ctx.fillStyle = node.active ? PATERN_CONFIG.activeColor : PATERN_CONFIG.inactiveColor;
        patern_state.ctx.fill();
        
        // Texto do nó
        patern_state.ctx.fillStyle = node.active ? '#ffffff' : '#495057';
        patern_state.ctx.font = '16px Arial';
        patern_state.ctx.textAlign = 'center';
        patern_state.ctx.textBaseline = 'middle';
        patern_state.ctx.fillText(node.number, node.x, node.y);
    });
}

function patern_getNode(x, y) {
    return patern_state.nodes.find(node => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx*dx + dy*dy) < PATERN_CONFIG.nodeRadius;
    });
}

function patern_handleMouseDown(e) {
    const rect = patern_state.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const node = patern_getNode(x, y);
    if(node) {
        patern_state.isDrawing = true;
        node.active = true;
        patern_state.currentPath.push(node);
        patern_drawGrid();
    }
}

function patern_handleMouseMove(e) {
    if(!patern_state.isDrawing) return;
    
    const rect = patern_state.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const node = patern_getNode(x, y);
    if(node && !patern_state.currentPath.includes(node)) {
        node.active = true;
        patern_state.currentPath.push(node);
        patern_drawGrid();
    }
}

function patern_openModal() {
    document.getElementById('patern_modal').classList.add('patern_modal--active');
    patern_init();
}

function patern_closeModal() {
    document.getElementById('patern_modal').classList.remove('patern_modal--active');
    patern_resetPattern();
}

function patern_resetPattern() {
    patern_state.currentPath = [];
    patern_state.nodes.forEach(node => node.active = false);
    patern_drawGrid();
}

function patern_savePattern() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Mantém a proporção do DPR
    const dpr = window.devicePixelRatio || 1;
    tempCanvas.width = patern_state.canvas.width;
    tempCanvas.height = patern_state.canvas.height;
    tempCtx.scale(dpr, dpr);

    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.font = '16px Arial';

    patern_state.currentPath.forEach((node, index) => {
        if(index > 0) {
            tempCtx.beginPath();
            tempCtx.moveTo(
                patern_state.currentPath[index-1].x / dpr, 
                patern_state.currentPath[index-1].y / dpr
            );
            tempCtx.lineTo(node.x / dpr, node.y / dpr);
            tempCtx.strokeStyle = PATERN_CONFIG.activeColor;
            tempCtx.lineWidth = 3;
            tempCtx.stroke();
        }
        
        tempCtx.beginPath();
        tempCtx.arc(
            node.x / dpr, 
            node.y / dpr, 
            PATERN_CONFIG.nodeRadius / dpr, 
            0, 
            Math.PI * 2
        );
        tempCtx.fillStyle = PATERN_CONFIG.activeColor;
        tempCtx.fill();
        
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillText(
            node.number.toString(),
            node.x / dpr,
            node.y / dpr
        );
    });

    const base64 = tempCanvas.toDataURL();
    const sequence = patern_state.currentPath.map(node => node.number).join('-');
    
    document.getElementById('patern_imageOutput').value = base64;
    document.getElementById('patern_sequenceOutput').value = sequence;
}

function patern_clearPattern() {
    patern_state.currentPath = [];
    patern_state.nodes.forEach(node => node.active = false);
    
    document.getElementById('patern_imageOutput').value = '';
    document.getElementById('patern_sequenceOutput').value = '';
    
    patern_drawGrid();
}


function patern_setupEventListeners() {
    patern_state.canvas.addEventListener('mousedown', patern_handleMouseDown);
    patern_state.canvas.addEventListener('mousemove', patern_handleMouseMove);
    patern_state.canvas.addEventListener('mouseup', () => {
        patern_state.isDrawing = false;
    });
}
