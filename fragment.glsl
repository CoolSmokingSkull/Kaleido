precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform float segments;
uniform float colorIntensity;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= resolution.x / resolution.y;

    float angle = atan(uv.y, uv.x);
    float radius = length(uv);

    float kaleidoscope = mod(angle + time, 3.1415926 / segments);
    vec3 color = vec3(
        abs(sin(radius + time)) * colorIntensity,
        abs(cos(angle * 2.0)) * colorIntensity,
        abs(sin(time * 0.5)) * colorIntensity
    );

    gl_FragColor = vec4(color * kaleidoscope, 1.0);
}
