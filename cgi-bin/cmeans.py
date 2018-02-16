################################################################################
# Peach - Computational Intelligence for Python
# Jose Alexandre Nalon
#
# This file: fuzzy/cmeans.py
# Fuzzy C-Means algorithm
################################################################################

# Doc string, reStructuredText formatted:
__doc__ = """
Fuzzy C-Means

Fuzzy C-Means is a clustering algorithm based on fuzzy logic.

This package implements the fuzzy c-means algorithm for clustering and
classification. This algorithm is very simple, yet very efficient. From a
training set and an initial condition which gives the membership values of each
example in the training set to the clusters, it converges very fastly to crisper
sets.

The initial conditions, ie, the starting membership, must follow some rules.
Please, refer to any bibliography about the subject to see why. Those rules are:
no example might have membership 1 in every class, and the sum of the membership
of every component must be equal to 1. This means that the initial condition is
a fuzzy partition of the universe.
"""


################################################################################
import numpy
import numbers
from numpy import dot, array, sum, zeros, outer, any
from scipy.spatial.distance import cdist

################################################################################
# Fuzzy C-Means class
################################################################################
class FuzzyCMeans(object):
    
    
    def __init__(self, training_set, k, m=2.0, distance='euclidean', userU = -1, imax = 25, emax = 0.01):
        
        self.__x = training_set
        self.__k = k
        self.m = m
        self.dist = distance
        self.userU = userU
	self.imax = imax
	self.emax = emax
       
        
        if (isinstance(userU, numbers.Number)):
            self.__mu = self.initializeFCM()
        else:
            _, N = userU.shape
            index = numpy.where(userU > 0);
            for j in range(index[1].size):
                userU[:, index[1][j]] = userU[:, index[1][j]]/sum(userU[:, index[1][j]])
            self.__mu = userU
            
        self.__obj = 0
        
	#self.__c, self.__obj = self.centers()


    def __getc(self):
        return self.__c
    
    def __setc(self, c):
        self.__c = array(c).reshape(self.__c.shape)
        
    c = property(__getc, __setc)
    

    def __getmu(self):
        return self.__mu
    
    mu = property(__getmu, None)
    

    def __getx(self):
        return self.__x
    
    x = property(__getx, None)
    
    def initializeFCM(self):
        
        x = self.__x
        
        N, _ = x.shape
        
        U = numpy.random.random((self.__k, N))
        
        for j in range(N):
            U[:,j] = U[:,j]/sum(U[:,j])
            
        return U
    
    def centers(self):
        
        x = self.__x
        
        _, M = x.shape
        
        mm = self.__mu ** self.m
        
        tempRep = numpy.dot(numpy.ones((M,1)), numpy.asanyarray([numpy.sum(mm, axis=1)]))
        
        
        c = dot(mm, self.__x) / tempRep.T
        
        
        self.__c = c
        
        
        
        tempDist = cdist(c, x, self.dist) #self.dist 'cosine'
        dist = tempDist**2.0
        obj = numpy.sum((dist**2.0)*mm)
        self.__obj = obj
        
        return self.__c, self.__obj

    def membership(self):
        
        x = self.__x
        c = self.__c
        N, _ = x.shape
        k = self.__k
        r = numpy.zeros((k, N))      # r will become mu
	tempDist = cdist(c, x, self.dist) #self.dist 'cosine'
        dist = tempDist**2.0
        temp = dist**(-2.0/(self.m-1))
        tempSum = numpy.asanyarray([numpy.sum(temp, axis=0)])
        r = temp/(numpy.dot(numpy.ones((k,1)), tempSum))
        
        self.__mu = r
        return self.__mu

    def step(self):
        '''
        This method runs one step of the algorithm. It might be useful to track
        the changes in the parameters.

        :Returns:
          The norm of the change in the membership values of the examples. It
          can be used to track convergence and as an estimate of the error.
        '''
        #old = self.__mu
        old = self.__obj
        self.centers()
        self.membership()
        return numpy.abs(self.__obj - old)
        #return sum(self.__mu - old)**2.

    def __call__(self):
        '''
        The ``__call__`` interface is used to run the algorithm until
        convergence is found.

        :Parameters:
          emax
            Specifies the maximum error admitted in the execution of the
            algorithm. It defaults to 1.e-10. The error is tracked according to
            the norm returned by the ``step()`` method.
          imax
            Specifies the maximum number of iterations admitted in the execution
            of the algorithm. It defaults to 20.

        :Returns:
          An array containing, at each line, the vectors representing the
          centers of the clustered regions.
        '''
	error = 1.0
	emax = self.emax
	imax = self.imax

        i = 0
        while error > emax and i < imax:
            error = self.step()
            
            if not(isinstance(self.userU, numbers.Number)):
                mu = self.__mu
                k, N = mu.shape
                index = numpy.where(self.userU > 0);
                for j in range(index[1].size):
                    mu[:,index[1][j]] = 0
                for j in range(index[1].size):
                    mu[index[0][j],index[1][j]] = self.userU[index[0][j],index[1][j]]
                for j in range(index[1].size):
                    mu[:, index[1][j]] = mu[:, index[1][j]]/sum(mu[:, index[1][j]])
                self.__mu = mu
            #print "obj: ", self.__obj
            i = i + 1
        return self.c


################################################################################
# Test.
if __name__ == "__main__":
    pass
