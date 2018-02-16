#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat
import sys
import cgi, cgitb 
import json
import os

cgitb.enable()

form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))
file_name = eval(form.getvalue('file_name'))
 
try:	
	if os.path.exists(userDirectory):
		if os.path.isfile(userDirectory + file_name):
			print "Content-type:application/json\r\n\r\n"
			print json.dumps({'status':'fileExists', 'except':'File exists!'})
		else:
			print "Content-type:application/json\r\n\r\n"
			print json.dumps({'status':'yes'})	
	else:
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'noDirect', 'except':'No such user exists!'})		
	
except Exception, e:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'error', 'except':json.dumps(file_content)})