//Track mouse & scroll -----------------------------------
let mouseX = 0, mouseY = 0;
let scrollY = 0;
let smoothScroll = 0; 
const scrollLerp = 0.1;

// Track mouse
window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
});


//--------------------------------------------------

class ShaderRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, alpha: true });
        if(!this.gl) return;

        this.shaderData = [];
        this.buffers = this.initBuffers(this.gl);

        this.startTime = performance.now();

        requestAnimationFrame(this.Render);
    }

    AddRenderer(shader) {
        shader.Load(this.gl);
        this.shaderData.push(shader);
    }

    initBuffers(gl) {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0,0,0, 1,0,0, 1,1,0, 0,1,0
        ]), gl.STATIC_DRAW);

        const texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0,0, 1,0, 1,1, 0,1
        ]), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        return {position: positionBuffer, textureCoord: texBuffer, indices: indexBuffer};
    }

    Render = () => {
        const gl = this.gl;
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.canvas.width = w;
        this.canvas.height = h;
        gl.viewport(0,0,w,h);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const time = (performance.now() - this.startTime) * 0.001;

        for(let shader of this.shaderData) {
            const bounds = shader.element.getBoundingClientRect();

            // UV mouse
            const mouseUV = [
                (mouseX - bounds.x) / bounds.width,
                1 - (mouseY - bounds.y) / bounds.height
            ];

            // Scroll UV remap: scale scrollY to element height
            smoothScroll += (scrollY - smoothScroll) * scrollLerp;
            const scrollUV = scrollY / bounds.height;
            const smoothScrollUV = smoothScroll / bounds.height;

            // Projection & model
            const proj = mat4.create();
            mat4.ortho(proj, 0, w, h, 0, -1, 1);
            const model = mat4.create();
            mat4.translate(model, model, [bounds.x, bounds.y, 0]);
            mat4.scale(model, model, [bounds.width, bounds.height, 1]);

            // Set shader uniforms
            shader.UpdateProperties(gl, time, mouseUV, scrollUV, smoothScrollUV);

            // Draw quad
            gl.useProgram(shader.programInfo.program);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
            gl.vertexAttribPointer(shader.programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(shader.programInfo.attribLocations.vertexPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.textureCoord);
            gl.vertexAttribPointer(shader.programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(shader.programInfo.attribLocations.textureCoord);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

            gl.uniformMatrix4fv(shader.programInfo.uniformLocations.projectionMatrix, false, proj);
            gl.uniformMatrix4fv(shader.programInfo.uniformLocations.modelViewMatrix, false, model);

            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }

        requestAnimationFrame(this.Render);
    }
}
