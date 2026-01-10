[Range(1.0, -3.0, 3.0)]
uniform float speed;

float4 Execute(float4 uv)
{
    float a = sin(uv.x * PI + time * speed) * 0.5 + 0.5;
    float b = step(uv.y, a);
    return vec4(b, b, b, 1.0);
}