
vec4 Execute(vec4 uv)
{
  float speed = 0.3;
  float dot_offset = 0.05;
  float smooth = 0.08;

  float2 screenPos = uv.xy * screenSize.yy;
  float mouseDist = distance(mousePos.zw, screenPos);
  float mouseFactor = 1.0;//(mouseDist * 0.5) - 7.0;

  float2 cells = frac(uv.xy * 50.0);

  //Mouse

  float gridSdf = (length(cells - 0.5) * 0.5) - 0.1;
  // float final = smin(gridSdf, mouseFactor, 8.0);

  float4 color = float4(0.5, 0.0, 0.0, 1.0);


  for (int i = 0; i < 8; i ++) 
  {
    float j = float(i);
    float trailDist = distance(mouseTrail[i].xy, screenPos);
    trailDist = (trailDist * 0.3) - (9.0 - j);
    mouseFactor = smin(mouseFactor, trailDist, 20.0);

    // float t = frac(time * speed + (float(i) * dot_offset));
    // t = smoothstep(0.0, 1.0, t);
    // t = smoothstep(0.0, 1.0, t);

    // float s = PI * 2.0;
    // vec2 o = float2(sin(t * s), cos(t * s)) * 0.3;
    // float dist = length(uv.xy + o) - 0.02;
    // if (dist<d)
    // {
    //   color.xyz = vec3(1.0, 1.0, 1.0);//lerp(vec3(0.0, 0.2, 0.35), vec3(1.0, 1.0, 1.0), 1.0 - (cos(t * s) * 0.5 + 0.5));
    // }
    // d = smin(d, dist, smooth); 
  }

  float dist = smoothstep(0.4, 0.0, mouseFactor + 7.0);
      
  // color.w = smoothstep(0.003, 0.0, d) * saturate(time - 0.1);

  // color.xy = cells;
   color.xyz = float3(116.0/255.0, 140.0/255.0, 165.0/255.0);
   color.w = dist;

  return color;
}