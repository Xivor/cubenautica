function loadAsset(file) { 
	let newScript = document.createElement("script"); 
	newScript.src = file;
	document.body.appendChild(newScript);
}

loadAsset("shaders/vertex.js");
loadAsset("shaders/fragment.js");

loadAsset("models/test-model.js")
loadAsset("animations/test-animation.js");