AddEffects();

function AddEffects()
{
    const canvas = document.getElementById("overlay-canvas");
    const test = document.getElementsByClassName("bubble-effect")[0];

    let renderer = new ShaderRenderer(canvas);

    fetch('src/shaders/bubbles.shader')
	.then(response => response.text())
	.then(shader => 
		{
			let shaderData = new ShaderData(test, "test", shader, "src/img/texture-atlas.png");
			renderer.AddRenderer(shaderData);
		}
	);

}

function OnShaderCompiled()
{
    console.log("shader compiled");
}