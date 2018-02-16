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
name = eval(form.getvalue('name'))
  
try:
	data = json.dumps({
						'fileName':eval(form.getvalue('fileName')),
						'clusterWords':eval(form.getvalue('clusterWords')), 
						'clusterKeyTerms':eval(form.getvalue('clusterKeyTerms')),						
						'clusterDocuments':eval(form.getvalue('clusterDocuments')),
						'clusterCloud':eval(form.getvalue('clusterCloud')),
						'termClusterData':eval(form.getvalue('termClusterData')),
						'termClusterDataString':eval(form.getvalue('termClusterDataString')),
						'documentClusterData':eval(form.getvalue('documentClusterData')),
						'gravity':eval(form.getvalue('gravity')),
						'removedDocuments':eval(form.getvalue('removedDocuments')),
						'linkDistance':eval(form.getvalue('linkDistance')),
						'cosineDistance':eval(form.getvalue('cosineDistance')),	
						# 'documentsName':eval(form.getvalue('documentsName')),		
						# 'documentDocumentSimilarity':eval(form.getvalue('documentDocumentSimilarity')),
						# 'termDocumentSimilarity':eval(form.getvalue('termDocumentSimilarity')),
						'sessionDescription':eval(form.getvalue('sessionDescription')),	
						'silhouette':eval(form.getvalue('silhouette')),							
						'documentClusterDataString':eval(form.getvalue('documentClusterDataString'))
						})
						
	sessionFile = open(userDirectory + name + ".session", "w")
	sessionFile.write(data)
	sessionFile.close()
	
	if(os.path.isfile(userDirectory + name + ".session")):
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'yes'})	
	
	else:
		print "Content-type:application/json\r\n\r\n"
		print json.dumps({'status':'no'})		
	
except:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'error'})
