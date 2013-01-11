import sys
import re 
import string
css = open(sys.argv[1], 'r')
newClass = sys.argv[2];
regExp = re.compile("\.[A-Z a-z\-]*(\{|\,|\:)")

def appendNewClass(str):
	loopList = range(len(str))
	loopList.reverse()
	appendIdx = 0
	for charIdx in loopList:
		char = str[charIdx]
		if char != ' ' and char != '{' and char != ':' and char != ',':
			appendIdx = charIdx
			break
	return str[0:appendIdx+1] + '.' + newClass + str [appendIdx+1:len(str)]
	
	
def parseLine(line):
	newLine = ''
	while True:
		match = regExp.search(line)
		if match == None: break
		str = match.group(0)
		strIdx = string.index(line, str)
		newLine += line[0:strIdx]
		newStr = appendNewClass(str)
		newLine += newStr
		line = line[strIdx + len(str):len(line)]
	newLine += line
	print newLine
def replace():
	for line in css:
		parseLine(line)

replace()