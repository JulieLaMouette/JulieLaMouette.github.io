[Range(0.4, -10.0, 10.0)]
uniform float speed;

[Field(0.1)]
uniform float size;

float box(float3 p, float3 s)
{
    p = abs(p) - s;
    return max(p.x, max(p.y, p.z));
}

float map(float3 p)
{
    float3 op = p;
    float s = 5.0;
    for(int i = 0; i < 4; ++i)
    {
        float t = time * speed + 21.7 + float(i) * 17.421;
        p.xz *= rotate(t);
        p.zy *= rotate(t * 0.7);
        p = abs(p);
        p -= s;
        s *= 0.5;
    }
    
    float d = smin(length(op) - 3.0, box(p, float3(0.4, size, 2.0)), 8.0);
    
    return d;
}

float4 Execute(float4 uv)
{
    uv.xy -= 0.5;
    
    float3 s = float3(0.0, 0.0, -40.0);
    float3 r = normalize(float3(uv.xy, 1.0));
    
    float3 p = s;
    for(int i = 0; i < 100; ++i)
    {
        float d = map(p);
        if (d < 0.001)
            break;
        p += r * d;
    }
    
    float3 col = float3(0.0, 0.0, 0.0);
    
    float2 off = float2(0.01, 0.0);
    float3 n = normalize(map(p) - float3(map(p - off.xyy), map(p - off.yxy), map(p-off.yyx)));

    float3 l = normalize(float3(1.0, 3.0, -2.0));
    col += max(0.0, dot(n, l));

    return float4(col, 1.0);
}