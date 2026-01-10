// uniform float time;
// uniform vec2 mouseUV;
// uniform float scrollUV;
// uniform float smoothScrollUV;
// uniform float randomValue;
// uniform sampler2D texture;


float4 Execute(float2 uv) 
{ 
    float scroll = smoothScrollUV * 0.4;
    float2 noiseUv = uv + time * 0.15;

    float2 texcoord = float2(uv.x, 1.0 - uv.y);
    texcoord.y -= scroll;
    texcoord.xy -= float2(0.5, 0.5);
    texcoord.xy *= 0.2;
    texcoord.xy += float2(0.5, 0.5);

    texcoord.x += noise12(float2(noiseUv.x, noiseUv.y - scroll * 0.5)) * 0.01;
    texcoord.x += noise12(float2(noiseUv.x, noiseUv.y - scroll * 0.5) + 24.145) * 0.01;

    float verticalGradient = abs(uv.y - 0.5) * 2.0;
    verticalGradient *= verticalGradient;
    verticalGradient = 1.0 - verticalGradient;

    float bubbleMask = texture2D(texture, texcoord).x;
    bubbleMask *= verticalGradient;
    bubbleMask = step(0.5, bubbleMask);

    return float4(1.0, 1.0, 1.0, bubbleMask);
}