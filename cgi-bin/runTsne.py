#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat
import sys
import cgi, cgitb 
import json
import os
from sklearn.manifold import TSNE

try:
	cgitb.enable()

	form = cgi.FieldStorage()

	userDirectory = eval(form.getvalue('userDirectory'))
	userID = eval(form.getvalue('userID'))
	perplexityNew = eval(form.getvalue('perplexityNew'))

	# run tsne
	tsneFile = userDirectory + "tsne"	
	os.system("cat "+ userDirectory + "out" + userID + ".Matrix"+" | tr ',' '\t' | ./bhtsne.py -d 2 -p "+perplexityNew+" > "+tsneFile)

	#sklearn tsne
	# array = np.asarray(utility.read_term_document_matrix(userDirectory + "out" + userID + ".Matrix"))
	# n_components = 2
	# TSNE_model = TSNE(n_components=2, perplexity=30.0, method='barnes_hut')
	# TSNE_result = TSNE_model.fit_transform(array)
	# TSNE_string = ""
	# for i in range(0, len(TSNE_result)):
	#	 for j in range(0, n_components):
	#		 if j == 0:
	#			 TSNE_string += str(repr(TSNE_result[i, j]))
	#		 else:
	#			 TSNE_string += '\t' + str(repr(TSNE_result[i, j]))
	#	 TSNE_string += "\n"
	# TSNE_file = open(tsneFile, 'w')
	# TSNE_file.write(TSNE_string)
	# TSNE_file.close()

	#save perplexity number
	perplexity_File = open(userDirectory + "perplexity", 'w')
	perplexity_File.write(perplexityNew)
	perplexity_File.close()

	print "Content-type:application/json\r\n\r\n"	
	print json.dumps({'status':'success'})
except Exception, e:
	print "Content-type:application/json\r\n\r\n"
	print json.dumps({'status':'error', 'except':json.dumps(str(e))})