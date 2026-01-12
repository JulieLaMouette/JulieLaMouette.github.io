// uniform float time;
// uniform vec2 mouseUV;
// uniform float scrollUV;
// uniform float smoothScrollUV;
// uniform float randomValue;
// uniform sampler2D texture;

void VertexShader(inout float3 position, inout float2 uv1, inout float2 uv2, inout float4 color)
{
}

//<VertexFragSplit>

float4 FragmentShader(float2 uv)
{
    float4 color = float4(texture2D(texture, uv));

    if (color.w < 0.9)
        discard;

    return color;
}