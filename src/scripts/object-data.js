class ObjectData
{
    constructor(element, shaderGuid, meshData, shaderData, textureUrl)
    {
        this.element = element;
        this.shaderGuid = shaderGuid;
        this.meshData = meshData;
        this.shaderData = shaderData;
        this.textureUrl = textureUrl;
    }

    Load(gl) {
        // Compile shaders
        const vert = this.loadShader(gl, gl.VERTEX_SHADER, this.shaderData.vertexShader);
        const frag = this.loadShader(gl, gl.FRAGMENT_SHADER, this.shaderData.fragmentShader);

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
                position: gl.getAttribLocation(this.shaderProgram, 'aPosition'),
                uv1: gl.getAttribLocation(this.shaderProgram, 'aUv1'),
                uv2: gl.getAttribLocation(this.shaderProgram, 'aUv2'),
                color: gl.getAttribLocation(this.shaderProgram, 'aColor'),
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
        if(this.textureUrl) 
        {
            this.texture = this.loadTexture(gl, this.textureUrl);
        }
    }

    UpdateProperties(gl, time, mouseUV, scrollUV) 
    {
        gl.useProgram(this.shaderProgram);
        gl.uniform1f(this.programInfo.uniformLocations.time, time);
        gl.uniform4f(this.programInfo.uniformLocations.mouseUV, mouseUV[0], mouseUV[1], mouseUV[2], mouseUV[3]);
        gl.uniform4f(this.programInfo.uniformLocations.scrollUV, scrollUV[0], scrollUV[1], scrollUV[2], 0.0);
        gl.uniform1f(this.programInfo.uniformLocations.randomValue, this.randomValue);

        if(this.texture) 
        {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this.programInfo.uniformLocations.uTexture, 0);
        }
    }

    loadShader(gl, type, source) 
    {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        return shader;
    }

    loadTexture(gl, url) 
    {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Placeholder 1x1 blue
        const pixel = new Uint8Array([0,0,255,255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height))
            {
                gl.generateMipmap(gl.TEXTURE_2D);
            }

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        };
        image.src = url;

        return texture;
    }

    isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
}