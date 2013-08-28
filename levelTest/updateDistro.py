import sys
import os
import re

fromDirectory = os.listdir('..\levels')
toDirectory = os.listdir('c:')

def extension(name):
	extRegExp = re.compile("\.[a-zA-Z]*$")
	match = extRegExp.search(name)
	if match == None:
		return ""
	else:
		return match.group(0)
def updateDistro(		

print fromDirectory
print toDirectory
wait = input("press enter to continue")