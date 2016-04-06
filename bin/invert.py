#!/usr/bin/env python

import sys

params = sys.argv[1:]

# forward quotes
quote_params = ['-q','--quotes']
quotes = False
for i in quote_params:
    if i in params:
        params.remove(i)
        quotes = True

# invert replacements
replacements = []
replace_params = ['-r','--replace']
for i in replace_params:
    if i in params:
        index = params.index(i)
        replacements += [[params[index+1],params[index+2]]]
        for j in [params[index+2],params[index+1],i]:
            params.remove(j)

if len(params) < 2:
    sys.stderr.write('Usage: cat input | '+sys.argv[0]+' [-r|--replace <replace> <with>] [-q|--quotes] <replace> <src-file>\n')
    sys.exit(1)

new = sys.stdin.read()
if quotes:
    new = new.replace('"','\'')
old = params[0]
src = open(params[1]).read()
for i in replacements:
    src = src.replace(i[0],i[1])
sys.stdout.write(src.replace(old, new))
