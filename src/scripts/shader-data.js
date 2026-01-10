class ShaderData
{
    constructor(element, shaderGuid, shaderCode, textureUrl)
    {
        this.element = element;
        this.shaderGuid = shaderGuid;
        this.shaderFragContent = shaderCode;
        this.textureUrl = textureUrl;

        this.vertexShader = `
            attribute vec4 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying vec2 uv;
            varying vec2 texCoord;
            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                uv = aTextureCoord;
                texCoord = aTextureCoord;
            }
        `;

        this.fragmentShader = `
            precision highp float;

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

            //---------------

			#define frac(x) fract(x)
			#define lerp(a, b, c) mix(a, b, c)
			#define saturate(x) clamp(x, 0.0, 1.0)
			#define PI 3.1415926532
			#define TAU 6.283185307
			#define float2 vec2
			#define float3 vec3
			#define float4 vec4

            varying vec2 uv;
            varying vec2 texcoord;

			uniform sampler2D uSampler;
			uniform float time;
            uniform vec2 mouseUV;
            uniform float scrollUV;
            uniform float smoothScrollUV;
            uniform float randomValue;
            uniform sampler2D texture;

            ` + this.shaderFragContent + `
            void main(void) {
                gl_FragColor = Execute(float2(uv.x, 1.0 - uv.y));
            }
        `;
    }

    Load(gl) {
        // Compile shaders
        const vert = this.loadShader(gl, gl.VERTEX_SHADER, this.vertexShader);
        const frag = this.loadShader(gl, gl.FRAGMENT_SHADER, this.fragmentShader);

        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vert);
        gl.attachShader(this.shaderProgram, frag);
        gl.linkProgram(this.shaderProgram);
        if(!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS))
            console.error("Shader program error:", gl.getProgramInfoLog(this.shaderProgram));

        // Program info
        this.programInfo = {
            program: this.shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
                textureCoord: gl.getAttribLocation(this.shaderProgram, 'aTextureCoord')
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
                time: gl.getUniformLocation(this.shaderProgram, 'time'),
                mouseUV: gl.getUniformLocation(this.shaderProgram, 'mouseUV'),
                scrollUV: gl.getUniformLocation(this.shaderProgram, 'scrollUV'),
                smoothScrollUV: gl.getUniformLocation(this.shaderProgram, 'smoothScrollUV'),
                uTexture: gl.getUniformLocation(this.shaderProgram, 'texture'),
                randomValue: gl.getUniformLocation(this.shaderProgram, 'randomValue')
            }
        };

        // Load texture if URL
        if(this.textureUrl) {
            this.texture = this.loadTexture(gl, this.textureUrl);
            console.log(this.texture);
        }
    }

    UpdateProperties(gl, time, mouseUV, scrollUV, smoothScrollUV) {
        gl.useProgram(this.shaderProgram);
        gl.uniform1f(this.programInfo.uniformLocations.time, time);
        gl.uniform2f(this.programInfo.uniformLocations.mouseUV, mouseUV[0], mouseUV[1]);
        gl.uniform1f(this.programInfo.uniformLocations.scrollUV, scrollUV);
        gl.uniform1f(this.programInfo.uniformLocations.smoothScrollUV, smoothScrollUV);
        gl.uniform1f(this.programInfo.uniformLocations.randomValue, this.randomValue);

        if(this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this.programInfo.uniformLocations.uTexture, 0);
        }
    }

    loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        return shader;
    }

    loadTexture(gl, url) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Placeholder 1x1 blue
        const pixel = new Uint8Array([0,0,255,255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            if(this.isPowerOf2(image.width) && this.isPowerOf2(image.height))
                gl.generateMipmap(gl.TEXTURE_2D);
            else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        };
        image.src = url;

        return texture;
    }

    isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
}