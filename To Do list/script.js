let tasks = [];
let currentTheme = 'captainamerica';

const canvas = document.getElementById('dynamic-canvas-bg');
const ctx = canvas.getContext('2d');
let elements = [];

const themeTextMapping = {
    captainamerica: { title: "Shield Command", subtitle: "I can do this all day. Review active parameters." },
    thor: { title: "Bifrost Telemetry", subtitle: "Bring me Thanos! Task lightning channels active." },
    ironman: { title: "Arc Telemetry", subtitle: "Genius, billionaire, playboy. Run the scripts." }
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initThemeElements();
}
window.addEventListener('resize', resizeCanvas);

// --- UNIFIED HERO ANIMATION OBJECT ENGINE ---
class HeroParticle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        // Start below the screen viewport for upward floating items
        this.y = canvas.height + Math.random() * 100;
        this.speedY = Math.random() * 1.5 + 0.8;
        this.speedX = (Math.random() - 0.5) * 1.2;
        this.size = Math.random() * 20 + 20; // Expanded footprint size for visual visibility
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.04;
        this.opacity = Math.random() * 0.4 + 0.2;
    }
    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.angle += this.spin;
        
        // Recirculate object boundaries if off-canvas bounds triggered
        if (this.y < -60 || this.x < -60 || this.x > canvas.width + 60) {
            this.reset();
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        if (currentTheme === 'captainamerica') {
            // --- FLYING SHIELD STRUCTURAL DRAWING ---
            let r = this.size;
            ctx.globalAlpha = this.opacity;
            
            // Outer Ring - Red
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
            
            // Middle Ring - Silver/White
            ctx.fillStyle = '#ecf0f1';
            ctx.beginPath(); ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2); ctx.fill();
            
            // Inner Ring - Red
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.fill();
            
            // Center Core - Blue
            ctx.fillStyle = '#3498db';
            ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2); ctx.fill();
            
            // White Center Star Vector Mapping
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * (r * 0.28), 
                           Math.sin((18 + i * 72) * Math.PI / 180) * (r * 0.28));
                ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (r * 0.1), 
                           Math.sin((54 + i * 72) * Math.PI / 180) * (r * 0.1));
            }
            ctx.closePath(); ctx.fill();

        } else if (currentTheme === 'ironman') {
            // --- STARK TECH FLYING ARC REACTOR GRID ---
            let r = this.size;
            ctx.globalAlpha = this.opacity;
            ctx.strokeStyle = '#00d2ff';
            ctx.lineWidth = 1.5;
            
            // Outer Core Ring Mesh
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
            
            // Inner Concentric Energy Ring
            ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.stroke();
            
            // Central Triangular Core Anchor Points
            ctx.fillStyle = 'rgba(0, 210, 255, 0.2)';
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                let angle = (i * 120 - 90) * Math.PI / 180;
                ctx.lineTo(Math.cos(angle) * (r * 0.4), Math.sin(angle) * (r * 0.4));
            }
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Perimeter Energy Node Segments
            for(let i = 0; i < 8; i++) {
                let nodeAngle = (i * 45) * Math.PI / 180;
                ctx.beginPath();
                ctx.moveTo(Math.cos(nodeAngle) * (r * 0.6), Math.sin(nodeAngle) * (r * 0.6));
                ctx.lineTo(Math.cos(nodeAngle) * r, Math.sin(nodeAngle) * r);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

function initThemeElements() {
    elements = [];
    // Instantiate flying particles for Cap/Iron Man context engines
    if (currentTheme === 'captainamerica' || currentTheme === 'ironman') {
        for (let i = 0; i < 15; i++) elements.push(new HeroParticle());
    }
}

// --- LIGHTNING GENERATOR ENGINE FUNCTION ---
function drawLightningBolt(startX, startY, segments, displacement) {
    let currX = startX;
    let currY = startY;
    
    ctx.strokeStyle = 'rgba(174, 214, 241, 0.9)';
    ctx.lineWidth = Math.random() * 2 + 1.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#3498db';
    
    ctx.beginPath();
    ctx.moveTo(currX, currY);
    
    for (let i = 0; i < segments; i++) {
        currX += (Math.random() - 0.5) * displacement;
        currY += (canvas.height / segments) * 0.85 + (Math.random() * 10);
        ctx.lineTo(currX, currY);
        
        // Randomly branch out tiny auxiliary lightning tracks
        if (Math.random() > 0.8) {
            drawLightningBranch(currX, currY, 4, displacement * 0.6);
        }
    }
    ctx.stroke();
}

function drawLightningBranch(x, y, segments, disp) {
    ctx.save();
    ctx.strokeStyle = 'rgba(174, 214, 241, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < segments; i++) {
        x += (Math.random() - 0.3) * disp; // Skewed direction vectors
        y += 20;
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
}

// --- GLOBAL RENDERING LOOP MATRIX ---
function runAnimationEngine() {
    // CLEAR & CLEAN RESET: Wipes previous frame dynamic filter configurations to fix bounding layout clipping
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0; 
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1;

    if (currentTheme === 'thor') {
        // RANDOM LIGHTNING ENGINE: Occasional heavy atmospheric discharge sequence triggers
        if (Math.random() > 0.96) {
            // Briefly flash the background to simulate dynamic ambient cloud glow
            ctx.fillStyle = 'rgba(52, 152, 219, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            let strikeOriginX = Math.random() * canvas.width;
            drawLightningBolt(strikeOriginX, 0, 12, 35);
        }
    } else {
        // Execute updates and matrix translations for Cap & Iron Man particles
        elements.forEach(el => { 
            el.update(); 
            el.draw(); 
        });
    }
    
    requestAnimationFrame(runAnimationEngine);
}

function updateHeadlineAesthetics() {
    const data = themeTextMapping[currentTheme];
    const headline = document.getElementById('dynamic-headline');
    const subheadline = document.getElementById('dynamic-subheadline');
    if(headline && subheadline) {
        headline.innerText = data.title;
        subheadline.innerText = data.subtitle;
    }
}

// --- CONTROLLER NAVIGATION INTERACTION ---
const navButtons = document.querySelectorAll('.nav-btn');
const pageViews = document.querySelectorAll('.page-view');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetPage = btn.getAttribute('data-target');
        pageViews.forEach(page => {
            page.classList.remove('active');
            if(page.id === targetPage) page.classList.add('active');
        });
        updateDashboardStats();
    });
});

