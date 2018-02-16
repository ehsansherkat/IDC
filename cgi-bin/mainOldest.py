#!/users/grad/sherkat/anaconda2/bin/python
import cgi, cgitb 
import numpy
import scipy
from scipy.cluster.vq import vq, kmeans2
from scipy.spatial.distance import cdist
from scipy.spatial.distance import pdist
from scipy.spatial.distance import squareform
from sklearn.metrics import silhouette_score
import confusionMatrix as CM
import sys
import importCSV
from numpy.random import random
import cmeans as Fuzzy
import json
import os
import tsne as projec



cgitb.enable()


#print "Content-type:text/html\r\n\r\n"
#print "Content-type:application/json\r\n\r\n"


form = cgi.FieldStorage()


userDirectory = form.getvalue('userDirectory')
fileName = form.getvalue('fileName')
#labelName = form.getvalue('labelFileName')
specName = form.getvalue('specFileName')
termName = form.getvalue('termsFileName')
fileListName = form.getvalue('fileListName')
mmFileName = userDirectory + "docClusters.mm"
tsneFile = userDirectory + "tsne"





k = eval(form.getvalue('clusterNumber'))
userU = eval(form.getvalue('userU'))

#multiple = eval(form.getvalue('multiple'))


number = 1
f = 150

N = -1; #eval(form.getvalue('NumofDocs'))
M = -1; #eval(form.getvalue('NumofTerms'))
N, M = importCSV.importSpecfile(specName)

data = numpy.empty([N, M], dtype=float)
importCSV.importDatafile(fileName, data)


## Barnes-Hut t-SNE: faster tsne O(NLogN)
os.system("cat "+fileName+" | tr ',' '\t' | ./bhtsne.py -d 2  > "+tsneFile)

## python-based t-SNE
#Y = projec.tsne(data, 2, 50)
#numpy.savetxt(tsneFile, data, delimiter='\t')


Y = squareform(pdist(data, 'cosine'))

outputDocDist = userDirectory+"documentDistance"
fo = open(outputDocDist, "wb")
for i in range(N):
	comma = ''
	for j in range(N):
		fo.write(comma+ str(Y[i][j]))
		comma = ','
	fo.write("\n")

fo.close()




terms = numpy.empty([1,M], dtype=object)
importCSV.importTermfile(termName, terms)

docs = numpy.empty([1,N], dtype=object)
importCSV.importTermfile(fileListName, docs)




#tempData = numpy.empty([N, M], dtype=float)
#importCSV.importDatafile(fileName, tempData)


#tempTerms = numpy.empty([1,M], dtype=object)
#importCSV.importTermfile(termName, tempTerms)

#docs = numpy.empty([1,M], dtype=object)
#importCSV.importTermfile(fileListName, docs)


#CM.rowNormalize(tempData)

#Vars = numpy.var(tempData, axis = 0)

#meanVar = numpy.mean(Vars)

#tempIdx = numpy.where(Vars >= meanVar)[0]

#M = len(tempIdx)

#terms = numpy.empty([1,M], dtype=object)
#terms[0] = tempTerms[0,tempIdx]

#data = tempData[:,tempIdx]
#CM.rowNormalize(data)


#serverClusetrName = []

if (userU == +1):
	#serverClusetrName = eval(form.getvalue('serverClusetrName'))
	userFeedbackTerm = eval(form.getvalue('serverData'))
	#print userFeedbackTerm
	userU = numpy.zeros((k,M),float)

	userFeedbackTermId = []
	for i in range(len(userFeedbackTerm)):
	    tempArray = []
	    if (len(userFeedbackTerm[i]) == 1):
		if (numpy.where(terms == userFeedbackTerm[i][0])[1].size > 0):
	        	userU[i, numpy.where(terms == userFeedbackTerm[i][0])[1][0]] = 1 
	    else:
	    	#step = 0.5/(len(userFeedbackTerm[i])-1)
                step = 0.05
	    	for j in range(len(userFeedbackTerm[i])):
			if (numpy.where(terms == userFeedbackTerm[i][j])[1].size > 0):
	        		userU[i, numpy.where(terms == userFeedbackTerm[i][j])[1][0]] = max(1 - j*step, 0.5)
	



