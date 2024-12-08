let program;

// WebGL Setup
const canvas = document.getElementById('kaleidoCanvas');
const gl = canvas.getContext('webgl');
if (!gl) throw new Error("WebGL not supported");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

async function loadShaderSource(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load shader: ${url}`);
    return response.text();
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Shader program failed:', gl.getProgramInfoLog(shaderProgram));
        gl.deleteProgram(shaderProgram);
        return null;
    }
    return shaderProgram;
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Shader Values
let segmentCount = 6;
let timeSpeed = 1;
let colorIntensity = 1;

// Load Shaders
Promise.all([
    loadShaderSource('./vertex.glsl'),
    loadShaderSource('./fragment.glsl'),
]).then(([vsSource, fsSource]) => {
    program = initShaderProgram(gl, vsSource, fsSource);
    if (!program) throw new Error('Failed to initialize shader program');

    gl.useProgram(program);
    setupRendering();
}).catch(console.error);

// Rendering Logic
function setupRendering() {
    const timeUniform = gl.getUniformLocation(program, 'time');
    const resolutionUniform = gl.getUniformLocation(program, 'resolution');
    const segmentsUniform = gl.getUniformLocation(program, 'segments');
    const colorIntensityUniform = gl.getUniformLocation(program, 'colorIntensity');

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0,
    ]), gl.STATIC_DRAW);

    const positionAttribute = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    function render(time) {
        gl.uniform1f(timeUniform, time * 0.001 * timeSpeed);
        gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
        gl.uniform1f(segmentsUniform, segmentCount);
        gl.uniform1f(colorIntensityUniform, colorIntensity);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(render);
    }
    render(0);
}

// DOM Interactions
const cogButton = document.getElementById('settingsCog');
const closeSettings = document.getElementById('closeSettings');
const settingsWindow = document.getElementById('settingsWindow');

const segmentInput = document.getElementById('segmentInput');
const opacitySlider = document.getElementById('opacitySlider');
const timeSpeedInput = document.getElementById('timeSpeed');
const colorIntensityInput = document.getElementById('colorIntensity');

// Show/Hide Settings Window
let settingsVisible = false;
cogButton.addEventListener('click', () => {
    settingsVisible = !settingsVisible;
    settingsWindow.classList.toggle('hidden', !settingsVisible);
});

closeSettings.addEventListener('click', () => {
    settingsWindow.classList.add('hidden');
    settingsVisible = false;
});

// Update Cog Opacity
opacitySlider.addEventListener('input', (e) => {
    cogButton.style.opacity = e.target.value;
});

// Update Shader Values Dynamically
segmentInput.addEventListener('input', (e) => {
    segmentCount = parseInt(e.target.value, 10);
});
timeSpeedInput.addEventListener('input', (e) => {
    timeSpeed = parseFloat(e.target.value);
});
colorIntensityInput.addEventListener('input', (e) => {
    colorIntensity = parseFloat(e.target.value);
});
