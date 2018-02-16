#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat
import sys
import cgi, cgitb 
import json
import os
from os.path import basename

cgitb.enable()

form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))
 
try:
	files = []

	fileList = os.listdir(userDirectory)
	fileList.sort();

	for file in fileList:
		if file.endswith('.txt'):
			fileName = basename(file.split('.')[0])
			# check if there is a pdf
			if os.path.isfile(userDirectory + fileName + ".pdf"):
				files.append(fileName+ ".pdf")
			else:
				files.append(fileName+ ".txt")
	
	if len(files) > 0 :	
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'yes', 'files':files})	
	
	else:
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'no'})		
	
except Exception, e:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'error', 'except':json.dumps(str(e))})
