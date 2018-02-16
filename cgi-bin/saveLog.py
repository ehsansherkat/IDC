#!/users/grad/sherkat/anaconda2/bin/python
import cgi, cgitb 
import sys
import json

cgitb.enable()
form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))
command = eval(form.getvalue('command'))
#print "Content-type:application/json\r\n\r\n"
#print userDirectory
#print command

logFileName = "../log/"+userDirectory

with open(logFileName, "a") as logFile:
    logFile.write(command)
    logFile.write('\n')

logFile.close()

print "Content-type:application/json\r\n\r\n"
print "yes"
