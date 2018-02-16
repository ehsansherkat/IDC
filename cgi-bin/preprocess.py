#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat - 2016
import sys, os
import re
import unicodedata
import string
from nltk.stem.wordnet import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import NMF, LatentDirichletAllocation
from time import time
import collections
import cgi, cgitb
import json
import utility
from sklearn.manifold import TSNE
import numpy as np
import cluster_number
from scipy.spatial.distance import pdist
from scipy.spatial.distance import squareform
import bhtsne

try:
    cgitb.enable()
    form = cgi.FieldStorage()

    userDirectory = eval(form.getvalue('userDirectory'))
    userID = eval(form.getvalue('userID'))
    onlyEnglish = eval(form.getvalue('onlyEnglish'))
    numbers = eval(form.getvalue('numbers'))
    lematizer = eval(form.getvalue('lematizer'))
    bigram = eval(form.getvalue('bigram'))
    clusteringMethod = eval(form.getvalue('clusteringMethod'))
    perplexityNew  = eval(form.getvalue('perplexityNew'))

    stopwordsPath = "stopwords.txt"

    # userDirectory = "/home/ehsan/Desktop/data/"#law
    # userID = "test"
    # onlyEnglish = "no" # if true, none english characters will be replaced with english one
    # numbers = "yes" # if true numbers will be removed
    # lematizer = "no" # if true the text will be lemmatized based on wordnet
    # bigram = "no" # if true, bigrams and unigrams will be in term document matrix
    # stopwordsPath = "/home/ehsan/Desktop/stopwords.txt"

    ngram = 1
    if bigram == "yes":
        ngram = 2

    dirFileList = os.listdir(userDirectory)
    dirFileList.sort()
    fileList = list() # list of files (the order is also used for document-term matrix)
    stopwords = list()
    allWords = {}
    corpus = list() # the clean text of documents. Each documents is in a single line

    #get stopwords list
    stopwordFile = open(stopwordsPath, 'r')
    for line in stopwordFile:
        line = line.replace('\r','').replace('\n','')
        stopwords.append(line)

    def cleanText(text, onlyEnglish, numbers, lematizer):
        """
        prepare the clean text as following:
        1) remove stopwords
        2) remove punctuations
        3) lower case
        4) remove none english chars
        5) Remove new line, Tab and double spaces
        6) Remove numbers
        7) Lematizer (wordnet based)
        8) remove terms less than 2 chars in length
        :param text:
        :param onlyEnglish: if true none english alphabet will be replaced with english ones
        :param numbers: if ture numbers will be removed
        :return:
        """
        text = text.translate(string.maketrans(string.punctuation, ' ' * len(string.punctuation)))  # Remove Punctuations
        text = text.lower()  # Lower case
 
        if onlyEnglish == "yes":#remove none english chars
            text = unicodedata.normalize('NFKD', unicode(text, 'utf-8')).encode('ascii', 'ignore')
        if numbers == "yes": # remove numbers
            text = re.sub(r'[0-9]' , "", text)
        text = re.sub('\s+', ' ', text).strip()  # Remove new line, Tab and double spaces
        if lematizer == "yes":#lematixer
            temp = ""
            for term in text.split(' '):
                temp += WordNetLemmatizer().lemmatize(term.encode('ISO-8859-1')) + ' '
            text = re.sub('\s+', ' ', temp).strip()

        # remove terms less than 2 chars in length
        text = re.sub(r'\b.{2}\b', ' ', text).strip()
        # remove stopwords (it will be removed in count and tfidf vectorizor)
        # for sword in stopwords:
        #     text = re.sub(r'\b%s\b' % sword, "", text)  # word boundary
        # text = re.sub('\s+', ' ', text).strip()  # Remove new line, Tab and double spaces
        # text = unicode(text, errors='replace') # for encoding errors
        return text

    # create corpus
    t0 = time()
    for file in dirFileList:
        if file.endswith('.txt'):
            documentFile = open(userDirectory + file, 'r')
            documentText = ""
            for line in documentFile:
                documentText += " " + cleanText(line, onlyEnglish, numbers, lematizer)
            documentText = re.sub('\s+', ' ', documentText).strip()  # Remove new line, Tab and double spaces
            #check the size of file
            if documentText != "":
                fileList.append(file)
                corpus.append(documentText)
    # print "Content-type:application/json\r\n\r\n"
    # print json.dumps({'status':'progress', 'message':json.dumps(str("Corpus created in %0.3fs." % (time() - t0)))})

    def print_top_words(model, feature_names):
        for topic_idx, topic in enumerate(model.components_):
            mean = topic.mean()
            temp = ""
            for i in topic.argsort()[::-1]:
                if topic[i] > mean:
                    allWords[feature_names[i]] = 0
                    #print
            #         if temp == "":
            #             temp += (feature_names[i] + " " + str(topic[i]))
            #         else:
            #             temp += ("," + feature_names[i] + " " + str(topic[i]))
            # print temp


    #get tfidf
    t0 = time()
    tfidf_vectorizer = TfidfVectorizer(ngram_range=(1, ngram), min_df=2, stop_words=stopwords)
    tfidf = tfidf_vectorizer.fit_transform(corpus)
    tfidf_feature_names = tfidf_vectorizer.get_feature_names()
    tfidf_feature_names_hashmap = {}

    # tfidf feature names hashmap
    for i in range(0, len(tfidf_feature_names)):
        tfidf_feature_names_hashmap[tfidf_feature_names[i]] = i

    #filter based on the mean tf/idf
    tfidf_mean = tfidf.mean(0).mean()
    words_tfidf = tfidf.mean(0)
    for index, item in enumerate(np.nditer(words_tfidf)):
        if item > tfidf_mean:
            allWords[tfidf_feature_names[index]] = 0

    # #NMF over all corpus
    # nmf = NMF(n_components=1, random_state=1, alpha=.1, l1_ratio=.5, init="nndsvd").fit(tfidf)
    # print_top_words(nmf, tfidf_feature_names)

    # #NMF on single document
    # # for i in range(0, len(fileList)):
    # #     nmf = NMF(n_components=1, random_state=1, alpha=.1, l1_ratio=.5, init="nndsvd").fit(tfidf.getrow(i))
    # #     print_top_words(nmf, tfidf_feature_names)
    # # print "Content-type:application/json\r\n\r\n"
    # # print json.dumps({'status':'progress', 'message':json.dumps(str("NMF finished in %0.3fs." % (time() - t0)))})

    # #LDA gets tf
    # t0 = time()
    # tf_vectorizer = CountVectorizer(ngram_range=(1, ngram), min_df=2, analyzer='word', stop_words=stopwords)
    # tf = tf_vectorizer.fit_transform(corpus)
    # tf_feature_names = tf_vectorizer.get_feature_names()

    # #LDA over all corpus
    # lda = LatentDirichletAllocation(n_topics=1, max_iter=5,
    #                                     learning_method='online', learning_offset=50.,
    #                                     random_state=0).fit(tf)
    # print_top_words(lda, tf_feature_names)

    # # #LDA on single document (Not right now)
    # # for i in range(0, len(fileList)):
    # #     lda = LatentDirichletAllocation(n_topics=1, max_iter=5,
    # #                                     learning_method='online', learning_offset=50.,
    # #                                     random_state=0).fit(tf.getrow(i))
    # #     print_top_words(lda, tf_feature_names)
    # # # print "Content-type:application/json\r\n\r\n"
    # # # print json.dumps({'status':'progress', 'message':json.dumps(str("LDA finished in %0.3fs." % (time() - t0)))})

    allWordsSorted = collections.OrderedDict(sorted(allWords.items()))

    #create document term matrix (out)
    document_term_matrix = ""
    for i in range(0, len(fileList)):
        line = ""
        tfidf_hashmap = {}
        for col in tfidf.getrow(i).nonzero()[1]:
            if tfidf_feature_names[col] in allWordsSorted:
                tfidf_hashmap[col] = tfidf[i, col]

        for word, score in allWordsSorted.iteritems():
            word_index = tfidf_feature_names_hashmap.get(word)
            if tfidf_feature_names_hashmap.get(word) in tfidf_hashmap:
                line += str(tfidf_hashmap.get(word_index)) + ","
            else:
                line += "0.0,"
        line = line[0:line.rindex(',')]
        document_term_matrix += line + '\n'

    #write document term matrix to file
    document_term_matrix_file = open(userDirectory + "out" + userID + ".Matrix", 'w')
    document_term_matrix_file.write(document_term_matrix)
    document_term_matrix_file.close()

    #create document-document distance file
    document_term_matrix = np.asarray(utility.read_term_document_matrix(userDirectory + "out" + userID + ".Matrix"), dtype=float)
    documents_distance = squareform(pdist(document_term_matrix, 'cosine'))
    documents_distance_path = userDirectory+"documentDistance"
    documents_distance_file = open(documents_distance_path, "wb")
    for i in range(len(document_term_matrix)):
        for j in range(len(document_term_matrix)):
            if j == 0:
                documents_distance_file.write(str(documents_distance[i][j]))
            else:
                documents_distance_file.write("," + str(documents_distance[i][j]))
        documents_distance_file.write("\n")
    documents_distance_file.close()

    #write all words
    allwords_file = open(userDirectory + "out" + userID + ".Terms", 'w')
    for word, score in allWordsSorted.iteritems():
        allwords_file.write(word.encode('utf-8') + '\n')
    allwords_file.close()

    #write file list
    fileList_file = open(userDirectory + "fileList", 'w')
    for fileName in fileList:
        fileList_file.write(unicode(fileName, errors='ignore') + '\n')
    fileList_file.close()

    #write spec file (reomve it later)
    spec_file = open(userDirectory + "out" + userID + ".Spec", 'w')
    spec_file.write(str(len(fileList))+'\n')
    spec_file.write(str(len(allWordsSorted))+'\n')
    spec_file.close()

    # run tsne
    tsneFile = userDirectory + "tsne"
    # # os.system("cat "+ userDirectory + "out" + userID + ".Matrix | tr ',' '\t' | ./bhtsne.py -d 2 -p "+perplexityNew+" -o "+ tsneFile) 
    # for file permision error use next line instead, 
    # add replace(',','\t') in bgtsne.py and remove print
    bhtsne.main(['./bhtsne.py', '-i', userDirectory + 'out' + userID + '.Matrix', '-v', '-d', '2', '-p', perplexityNew, '-o', tsneFile])

    #sklearn tsne
    # array = np.asarray(utility.read_term_document_matrix(userDirectory + "out" + userID + ".Matrix"))
    # n_components = 2
    # TSNE_model = TSNE(n_components=2, perplexity=perplexityNew, method='barnes_hut')
    # TSNE_result = TSNE_model.fit_transform(array)
    # TSNE_string = ""
    # for i in range(0, len(TSNE_result)):
    #     for j in range(0, n_components):
    #         if j == 0:
    #             TSNE_string += str(repr(TSNE_result[i, j]))
    #         else:
    #             TSNE_string += '\t' + str(repr(TSNE_result[i, j]))
    #     TSNE_string += "\n"
    # TSNE_file = open(tsneFile, 'w')
    # TSNE_file.write(TSNE_string)
    # TSNE_file.close()

    #save perplexity number
    perplexity_File = open(userDirectory + "perplexity", 'w')
    perplexity_File.write(perplexityNew)
    perplexity_File.close()

    # save clustering method name
    clusteringMethod_File = open(userDirectory + "clusteringMethod", 'w')
    clusteringMethod_File.write(clusteringMethod)
    clusteringMethod_File.close()

    # suggest number of clusters (X-Means did not worked), now using silhouette
    tsne_array = np.asarray(utility.read_TSNE(userDirectory + "tsne"))
    CN = cluster_number.number_of_clusters(tsne_array)
    CN_file = open(userDirectory + "clusters.number", 'w')
    CN_file.write(str(CN)+'\n')
    CN_file.close()

    # pp stauts
    pp_File = open(userDirectory + "pp.status", 'w')
    pp_File.write("no")
    pp_File.close()

    print "Content-type:application/json\r\n\r\n"
    print json.dumps({'status':'finish'})
# except Exception, e:
#     print "Content-type:application/json\r\n\r\n"
#     print json.dumps({'status':'error', 'except':json.dumps(str(e))})
except Exception as e:
    exc_type, exc_obj, exc_tb = sys.exc_info()
    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
    print "Content-type:application/json\r\n\r\n"
    print json.dumps({'status':'error', 'except':json.dumps(str(e) + " Error line:" + str(exc_tb.tb_lineno) + " Error type:" + str(exc_type) + " File name:" + fname)})