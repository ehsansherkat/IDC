#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat
import sys
import cgi, cgitb 
import json
import os
import io
import shutil
from fpdf import FPDF

cgitb.enable()

form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))
TXT_Documents = json.loads(form.getvalue('TXT_Documents'))

def removeNonAscii(s): return "".join(filter(lambda x: ord(x)<128, s))

try:		
	#create temp folder
	if not os.path.exists(userDirectory + "temp"):
		os.makedirs(userDirectory + "temp")
		
	#remove previous files
	for file in os.listdir(userDirectory + "temp"):
		os.remove(userDirectory + "temp/" + file);
	
	#convert text to pdf
	for index in range(len(TXT_Documents)):
		pdf=FPDF()
		pdf.add_page()
		pdf.set_font('Arial','',8)
		pdf.write(5, removeNonAscii(TXT_Documents[index]))
		pdf.output(userDirectory + "temp" +"/paper"+str(index)+".pdf",'F')
		#save files as text in user directory
		save_text = open(userDirectory + "/paper"+str(index)+".txt", 'w')
		save_text.write(removeNonAscii(TXT_Documents[index]))
		save_text.close()

	pp_File = open(userDirectory + "pp.status", 'w')
	pp_File.write("yes")
	pp_File.close()
	
	#create zip file	
	shutil.make_archive(userDirectory + 'result', 'zip', userDirectory + "temp")
	
	print "Content-type:application/json\r\n\r\n"	
	print json.dumps({'status':'yes'})
	
except:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'no'})