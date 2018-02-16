#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat
import sys
import cgi, cgitb 
import json
import os

cgitb.enable()

form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))
file_content = eval(form.getvalue('file_content'))
file_name = eval(form.getvalue('file_name'))
file_type = eval(form.getvalue('file_type'))
 
try:
	saveFile = open(userDirectory + file_name, 'w')
	file_content = file_content.split(';base64,')[1]
	saveFile.write(file_content.decode('base64'))
	saveFile.close()

	if file_type == "PDF":
		#convert to txt
		try:
			os.system("pdftotext \"" + userDirectory + file_name+"\"")
			print "Content-type:application/json\r\n\r\n"
			print json.dumps({'status':'yes'})
		except Exception, e:
			print "Content-type:application/json\r\n\r\n"
			print json.dumps({'status':'error', 'except':json.dumps(file_content)})
	else:
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'yes'})

	pp_File = open(userDirectory + "pp.status", 'w')
	pp_File.write("yes")
	pp_File.close()
	
except Exception, e:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'error', 'except':json.dumps(str(e))})