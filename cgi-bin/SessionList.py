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
	sessions = []
	sessionDescription = []

	fileList = os.listdir(userDirectory)
	fileList.sort();

	for file in fileList:
		if file.endswith('.session'):
			sessionFile = open(userDirectory + file, 'r')
			data = sessionFile.read()
			dataJson = json.loads(data)
			sessionDescription.append(dataJson['sessionDescription'])
			sessions.append(dataJson['fileName'])
	
	if len(sessions) > 0 :	
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'yes', 'sessions':sessions, 'sessionDescription':sessionDescription})	
	
	else:
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'no'})		
	
except:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'error'})
