#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat
import sys
import cgi, cgitb 
import json
import os.path

cgitb.enable()

form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))
  
try:	
	data = eval(form.getvalue('vna'))
						
	sessionFile = open(userDirectory + "vna", "w")
	sessionFile.write(data)
	sessionFile.close()
	
	if(os.path.isfile(userDirectory + "vna")):
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'yes'})	
	
	else:
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'no'})		
	
except:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'no'})
