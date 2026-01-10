[Toggle(true)]
uniform float _UseScreenCoords;

float4 Execute(float4 uv)
{
    float dist = 0.0;
    
    if (_UseScreenCoords > 0.5)
        dist = distance(mousePos.zw, uv.zw * screenSize.xy) * 0.01;
    else
        dist = distance(mousePos.xy, uv.zw);
        
    return vec4(dist, dist, dist, 1.0);
}