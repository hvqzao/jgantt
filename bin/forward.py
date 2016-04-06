#!/usr/bin/env python

import sys

params = sys.argv[1:]

# forward replacements
replacements = []
replace_params = ['-r','--replace']
for i in replace_params:
    if i in params:
        index = params.index(i)
        replacements += [[params[index+1],params[index+2]]]
        for j in [params[index+2],params[index+1],i]:
            params.remove(j)

if len(params) < 2:
    sys.stderr.write('Usage: cat src-file | '+sys.argv[0]+' [-r|--replace <replace> <with>] <replace> <content-file>\n')
    sys.exit(1)

src = sys.stdin.read()
for i in replacements:
    src = src.replace(i[0],i[1])
old = params[0]
new = open(params[1]).read()
sys.stdout.write(src.replace(old, new))
