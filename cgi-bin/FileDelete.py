#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat
import sys
import cgi, cgitb 
import json
import os

cgitb.enable()

form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))
fileName = eval(form.getvalue('fileName'))

try:	
	#remove files
	if os.path.isfile(userDirectory + fileName):
		os.remove(userDirectory + fileName)		
		rootName = fileName.split('.')[0]
		if os.path.isfile(userDirectory + rootName + ".txt"):
			os.remove(userDirectory + rootName + ".txt")
		if os.path.isfile(userDirectory + rootName + ".pdf"):
			os.remove(userDirectory + rootName + ".pdf")

		pp_File = open(userDirectory + "pp.status", 'w')
		pp_File.write("yes")
		pp_File.close()
	
		print "Content-type:application/json\r\n\r\n"	
		print json.dumps({'status':'yes'})
	else:
		print "Content-type:application/json\r\n\r\n"	
		print json.dumps({'status':'no'})
	
except Exception, e:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'error', 'except':json.dumps(str(e))})