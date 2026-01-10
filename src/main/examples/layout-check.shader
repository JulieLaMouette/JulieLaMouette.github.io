//From Inigo Quilez
float sdBox(vec2 p, vec2 b)
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float4 Execute(float4 uv)
{
    float box = sdBox(uv.xy - 0.5, float2(0.4, 0.4));
    float shadows = saturate(abs((box - 0.06) * 25.0));
    shadows = pow(shadows, 0.3);
    box = smoothstep(0.075, 0.07, box) * smoothstep(0.05, 0.055, box);
    float3 color = float3(uv.xy, 0.0);
    color.xyz *= shadows * 0.7 + 0.3;
    color.xyz = max(color.xyz, box);
    return vec4(color, 1.0);
}