Vars = numpy.var(data, axis = 0)

options = (1.1, 50, 0.01, 1)

results = []
Fval = []
NMI = []
keyterms = []
#clusterKeyterms = numpy.empty([1,k], dtype=object)
clusterKeyterms = []
clusterDocs = []

realK = 0

while (realK < k):
        
        idp = []
        
        selectedCentroids = numpy.empty([k, M], dtype=float)
        attrVals = numpy.empty([M,k], dtype=float)
        
	fcm = Fuzzy.FuzzyCMeans(data.transpose(), k, options[0], 'cosine', userU)
        fcm()
        bestU = fcm.mu #.transpose()
	
        for p in range(k):
		sortIDX = numpy.argsort(bestU[p,:])
		sortV = numpy.sort(bestU[p,:])
                tempIndex = numpy.argmax(sortV > (1.0/k))
                idp.append(sortIDX[tempIndex:])
		
	for p in range(k):
                idx = []
                idpp = idp[p]
                
		Varsp = Vars[idpp]
		meanVarsp = numpy.mean(Varsp)
		tempIndex = numpy.where(Varsp >= meanVarsp)[0]
                keyTerms = idpp[tempIndex]
                
		newDataset = data[:,keyTerms]
		sumDataset = numpy.mean(newDataset, axis = 1)
		
		temp, label = scipy.cluster.vq.kmeans2(sumDataset, 2, iter=100, thresh=1e-06, minit='random', missing='warn')
		

		idx.append(numpy.where(label == 0)[0])
                idx.append(numpy.where(label == 1)[0])
		if (idx[0].size == 0):
			relDocs = idx[1]
		elif (idx[1].size == 0):
			relDocs = idx[0]
                else: 
			if (idx[0].size >= idx[1].size):
                    		relDocs = idx[1]
                	else:
                    		relDocs = idx[0]
                selectedCentroids[p,:] = numpy.mean(data[relDocs,:], axis = 0)
                
        Y = cdist(data, selectedCentroids, 'cosine')
	

	minY = numpy.min(Y, axis=1)
        maxY = numpy.max(Y, axis=1)
        maxMmin = maxY - minY
        minY = numpy.kron(numpy.ones((k,1)),minY).transpose()
        maxMmin = numpy.kron(numpy.ones((k,1)),maxMmin).transpose()
        tempY = numpy.multiply((Y - minY),numpy.power(maxMmin,-1.0))
        tempY = 1 - tempY
	
		
	

	threshold = 0.85
        tempY = (tempY > threshold)
	clusters = []
        for p in range(k):
            clusters.append(numpy.where(tempY[:,p])[0])
	
	
	

	minY = numpy.min(Y)
	maxY = numpy.max(Y)
	tempY = 1 - numpy.multiply((Y - minY),numpy.power(maxY-minY,-1.0))
	
	
	outputDocMembs = userDirectory+"documentMembs"
	fo = open(outputDocMembs, "wb")
	fo.write("name")
	for p in range(k):
		fo.write(",cluster"+str(p))
	fo.write("\n")
	for i in range(N):
		textFile = docs[0, i]
		textFile = textFile[0:textFile.rindex('.')]
		fo.write(textFile+'.txt')
		for p in range(k):
			fo.write(","+str(tempY[i,p]*100))
		fo.write("\n")
		
	fo.close()

	realK = 0
	IDX = numpy.argmin(Y, axis=1)
	newclusters = []
        for p in range(k):
         	  newclusters.append(numpy.where(IDX == p)[0])
		  if (len(newclusters[p]) > 0):
			realK = realK + 1
	del newclusters

silhouette_avg = silhouette_score(data, IDX, 'cosine')

	
CM.computeX2(attrVals, clusters, data, N)
attIDTemp = numpy.argmax(attrVals, axis = 1)
id = []
idp = []
for p in range(k):
	temp = numpy.argsort(attrVals[:,p])
	temp = temp[::-1]
	keyterms.append(temp[range(f)])

	
