#!/usr/bin/env python

import sys, os

if len(sys.argv[1:]) < 1:
    sys.stderr.write('Usage: '+sys.argv[0]+' <file>\n')
    sys.exit(1)
build = sys.argv[1]
if os.path.isfile(build):
    ver = str(int(open(build).read())+1)
else:
    ver = '1'
with open(build,'w') as f:
    f.write(ver)

