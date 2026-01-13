// uniform float time;
// uniform float4 mouseUV;
// uniform float4 scrollUV;
// uniform float randomValue;
// uniform sampler2D texture;

void VertexShader(inout float3 position, inout float2 uv1, inout float2 uv2, inout float4 color)
{
    float rnd = frac(color.r * 17.1125 + uv2.x * 13.75 * uv2.y * -71.45);
    float seed = uv2.y;

    float rotateFactor = noise12(float2(0, seed * 0.2 + rnd * 0.2 + time * 0.1)) * 0.3;
    float rotateFactor2 = noise12(float2(0, rnd + time * 0.43)) * 0.4;
    float rotateFromScroll = scrollUV.x - scrollUV.z;
    // float shakeFactor = sin(rnd + time * 50.0) * 0.01;


    float mouseDist = distance(float2(mouseUV.z, 1.0 - mouseUV.w), uv2);
    mouseDist = saturate(1.0 - mouseDist);
    rotateFactor = lerp(rotateFactor, rotateFactor2, mouseDist) + rotateFromScroll * lerp(0.6, 1.0, rnd);

    position.xy -= uv2;
    position.xy = Rot(rotateFactor) * position.xy;
    position.xy *= lerp(1.0, 0.85, mouseDist);
    position.xy += uv2;

}

//<VertexFragSplit>

float4 FragmentShader(float2 uv)
{
    float4 color = float4(texture2D(texture, uv));

    if (color.w < 0.9)
        discard;

    return color;
}