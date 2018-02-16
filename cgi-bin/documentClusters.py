#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat - 2017
import sys
import json
import cgi, cgitb
import zipfile
import os

cgitb.enable()

form = cgi.FieldStorage()

userDirectory = eval(form.getvalue('userDirectory'))
serverClusterName = eval(form.getvalue('serverClusterName'))

try:
	documentClusters = userDirectory + 'documentClusters'
	documentClustersCSV = open(documentClusters, 'r')

	zipCollection = zipfile.ZipFile(userDirectory + 'collection.zip', mode='w') #zip all clusters

	for index, clusterDocs in enumerate(documentClustersCSV):
		if ',' in clusterDocs:
			clusterDocs = clusterDocs.replace('\n', '').replace('\r', '')
			clusterDocs = clusterDocs.split(',')

			zipcluster = zipfile.ZipFile(userDirectory + serverClusterName[index] + '.zip', mode='w') #zip a cluster		

			for doc in clusterDocs:
				zipcluster.write(userDirectory + doc, doc)
				zipCollection.write(userDirectory + doc, serverClusterName[index] + "/" + doc )

			zipcluster.close()
	zipCollection.close()

	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'yes', 'message':json.dumps(str(serverClusterName))})

except Exception as e:
	exc_type, exc_obj, exc_tb = sys.exc_info()
	fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'error', 'except':json.dumps(str(e) + " Error line:" + str(exc_tb.tb_lineno) + " Error type:" + str(exc_type) + " File name:" + fname)})