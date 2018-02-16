#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat
import sys
import cgi, cgitb 
import json
import os.path

cgitb.enable()

form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))
sessionName = eval(form.getvalue('sessionName'))
  
try:	
	if(os.path.isfile(userDirectory + sessionName)):
	
		sessionFile = open(userDirectory + sessionName, 'r')
		data = sessionFile.read()
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'yes', 'data':data})	
	
	else:
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'no'})		
	
except:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'error'})
