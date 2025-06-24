function loadAsset(file) {
	file = "assets/" + file; 
	let newScript = document.createElement("script"); 
	newScript.src = file;
	document.body.appendChild(newScript);
}

loadAsset("shaders/basic.vert.js");
loadAsset("shaders/basic.frag.js");
loadAsset("shaders/textured.vert.js");
loadAsset("shaders/textured.frag.js");
loadAsset("shaders/toon.frag.js");

loadAsset("models/test-model.js")
loadAsset("animations/test-animation.js");
