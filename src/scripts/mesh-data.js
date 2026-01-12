class MeshData
{
    constructor(meshFile)
    {
        const data = JSON.parse(meshFile);

        this.Name = data.name;

        this.Position = new Float32Array([
            data.position.x,
            data.position.y,
            data.position.z
        ]);

        const q = data.rotation.value;
        this.Rotation = new Float32Array([ q.x, q.y, q.z, q.w ]);

        this.Scale = new Float32Array([
            data.scale.x,
            data.scale.y,
            data.scale.z
        ]);

        this.Vertices = new Float32Array(data.vertices);
        this.UV1 = new Float32Array(data.uv1);
        this.UV2 = new Float32Array(data.uv2);
        this.Colors = new Float32Array(data.colors);
        this.Indices = new Uint32Array(data.indices);

        // //No need for uint32 indices
        // const maxIndex = Math.max(...data.indices)

        // if(maxIndex < 65536)
        // {
        //     this.Indices = new Uint16Array(data.indices)
        // }
        // else
        // {
        //     this.Indices = new Uint32Array(data.indices)
        // }

        this.VertexCount = this.Vertices.length / 3;
        this.IndexCount = this.Indices.length;
    }
}

class GPUMesh
{
    constructor(gl, meshData)
    {
        //Vertices
        this.vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, meshData.Vertices, gl.STATIC_DRAW)

        //UV1
        this.uvBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, meshData.UV1, gl.STATIC_DRAW)

        //UV2
        this.uv2Buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uv2Buffer)
        gl.bufferData(gl.ARRAY_BUFFER, meshData.UV2, gl.STATIC_DRAW)

        //Colors
        this.colorBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, meshData.Colors, gl.STATIC_DRAW)

        //Indices
        this.indexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, meshData.Indices, gl.STATIC_DRAW)

        this.indexCount = meshData.IndexCount
        this.indexType = gl.UNSIGNED_INT
    }
}
