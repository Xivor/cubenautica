import sys
import os

# Lê o .ply passado como input e cria um .js com seu conteúdo no diretório dirPath
# O arquivo .js gerado de um exemplo.ply é da forma "const exemplo = '<conteúdo de exemplo.ply';"
def createJS(ply, newName, dirPath="models"):
	with open(ply, "r") as file:
		content = file.read()

		# Nome default do .js é o mesmo do .ply (mas sem p .ply no final obv)
		if not newName:
			newName = ply.split(".")[0] + ".js"

		if not os.path.isdir(dirPath):
			os.mkdir(dirPath)

		jsFile = open(dirPath + "/" + newName, "w")
		ply = ply.replace("-", "_") # JS não gosta de - no nome de coisas
		jsFile.write("const " + ply.split(".")[0] + " = `")
		jsFile.write(content)
		jsFile.write("`;")

		jsFile.close()
		file.close()

# Cria/atualiza o arquivo loadModelFiles.js, usado no html para conseguir incluir os arquivos criados em createJS 
def refreshLoadFile(loadFile="loadModelFiles.js", dirPath="models"):
	file = open(loadFile, "w")
	file.write("function loadModelFile(file) { \n\
	let newScript = document.createElement(\"script\"); \n\
	newScript.src = file; \n\
	document.body.appendChild(newScript);\n\
}\n")

	modelFileList = os.listdir(dirPath)
	for modelFile in modelFileList:
		fullPath = dirPath + "/" + modelFile
		file.write(f"loadModelFile(\"{fullPath}\")\n")

	file.close()

def main():
	n = len(sys.argv)

	if n <= 1 or n > 3:
		print("uso: python3 <arquivo .ply> (nome do arquivo gerado (precisa ter o .js no final))")
		exit()
	elif n == 2:
		createJS(sys.argv[1], None)
	else:
		createJS(sys.argv[1], sys.argv[2])

	refreshLoadFile()

if __name__ == '__main__':
	main()