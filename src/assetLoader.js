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

loadAsset("models/test-model.js")
loadAsset("animations/test-animation.js");

loadAsset("models/bigfish-blue.js");
loadAsset("models/bigfish-red.js");
loadAsset("models/bigfish-yellow.js");
loadAsset("models/smallfish-blue.js");
loadAsset("models/smallfish-red.js");
loadAsset("models/smallfish-yellow.js");
loadAsset("models/pufferfish-blue.js");
loadAsset("models/pufferfish-red.js");
loadAsset("models/pufferfish-yellow.js");