import sys
src = open(sys.argv[1], 'r')
dest = open(sys.argv[2], 'w')

def getFileName(line):
	path = ''
	identIdx = 0
	
	if 'href' in line:
		identIdx = line.index('href')
	elif 'src' in line:
		identIdx = line.index('src')
		
	path = line[identIdx:]
	if "'" in path:
		identIdx = path.index("'")
	elif '"' in path:
		identIdx = path.index('"')
	path = path[identIdx+1:]
	if "'" in path:
		identIdx = path.index("'")
	elif '"' in path:
		identIdx = path.index('"')	
	path = path[0:identIdx]
	print 'Path ' + path
	return path

def writeFile(fileName):
	f = open(fileName, 'r')
	for line in f:
		dest.write(line)

	
for line in src:
	if '<script src' in line:
		fileName = getFileName(line)
		dest.write('<script>\n')
		writeFile(fileName)
		dest.write('</script>\n')
	#elif '<link type' in line:
	#	fileName = getFileName(line)
	#	dest.write('<style media="screen" type="text/css">\n')
	#	writeFile(fileName)
	#	dest.write('</style>\n')
	else:
		dest.write(line)