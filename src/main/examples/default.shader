[Range(3.0, 0.0, 20.0)]
uniform float speed;

float4 Execute(float4 uv)
{
    return vec4(uv.xy, sin(time * speed) * 0.5 + 0.5, 1.0);
}