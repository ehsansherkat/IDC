#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat
import sys
import cgi, cgitb 
import json
import os

cgitb.enable()

form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))

try:	
	#remove files
	for file in os.listdir(userDirectory):
		if os.path.isfile(userDirectory + file):
			os.remove(userDirectory + file);
	
	print "Content-type:application/json\r\n\r\n"	
	print json.dumps({'status':'yes'})
	
except Exception, e:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'error', 'except':json.dumps(str(e))})