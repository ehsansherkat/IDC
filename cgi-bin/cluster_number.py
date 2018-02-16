#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat - 2016
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_samples, silhouette_score
import numpy as np
def median(lst):
    return np.median(numpy.array(lst))

def number_of_clusters(array):
    max_sil = 0
    max_sil_index = 2
    above_avg = 0
    above_avg_index = 2
    n_clr_above_avg = 0
    n_clr_above_avg_index = 2
    alpha = 1.1
    betta = 1.0  
    gamma = 0.6
    tetta = 1.0 

    silhouette_avg_array = []
    cv_array = []
    cls_abv_array = []
    abv_avg_array = []

    for n_clusters in range(2, 30):
        clusterer = KMeans(n_clusters=n_clusters, random_state=10, init='k-means++')
        cluster_labels = clusterer.fit_predict(array)
        silhouette_avg = silhouette_score(array, cluster_labels, metric='cosine')
        sample_silhouette_values = silhouette_samples(array, cluster_labels)

        abv_avg = 0.0
        n_c_a_avg = 0.0
        cls_with_avg = 0.0
        cls_with_avg_array = []
        silhouette_avg_array.append(silhouette_avg)
        for i in range(n_clusters):
            l = sample_silhouette_values[cluster_labels == i]
            avg = reduce(lambda x, y: x + y, l) / len(l) * 1.0
            cls_with_avg += len(l)
            cls_with_avg_array.append(len(l))

            if avg > silhouette_avg:
                n_c_a_avg += 1
            for sil in l:
                if sil >= silhouette_avg:
                    abv_avg += 1
        cv = np.std(cls_with_avg_array)/cls_with_avg/n_clusters #Coefficient of Variation
        cv_array.append(cv)
        cls_abv_array.append(n_c_a_avg / n_clusters)
        abv_avg_array.append(above_avg / len(array))

        if silhouette_avg > max_sil:
            max_sil = silhouette_avg
            max_sil_index = n_clusters   

        if n_c_a_avg > n_clr_above_avg:
            n_clr_above_avg = n_c_a_avg
            n_clr_above_avg_index = n_clusters

        if abv_avg > above_avg:
            above_avg = abv_avg
            above_avg_index = n_clusters

    max_score = 0
    max_score_index = 2
    for i in range(len(silhouette_avg_array)):
        if cls_abv_array[i] == 0:
            score = 0
        else:
            score = alpha * (silhouette_avg_array[i] / max_sil) + gamma * abv_avg_array[i] + tetta * cv_array[i]
            # score = alpha * (silhouette_avg_array[i] / max_sil) + betta * cls_abv_array[i] + gamma * abv_avg_array[i] + tetta * cv_array[i]
        if score > max_score:
            max_score = score
            max_score_index = i + 2
    return max_score_index