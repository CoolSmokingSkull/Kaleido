precision mediump float;

uniform vec2 resolution;
uniform float time;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy; // Normalize coordinates
    uv = uv * 2.0 - 1.0;                       // Center coordinates
    uv.x *= resolution.x / resolution.y;      // Correct aspect ratio

    float angle = atan(uv.y, uv.x);           // Angle for kaleidoscope
    float radius = length(uv);               // Radius for pattern scaling

    float segments = 6.0;
    float kaleidoscope = mod(angle + time, 3.1415926 / segments);
    vec3 color = vec3(
        abs(sin(radius + time)),
        abs(cos(angle * 2.0)),
        abs(sin(time * 0.5))
    );

    gl_FragColor = vec4(color * kaleidoscope, 1.0);
}
