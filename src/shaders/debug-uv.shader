// uniform float time;
// uniform float4 mouseUV;
// uniform float4 scrollUV;
// uniform float randomValue;
// uniform sampler2D texture;

void VertexShader(inout float3 position, inout float2 uv1, inout float2 uv2, inout float4 color)
{
}

//<VertexFragSplit>

float4 FragmentShader(float2 uv)
{
    return float4(uv, 0.0, 1.0);
}