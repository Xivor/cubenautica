function loadModelFile(file) { 
	let newScript = document.createElement("script"); 
	newScript.src = file; 
	document.body.appendChild(newScript);
}
loadModelFile("models/pokeball-point.js")
