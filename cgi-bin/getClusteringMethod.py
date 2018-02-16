#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat - 2016

import sys
import cgi, cgitb 
import json

cgitb.enable()

form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))

clusteringMethod_path = userDirectory+"clusteringMethod"
	
try:
	clusteringMethod_file = open(clusteringMethod_path, 'r')
	clusteringMethod = clusteringMethod_file.read()
	clusteringMethod = clusteringMethod.replace('\r','').replace('\n','')
	
	if len(clusteringMethod) > 0 :	
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'yes', 'clusteringMethod':clusteringMethod})
	else:
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'no'})
	
except Exception, e:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'error', 'except':json.dumps(str(e))})