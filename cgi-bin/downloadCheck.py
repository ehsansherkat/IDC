#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat
import sys
import cgi, cgitb 
import json
import os.path

cgitb.enable()

form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))
fileName = eval(form.getvalue('fileName'))
  
try:	
	if(os.path.isfile(userDirectory + fileName + ".zip")):
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'yes'})	
	
	else:
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'no'})		
	
except:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'no'})