minV = numpy.min(attrVals)
maxV = numpy.max(attrVals)
attrVals = numpy.multiply((attrVals - minV),numpy.power(maxV-minV,-1.0))
        		

	
outputTermMembs = userDirectory+"termMembs"
fo = open(outputTermMembs, "wb")
fo.write("name")
for p in range(k):
	fo.write(",cluster"+str(p))
fo.write("\n")
for i in range(M):
	term = terms[0, i]
	fo.write(term)
	for p in range(k):
		fo.write(","+str(attrVals[i,p]*100))
	fo.write("\n")
		
fo.close()
           
                
for p in range(k):
    tempStr = '['
    comma = ''
    for j in range(len(keyterms[p])):
        tempStr += comma + '\"' + terms[0, keyterms[p][j]] + '\"'
        comma = ','
    tempStr += ']'
    clusterKeyterms.append(tempStr)

outputClusterFile = userDirectory+"documentClusters"
outputTermClusterFile = userDirectory+"termClusters"
#print 'hamid'+outputClusterFile
#print 'hamid'+outputTermClusterFile
######################## output > documentClusters #####################################
fo = open(outputClusterFile, "wb")
fo2 = open(mmFileName, "wb")
fo2.write("<map version=\"0.9.0\">\n")
fo2.write("<node STYLE=\"bubble\" TEXT=\"Document Clusters\">\n")
fo2.write("<hook NAME=\"accessories/plugins/AutomaticLayout.properties\"/>\n")

for p in range(k):
    fo2.write("<node FOLDED=\"true\" TEXT=\""+terms[0, keyterms[p][0]]+"-"+terms[0, keyterms[p][1]] +"\">\n")
    tempStr = '['
    comma = ''
    fo2.write("<richcontent TYPE=\"NOTE\">\n")
    fo2.write("<html>\n<head></head>\n<body>\n<p>")
    fo2.write("Cluster size: "+ str(len(clusters[p])))
    fo2.write("</p>\n</body>\n</html>\n</richcontent>\n")
    
    for j in range(len(clusters[p])):
	textFile = docs[0, clusters[p][j]]
	fo2.write("<node LINK=\""+"http://demeter.research.cs.dal.ca/UserSupervisedClustering"+userDirectory[2:len(userDirectory)]+textFile[0:textFile.rindex('.')]+'.pdf'+"\" TEXT=\""+textFile+"\">\n")
	tempStr += comma + '\"' + docs[0, clusters[p][j]] + '\"'
	fo.write(comma+docs[0, clusters[p][j]])
	comma = ','
	try:
		
		with open(userDirectory+docs[0, clusters[p][j]]) as textFile:
			first_line = textFile.readline()
			fo2.write("<richcontent TYPE=\"NOTE\">\n")
			fo2.write("<html>\n<head></head>\n<body>\n<p>")
			fo2.write(first_line[0:min(f,len(first_line))])
			fo2.write("</p>\n</body>\n</html>\n</richcontent>\n")
			

		textFile.close()
	except:
		fo2.write("<richcontent TYPE=\"NOTE\">\n")
		fo2.write("<html>\n<head></head>\n<body>\n<p>")
		fo2.write("</p>\n</body>\n</html>\n</richcontent>\n")
	
	fo2.write("</node>\n")	
    fo.write("\n")
    tempStr += ']'
    clusterDocs.append(tempStr)
    fo2.write("</node>")
fo2.write("</node>\n</map>\n")
fo.close()
fo2.close()

######################## output > termClusters #####################################

foTerm = open(outputTermClusterFile, "wb")
for p in range(k):
    comma = ''
    for j in range(len(keyterms[p])):
	foTerm.write(comma+terms[0, keyterms[p][j]])
	comma = ','
    foTerm.write("\n")

foTerm.close()

output1 = json.dumps(clusterKeyterms)
output2 = json.dumps(clusterDocs)
output3 = json.dumps(silhouette_avg)
print "Content-type:application/json\r\n\r\n"
print json.dumps({'termClusters':output1, 'docClusters':output2, 'silhouette':output3})
        
        
                    
                
		
		
		
		
	

