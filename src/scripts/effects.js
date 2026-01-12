var renderer;

AddEffects();

function AddEffects()
{
    const canvas = document.getElementById("overlay-canvas");
    
    renderer = new ShaderRenderer(canvas);
    
    //Bubbles
    const bubbles = document.getElementsByClassName("bubble-effect");
    for (const bubble of bubbles) 
    {
        AddShaderAndMesh(bubble, 'bubbles', 'quad', 'bubbles', 'texture-atlas');
    }

    //Leaves
    const leaves = document.getElementsByClassName("leaves-effect");
    for (const leavesElement of leaves) 
    {
        AddShaderAndMesh(leavesElement, 'leaves-left', 'leaves', 'leaves', 'leaves');
    }
}


function AddShaderAndMesh
(
    htmlElement,
    guid,
	meshName,
	shaderName,
	textureName,
	onReady
)
{
	Promise.all([
		fetch('src/meshes/' + meshName + ".mesh").then(r => r.text()),
		fetch('src/shaders/' + shaderName + ".shader").then(r => r.text())
	])
	.then(function OnLoaded(results)
	{
		let mesh = new MeshData(results[0]);
		let shader = new ShaderData(results[1]);
		let object = new ObjectData(htmlElement, guid, mesh, shader, 'src/img/' + textureName + '.png');
        
		renderer.AddRenderer(object);
	});
}
