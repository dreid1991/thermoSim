import sys
import os
import re
import shutil

fromDirectory = os.listdir('..\levels')
src = '..\levels'
destination = '.'
def extension(name):
	extRegExp = re.compile("\.[a-zA-Z]*$")
	match = extRegExp.search(name)
	if match == None:
		return ""
	else:
		return match.group(0)

for entry in fromDirectory:
	if (extension(entry) == '.js'):
		entryName = os.path.join(src, entry)
		shutil.copy(entryName, destination)
		

