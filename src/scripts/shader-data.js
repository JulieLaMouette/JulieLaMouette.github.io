class ShaderData
{
    static COMMON = `
            #define frac(x) fract(x)
			#define lerp(a, b, c) mix(a, b, c)
			#define saturate(x) clamp(x, 0.0, 1.0)
			#define PI 3.1415926532
			#define TAU 6.283185307
			#define float2 vec2
			#define float3 vec3
			#define float4 vec4

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform float time;
            uniform vec2 mouseUV;
            uniform float scrollUV;
            uniform float smoothScrollUV;
            uniform float randomValue;

            // Description : Array and textureless GLSL 2D simplex noise function. -----------------
			//      Author : Ian McEwan, Ashima Arts.
			//  Maintainer : stegu
			//     Lastmod : 20110822 (ijm)
			//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
			//               Distributed under the MIT License. See LICENSE file.
			//               https://github.com/ashima/webgl-noise
			//               https://github.com/stegu/webgl-noise
			// 

			vec3 mod289(vec3 x) 
			{
				return x - floor(x * (1.0 / 289.0)) * 289.0;
			}

			vec2 mod289(vec2 x) 
			{
				return x - floor(x * (1.0 / 289.0)) * 289.0;
			}

			vec3 permute(vec3 x) 
			{
				return mod289(((x*34.0)+10.0)*x);
			}

			float noise12(vec2 v)
			{
				const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
											0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
											-0.577350269189626,  // -1.0 + 2.0 * C.x
											0.024390243902439); // 1.0 / 41.0
				// First corner
				vec2 i  = floor(v + dot(v, C.yy) );
				vec2 x0 = v -   i + dot(i, C.xx);

				// Other corners
				vec2 i1;
				//i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
				//i1.y = 1.0 - i1.x;
				i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
				// x0 = x0 - 0.0 + 0.0 * C.xx ;
				// x1 = x0 - i1 + 1.0 * C.xx ;
				// x2 = x0 - 1.0 + 2.0 * C.xx ;
				vec4 x12 = x0.xyxy + C.xxzz;
				x12.xy -= i1;

				// Permutations
				i = mod289(i); // Avoid truncation effects in permutation
				vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
						+ i.x + vec3(0.0, i1.x, 1.0 ));

				vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
				m = m*m ;
				m = m*m ;

				// Gradients: 41 points uniformly over a line, mapped onto a diamond.
				// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

				vec3 x = 2.0 * fract(p * C.www) - 1.0;
				vec3 h = abs(x) - 0.5;
				vec3 ox = floor(x + 0.5);
				vec3 a0 = x - ox;

				// Normalise gradients implicitly by scaling m
				// Approximation of: m *= inversesqrt( a0*a0 + h*h );
				m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

				// Compute final noise value at P
				vec3 g;
				g.x  = a0.x  * x0.x  + h.x  * x0.y;
				g.yz = a0.yz * x12.xz + h.yz * x12.yw;
				return 130.0 * dot(m, g);
			}

            mat2 Rot(float angle)
            {
                float s = sin(angle);
                float c = cos(angle);
                return mat2(c, -s, s, c);
            }
    `;

    constructor(shaderContent)
    {
        const common = ShaderData.COMMON;
        const parts = shaderContent.split("//<VertexFragSplit>");

        const vertexContent = parts[0];
        const fragmentContent = parts[1];
        

        this.vertexShader = common +
        `
            attribute vec4 aPosition;
            attribute vec2 aUv1;
            attribute vec2 aUv2;
            attribute vec4 aColor;

            varying vec2 uv1;
            varying vec2 uv2;
            varying vec4 vertexColor;

            ` + vertexContent + `

            void main(void) 
            {
                float3 vPosition = aPosition.xyz;
                float2 vUv1 = aUv1;
                float2 vUv2 = aUv2;
                float4 vColor = aColor;

                VertexShader(vPosition, vUv1, vUv2, vColor);

                gl_Position = uProjectionMatrix * uModelViewMatrix * float4(vPosition.xyz, aPosition.w);
                uv1 = vUv1;
                uv2 = vUv2;
                vertexColor = vColor;
            }
        `;

        this.fragmentShader = "precision highp float;\n" + common +
        `
            varying vec2 uv1;
            varying vec2 uv2;
            varying vec4 vertexColor;

            uniform sampler2D texture;

            ` + fragmentContent + `

            void main(void) {
                gl_FragColor = FragmentShader(float2(uv1.x, 1.0 - uv1.y));
                gl_FragColor.xyz *= gl_FragColor.w;
            }
        `;
    }
}