// --- LIST CORE LOGIC ---
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        if(task.completed) li.classList.add('completed');

        const span = document.createElement('span');
        span.classList.add('task-text');
        span.innerText = task.text;
        span.addEventListener('click', () => {
            tasks[index].completed = !tasks[index].completed;
            renderTasks();
            updateDashboardStats();
        });

        const delBtn = document.createElement('button');
        delBtn.classList.add('delete-btn');
        delBtn.innerText = '✕';
        delBtn.addEventListener('click', () => {
            tasks.splice(index, 1);
            renderTasks();
            updateDashboardStats();
        });

        li.appendChild(span);
        li.appendChild(delBtn);
        taskList.appendChild(li);
    });
}

function processTaskAddition() {
    const text = taskInput.value.trim();
    if(text === '') return;
    tasks.push({ text: text, completed: false });
    taskInput.value = '';
    renderTasks();
    updateDashboardStats();
}
addBtn.addEventListener('click', processTaskAddition);
taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') processTaskAddition(); });

function updateDashboardStats() {
    const total = document.getElementById('stat-total');
    const pending = document.getElementById('stat-pending');
    if(total && pending) {
        total.innerText = tasks.length;
        pending.innerText = tasks.filter(t => !t.completed).length;
    }
}

// --- SWITCH LAYERS & ADJUST ELEMENT INTERFACES ---
const themeButtons = document.querySelectorAll('.theme-btn');
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        themeButtons.forEach(b => b.classList.remove('active-theme'));
        btn.classList.add('active-theme');

        const chosenTheme = btn.getAttribute('data-theme');
        currentTheme = chosenTheme;
        
        // Update global body CSS targeting layer rules smoothly
        document.body.className = ''; 
        document.body.classList.add(`theme-${chosenTheme}`);
        
        // TARGET EXACT DOM ELEMENTS: Scale container structures based on current hero layouts
        const wrapper = document.querySelector('.todo-grand-wrapper');
        const cards = document.querySelectorAll('.stat-card');
        
        if (chosenTheme === 'thor') {
            // Thor Profile: Asymmetrical, rugged padding tweaks so Mjolnir clip-paths clear inner text bounds
            if (wrapper) wrapper.style.padding = "95px 60px 85px 60px";
            cards.forEach(c => {
                c.style.borderRadius = "2px";
                c.style.border = "1px solid rgba(52, 152, 219, 0.4)";
            });
        } else if (chosenTheme === 'ironman') {
            // Iron Man Profile: Sharp modern hud geometries
            if (wrapper) wrapper.style.padding = "75px 45px 65px 45px";
            cards.forEach(c => {
                c.style.borderRadius = "0px";
                c.style.border = "1px solid rgba(0, 210, 255, 0.3)";
            });
        } else if (chosenTheme === 'captainamerica') {
            // Captain America Profile: Soft aerodynamic rounded contours
            if (wrapper) wrapper.style.padding = "80px 55px 70px 55px";
            cards.forEach(c => {
                c.style.borderRadius = "16px";
                c.style.border = "1px solid rgba(255, 255, 255, 0.1)";
            });
        }
        
        updateHeadlineAesthetics();
        initThemeElements(); 
        renderTasks();
    });
});

// --- BOOT UP RUN INITIALIZATIONS ---
resizeCanvas();
runAnimationEngine();
updateHeadlineAesthetics();