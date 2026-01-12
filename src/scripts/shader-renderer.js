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

        this.objectData = [];

        this.startTime = performance.now();

        this.meshCache = new Map();
        this.lastBoundMesh = null;

        requestAnimationFrame(this.Render);
    }

    AddRenderer(object) {
        object.Load(this.gl);
        this.objectData.push(object);
    }

    GetMesh(gl, meshData)
    {
        let gpuMesh = this.meshCache.get(meshData.Name)

        if(!gpuMesh)
        {
            gpuMesh = new GPUMesh(gl, meshData)
            this.meshCache.set(meshData.Name, gpuMesh)
        }

        return gpuMesh
    }

    BindMesh(gl, gpuMesh, programInfo)
    {
        if(this.lastBoundMesh === gpuMesh)
            return

        //Vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, gpuMesh.vertexBuffer)
        gl.vertexAttribPointer(programInfo.attribLocations.position, 3, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(programInfo.attribLocations.position)

        //UV1
        gl.bindBuffer(gl.ARRAY_BUFFER, gpuMesh.uvBuffer)
        gl.vertexAttribPointer(programInfo.attribLocations.uv1, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(programInfo.attribLocations.uv1)

        //UV2
        gl.bindBuffer(gl.ARRAY_BUFFER, gpuMesh.uv2Buffer)
        gl.vertexAttribPointer(programInfo.attribLocations.uv2, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(programInfo.attribLocations.uv2)

        //Color
        gl.bindBuffer(gl.ARRAY_BUFFER, gpuMesh.colorBuffer)
        gl.vertexAttribPointer(programInfo.attribLocations.color, 4, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(programInfo.attribLocations.color)

        //Indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpuMesh.indexBuffer)

        this.lastBoundMesh = gpuMesh
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

        this.lastBoundMesh = null

        for(let object of this.objectData)
        {
            const bounds = object.element.getBoundingClientRect()

            const mouseUV = [
                (mouseX - bounds.x) / bounds.width,
                1 - (mouseY - bounds.y) / bounds.height
            ]

            smoothScroll += (scrollY - smoothScroll) * scrollLerp
            const scrollUV = scrollY / bounds.height
            const smoothScrollUV = smoothScroll / bounds.height

            const proj = mat4.create()
            mat4.ortho(proj, 0, w, h, 0, -1, 1)

            const model = mat4.create()
            mat4.translate(model, model, [bounds.x, bounds.y, 0])
            mat4.scale(model, model, [bounds.width, bounds.height, 1])

            object.UpdateProperties(gl, time, mouseUV, scrollUV, smoothScrollUV)

            gl.useProgram(object.programInfo.program)

            const gpuMesh = this.GetMesh(gl, object.meshData)
            this.BindMesh(gl, gpuMesh, object.programInfo)

            gl.uniformMatrix4fv(object.programInfo.uniformLocations.projectionMatrix, false, proj)
            gl.uniformMatrix4fv(object.programInfo.uniformLocations.modelViewMatrix, false, model)

            gl.drawElements(gl.TRIANGLES, gpuMesh.indexCount, gpuMesh.indexType, 0)
        }


        requestAnimationFrame(this.Render);
    }
}
