#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat - 2016

import sys
import cgi, cgitb 
import json

cgitb.enable()

form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))

cluster_number_path = userDirectory+"clusters.number"
	
try:
	cluster_number_file = open(cluster_number_path, 'r')
	number = cluster_number_file.read()
	number = number.replace('\r','').replace('\n','')
	
	if len(number) > 0 :	
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'yes', 'number':number})
	else:
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'no'})
	
except Exception, e:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'error', 'except':json.dumps(str(e))})