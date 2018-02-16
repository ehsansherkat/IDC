#!/users/grad/sherkat/anaconda2/bin/python
# Author: Ehsan Sherkat - 2016
import sys, os
import stat
import bhtsne

# b = open("a",'r').read().replace(',', '\t')

# os.mknod("/users/grad/sherkat/public_html/IC2/users/ehsan/tsneNew", 0777)
# os.system("cat /users/grad/sherkat/public_html/IC2/users/ehsan/outehsan.Matrix | tr ',' '\t' |  ./bhtsne.py -d 2 -p 0.18 -o /users/grad/sherkat/public_html/IC2/users/ehsan/tsneNew")

bhtsne.main(['./bhtsne.py', '-i', '/users/grad/sherkat/public_html/IC2/users/ehsan/outehsan.Matrix', '-v', '-d', '2', '-p', '18', '-o', '/users/grad/sherkat/public_html/IC2/users/ehsan/tsneNew2'])# add replace(',','\t') in bgtsne.py



