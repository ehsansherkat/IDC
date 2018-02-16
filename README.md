# Interactive Document Clustering Revisited: A Visual Analytics Approach
Document clustering is an efficient way to get insight into large text collections. Due to the personalized nature of document clustering, even the best fully automatic algorithms cannot create clusters that accurately reflect the user's perspectives. In this project, we propose a novel visual analytics system for interactive document clustering. We built our system on top of clustering algorithms that can adapt to user's feedback. First, the initial clustering is created based on the user-defined number of clusters and the selected clustering algorithm. Second, the clustering result is visualized to the user. A collection of coordinated visualization modules and document projection is designed to guide the user towards a better insight into the document collection and clusters. The user changes clusters and key-terms iteratively as a feedback to the clustering algorithm until the result is satisfactory. In key-term based interaction, the user assigns a set of key-terms to each target cluster to guide the clustering algorithm. A set of quantitative experiments, a use case, and a user study have been conducted to show the advantages of the approach for document analytics based on clustering. 

# Running the code
The code has been tested on Linux operating system. If you need to upload pdf documents, you need to have installed the following software.

pdftotext

The Apache web server configured to run python files is needed as a webserver. We recommend to use Anaconda distribution of python.

# Demo video
The demo video of the proposed system:
https://youtu.be/qbNJC4q-8jU

# Citation 
If you used the code please cite the following paper:
```
@misc{IUISherkat2018,
   Author      = {Ehsan Sherkat, Evangelos Milios, Rosane Minghim},
   Title       = {Interactive Document Clustering Revisited: A Visual Analytics Approach},
   Year        = {2018},
   link        = {http://iui.acm.org/2018/accepted_papers.html},
   Url         = {https://doi.org/10.1145/3172944.3172964},
   doi         = {10.1145/3172944.3172964},
   location    = {Tokyo, Japan},
   publisher   = {ACM},
   booktitle   = {IUI '18 Companion: Proceedings of the 23Rd International Conference on Intelligent User Interfaces Companion}
}
```

