import sys

filesList = open(sys.argv[1], 'r')

print "java -jar ../../compiler.jar ^"
print "--compilation_level SIMPLE_OPTIMIZATIONS ^"
print "--language_in ECMASCRIPT5 ^"
for line in filesList:
	print "--js " + line.rstrip() + " ^"
print "--js_output_file ../core-compiled.js"