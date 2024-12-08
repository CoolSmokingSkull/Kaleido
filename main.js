import { GUI } from 'dat.gui'; // Import the GUI library

let program; // Declare the program variable globally

// Initialize WebGL
const canvas = document.getElementById('kaleidoCanvas');
const gl = canvas.getContext('webgl');
if (!gl) {
    throw new Error("WebGL not supported");
}

// Resize Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Load Shader Sources
async function loadShaderSource(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader: ${url}`);
    }
    return response.text();
}

// Initialize Shader Program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(shaderProgram));
        gl.deleteProgram(shaderProgram);
        return null;
    }
    return shaderProgram;
}

// Create Shader
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

// Load shaders and start rendering
Promise.all([
    loadShaderSource('./vertex.glsl'), // Ensure these paths are correct
    loadShaderSource('./fragment.glsl'),
]).then(([vsSource, fsSource]) => {
    program = initShaderProgram(gl, vsSource, fsSource);

    if (!program) {
        throw new Error('Failed to initialize shader program');
    }

    gl.useProgram(program);

    setupRendering(); // Proceed to setup rendering
}).catch((error) => {
    console.error('Error loading shaders or initializing WebGL:', error);
});

// Setup Rendering
function setupRendering() {
    // Pass uniforms to shaders
    const timeUniform = gl.getUniformLocation(program, 'time');
    const resolutionUniform = gl.getUniformLocation(program, 'resolution');

    // Create and bind vertex buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionAttribute = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    // Render loop
    function render(time) {
        gl.uniform1f(timeUniform, time * 0.001);
        gl.uniform2f(resolutionUniform, canvas.width, canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(render);
    }
    render(0);
}
