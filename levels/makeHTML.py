import sys
import os
import re

# files = open(sys.argv[1], 'r')
directory = os.listdir('.') #huh?
print directory
def extension(name):
	extRegExp = re.compile("\.[a-zA-Z]*$")
	match = extRegExp.search(name)
	if match == None:
		return ""
	else:
		return match.group(0)
def makeHTML(levelDataFileName, fileListName):
	files = open(fileListName, 'r')
	html = """
	<html>
	<body>
	<!SIMULATION>
	<link type='text/css' href = '../css/custom-theme/jquery-ui-1.9.2.custom.sim.css' rel='stylesheet' />
	<link type='text/css' href = '../styles.css' rel='stylesheet'/>
	<link type='text/css' href = '../mathStyles.css' rel='stylesheet'/>

	<div class='sim noSelect wrapper'>
		<table class='tableWrapper'>
		<tr><td>
			<div id='main' class='sim main noSelect'>
				<div id='mainHeader' class='sim header noSelect'>

				</div>
				<div id='canvasDiv' class='sim canvasDiv noSelect'>
					<canvas id='myCanvas'>
					</canvas>
				</div>
				<div id='display' class='sim display noSelect'>
						<div id='intText' class='sim displayText noSelect'>
					</div>
				</div>

				<div id='dashRunWrapper' style='position:relative'>
					<div id='dashRunBlank' class='sim dashMed noSelect' style='position:relative;display:none;'>

					</div>
					<button id='resetExp' style='position:absolute; right:.5em; bottom:.25em; z-index: 1' class='sim'><!image appended in init></button>
				</div>
				<div id='dashCutScene' class='sim dashMed noSelect'></div>
			</div>
		</td>
		<td class='padLeft floatTop'>

			<div id = 'buttonManagerWrapper'>
				<div class='sim buttonManager' id='buttonManager'>

				</div>
			</div>

		</td>
		<td class='padLeft floatTop'>
			<div id='auxSlots' class='sim auxSlots noSelect'>
				<div id='aux1' class='sim aux' filledWith=''>
				</div>
				<div id='auxSpacer' class='sim auxSpacer'>
				</div>
				<div id='aux2' class='sim aux' filledWith=''>
				</div>
			</div>
		</td></tr>
		</table>
	</div>
	<br>
	<div id='base' class='sim base noSelect'>
		<div id='baseHeader' class='sim header noSelect'></div>
		<div class='sim borderedBlock noSelect'>
			<div id='quesHolder noSelect'>
			</div>
			<div style='padding:10px' class='sim displayText noSelect'>
				<div id='prompt'>

				</div>

				<div id='nextPrevDiv' align='right' class='sim'>
					<button id = 'previous'>Back</button>
					<button id = 'next'>Next</button>
				</div>

			</div>
		</div>

		<div id='baseDash' class='sim bottomRound noSelect'></div>
	</div>
	<img id='brickImg' src='img/brick.bmp' style='visibility:hidden'></img>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
	"""
	for fileName in files:
		html += "<script src = '" + fileName.rstrip() + "'></script>"
	html += "<script src = '" + levelDataFileName.rstrip() + "'></script>"
	html += """
	</body>
	</html>
	"""
	return html

for entry in directory:
	if (extension(entry) == '.js'):
		line = entry.rstrip()
		rootName = line[:len(line) - 3]
		htmlName = rootName + '.html'
		f = open(htmlName, 'w')
		f.write(makeHTML(entry, sys.argv[1]))


