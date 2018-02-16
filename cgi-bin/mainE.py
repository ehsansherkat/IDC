#!/users/grad/sherkat/anaconda2/bin/python
#Author: Ehsan Sherkat - Aug. 2016
import bestCmeans
import utility
import cgi, cgitb
import json
from scipy.spatial.distance import cosine
import numpy as np
from sklearn.cluster import KMeans
from sklearn import metrics
import sys, os
import math

try:
    cgitb.enable()
    form = cgi.FieldStorage()

    userDirectory = form.getvalue('userDirectory')
    userID = eval(form.getvalue('userID'))
    firstTime = eval(form.getvalue('userU'))#if it is the first time that the algorithm is running -1:first +1:interaction
    numberOfClusters = eval(form.getvalue('clusterNumber'))# number of clusters
    confidenceUser = float(eval(form.getvalue('confidenceUser')))

    # for testing:
    # label_file = open("/home/ehsan/Desktop/newsgroup5/fileList", 'r')
    # userDirectory = "/home/ehsan/Desktop/newsgroup5/"
    # userID = "newsgroup5"
    # firstTime = "-1"  # if it is the first time that the algorithm is running
    # clusterNames = ""
    # clusterTerms = []
    # numberOfClusters = 5  # number of clusters

    #algorithm config. parameters
    termPercentileInit = 10.0 * math.pow(2, 2 * (1 - confidenceUser / 50.0)) # upper bound for the number of terms of each cluster after expansion (default 10, by confidencUser 50)- the lower the more slave to user comands 
    documentPercentileInit = 20.0 * math.pow(2, 2 * (1 - confidenceUser / 50.0))  # upper bound for the number of documents of each cluster after expansion (default 20, by confidencUser 50)- the lower the more slave to user comands 
    cmeansWords = 5 #get top 5 term of cmeans
    numberOfTermsOfCluster = 100# at most top 100 words for each cluster will be sent to the user (terms less than avg are filterd).

    # read document-term matrix
    document_term_matrix = np.asarray(utility.read_term_document_matrix(userDirectory + "out" + userID + ".Matrix"),
                                      dtype=float)

    # read list of document name (name of the rows of the document-term matrix)
    documentNames, documentNamesIndex = utility.read_single_column_data(userDirectory + "fileList")

    # read list of terms (name of the columns of the document-term matrix)
    termNames, termNamesIndex = utility.read_single_column_data(userDirectory + "out" + userID + ".Terms")

    clusterTerms = []
    clusterNames = []
    if firstTime == +1:#get users terms
        clusterNames = eval(form.getvalue('serverClusterName'))
        clusterTerms = eval(form.getvalue('serverData'))

    if firstTime == -1:#if it is the first time, get top 5 terms of each cluster from cmeans
        cntr, u, u0, d, jm, p, fpc = bestCmeans.cmeans(document_term_matrix, c=numberOfClusters, m=1.1, error=0.005, maxiter=50, init=None)
        for cluster in u:
            temp = []
            for i in range(0, cmeansWords):
                temp.append(termNames[cluster.argmax()])
                cluster[cluster.argmax()] = -1
            clusterTerms.append(temp)    

    #calculate centroid of selected terms
    termCentroids = np.zeros((len(clusterTerms), len(document_term_matrix)))
    for index, clusterTerm in enumerate(clusterTerms):
        center = np.zeros(len(document_term_matrix))
        for term in clusterTerm:
            center = center + document_term_matrix[:,termNamesIndex[term]]
        center = center / len(clusterTerm)
        termCentroids[index] = center

    #expand terms using Cosine distance over the column of document-term matrix
    termCentroidCosine = np.zeros((len(clusterTerms), len(termNames)))
    for index, centroid in enumerate(termCentroids):
        for termIndex in range(0, len(termNames)):
            termCentroidCosine[index, termIndex] = cosine(centroid, document_term_matrix[:,termIndex])

    termPercentile = termPercentileInit * len(termNames) / 100# upper bound for the number of terms of each cluster
    seedDocumentsTerms = np.zeros((len(clusterTerms), len(termNames)))
    # tempTermCentroidCosine = termCentroidCosine
    tempTermCentroidCosine = np.zeros((len(clusterTerms), len(termNames)))
    tempTermCentroidCosine[:] = termCentroidCosine
    for index, center in enumerate(tempTermCentroidCosine):
        average = np.average(center)
        minDistance = center.min()
        counter = 0
        while minDistance < average:
            seedDocumentsTerms[index, center.argmin()] = center.min()
            counter += 1
            if counter > termPercentile:
                break
            minDistance = center.min()
            center[center.argmin()] = 2

    #select documents related to the selected terms and calculate the centroid of documents
    seedDocumentsTermsCosine = np.zeros((len(clusterTerms), len(documentNames)))
    for index, centroid in enumerate(seedDocumentsTerms):
        for document_index in range(0, len(documentNames)):
            seedDocumentsTermsCosine[index, document_index] = cosine(centroid, document_term_matrix[document_index,:])

    documentPercentile = documentPercentileInit * len(documentNames) / 100# upper bound for the number of terms of each cluster
    seedDocuments = np.zeros((len(clusterTerms), len(termNames)))
    for index, center in enumerate(seedDocumentsTermsCosine):
        average = np.average(center)
        minDistance = center.min()
        counter = 0
        while minDistance < average:
            seedDocuments[index] = seedDocuments[index] + document_term_matrix[center.argmin(),:]
            counter += 1
            if counter > documentPercentile:
                break
            minDistance = center.min()
            center[center.argmin()] = 2
        seedDocuments[index] = seedDocuments[index] / counter

    #run kmeans
    clusterer = KMeans(n_clusters=numberOfClusters, init=seedDocuments, n_init=1)
    labels_pred = clusterer.fit_predict(document_term_matrix)

    #calculate average silhouette
    AVG_silhouette = metrics.silhouette_score(document_term_matrix, labels_pred, metric='cosine')

    #create documents of clusters list (list of assigned documents to each cluster)
    documentClustersHash = {}
    for index, label in enumerate(labels_pred):
        if not label in documentClustersHash:
            documentClustersHash[label] = documentNames[index]
        else:
            documentClustersHash[label] += "," + documentNames[index]

    documentClusters = ""
    for value in documentClustersHash.itervalues():
        documentClusters += value + "\n"
    documentClustersFile = open(userDirectory + "documentClusters",'w')
    documentClustersFile.write(documentClusters)
    documentClustersFile.close()

    documentClustersArray = []
    for value in documentClustersHash.itervalues():
        docs = value.split(',')
        tempArray = []
        for index, doc in enumerate(docs):
            tempArray.append(doc)
        documentClustersArray.append(tempArray)

    #create documents relatedness to each clusters (comparing the document vector with clusters centroid)
    documentMembers = "name"
    for i in range(len(documentClustersHash)):
        if len(clusterNames) > 0:
            documentMembers += "," + clusterNames[i]
        else:
            documentMembers += ",cluster" + str(i)
    for documentIndex, documentName in enumerate(documentNames):
        documentVector = document_term_matrix[documentIndex,:]
        documentMembers += "\n" + documentName
        for clusterIndex, clusterCenter in enumerate(clusterer.cluster_centers_):
            documentMembers += "," + str((1 - cosine(clusterCenter,documentVector))*100)
    documentMembersFile = open(userDirectory + "documentMembers", 'w')
    documentMembersFile.write(documentMembers)
    documentMembersFile.close()

    #create list of terms of clusters (list of assigned terms to each cluster - sorted) - cosine
    termClusters = ""
    termClustersArray = []
    tempTermCentroidCosine[:] = termCentroidCosine
    for index, center in enumerate(tempTermCentroidCosine):
        average = np.average(center)
        minDistance = center.min()
        termClusters += termNames[center.argmin()]
        counter = 0
        tempArray = []
        tempArray.append(termNames[center.argmin()])
        while minDistance < average:
            counter += 1
            if counter >= numberOfTermsOfCluster:
                break
            center[center.argmin()] = 2
            termClusters += "," + termNames[center.argmin()]
            tempArray.append(termNames[center.argmin()])
            minDistance = center.min()
        termClusters += "\n"
        termClustersArray.append(tempArray)
    termClustersFile = open(userDirectory + "termClusters", 'w')
    termClustersFile.write(termClusters)
    termClustersFile.close()

    #create terms relatedness to each clusters (comparing the centroid of terms)
    termMembers = "name"
    for i in range(len(documentClustersHash)):
        if len(clusterNames) > 0:
            termMembers += "," + clusterNames[i]
        else:
            termMembers += ",cluster" + str(i)
    for termIndex, termName in enumerate(termNames):
        termMembers += "\n" + termName
        for index, center in enumerate(termCentroidCosine):
            termMembers += "," + str((1 - center[termIndex])*100)
    termMembersFile = open(userDirectory + "termMembers", 'w')
    termMembersFile.write(termMembers)
    termMembersFile.close()

    #send data to the Visualization modules
    print "Content-type:application/json\r\n\r\n"
    # print json.dumps({'status': 'test','testMSG': json.dumps(testMSG)})
    print json.dumps({'status': 'success','termClusters':json.dumps(termClustersArray), 'documentClusters':json.dumps(documentClustersArray), 'silhouette':json.dumps(AVG_silhouette)})
except Exception as e:
    exc_type, exc_obj, exc_tb = sys.exc_info()
    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
    print "Content-type:application/json\r\n\r\n"
    print json.dumps({'status':'error', 'except':json.dumps(str(e) + " Error line:" + str(exc_tb.tb_lineno) + " Error type:" + str(exc_type) + " File name:" + fname)})