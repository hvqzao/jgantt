#!/usr/bin/env python

# The MIT License (MIT)
# 
# Copyright (c) 2015 Marcin Woloszyn (@hvqzao)
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

# Tested with Python 2.7.10 and 3.4.3

# This is part of my 6 years old library, refreshed and extended.

# I encourage anyone to rewrite this code to Node.JS.

usage = '''
jsew v2.01, Release date: Fri Aug 14 12:53:33 CEST 2015

.js (or .css or any other you like) files sewing tool. Adds "include" directive
with auto-indent handling making possible binding of all separate files to one.

Usage: ./jsew [options] <input-file>

Options:
  -o <out-file> --out <out-file>    - save to out-file. Will only try to overwrite
                                      when any component change date is more recent
                                      than the out-file
  -f            --force             - force out-file overwrite, regardless of
                                      component files change date
  -d <path>     --dir <path>        - same as cd <path> ; jsew [...]
  -p <cmd>      --postprocess <cmd> - pipe contents through given command
  -c <file>     --copy <file>       - prepend output with file(s) contents (after
                                      eventual postprocess). Will also be included
                                      in files index
  -b <file>     --before <file>     - same as -c, but before postprocess
  -a <file>     --after <file>      - same as -b, but append instead of prepending
  -i            --index             - index files and exit
  -v            --verbose           - verbose output of postprocess stderr, -vv
                                      for full verbosity
                --help              - show help

Examples:
  
  # process main.js and generate output to stdout
  jsew test/case-1/main.js
  
  # full verbose, parse main.js to script.js file, pipe output through uglify
  jsew -vv -p 'uglifyjs --screw-ie8 --lint' -o script.js test/case-1/main.js

  # list (index) component files which would be used for output generation
  jsew -i test/case-1/main.js
  
  # change directory, build output file from four separate compoents and uglify it
  jsew -d test/case-2 -p uglifyjs -b a.js -a c.js -c copy b.js

Rewrite me to Node.JS please.

'''

import os,sys,getopt,re,subprocess
if sys.version_info > (3,):
	buffer = memoryview

def usage_exit():
    sys.stderr.write(usage.lstrip())
    sys.exit(1)

def exit(error, help=False):
    sys.stderr.write('{}: {}\n'.format(os.path.basename(sys.argv[0]), error))
    if help:
        sys.stderr.write('For help use --help\n')
    sys.exit(1)

def info(mesg):
    sys.stderr.write('{}: {}\n'.format(os.path.basename(sys.argv[0]), mesg))

def process(directory, filename, indent='', contents='', index=[], copy=[], before=[], after=[], postprocess=[]):
    """ Recursively process input files, process \s*include('<file>'); directive """
    if directory:
        path = '{}/{}'.format(directory,filename)
    else:
        path = filename
    if not os.path.exists(path) or not os.access(path, os.R_OK):
        exit('Unable to read {}'.format(path))
    for before_file in before:
        if not os.path.exists(before_file) or not os.access(before_file, os.R_OK):
            exit('Unable to read {}'.format(before_file))
        contents += open(before_file).read()
        index += [before_file]
    index += [path]
    for line in open(path):
        results = list(filter(lambda x: x, [re.search(r'^(\s*)include\s*\(\'(.*)\'\);', line), re.search(r'^(\s*)include\s*\("(.*)"\);', line)]))
        if results:
            for res in results:
                new_indent, new_filename = res.groups()
                contents, index = process(directory, new_filename, indent+new_indent, contents, index)
        else:
            contents += '{}{}'.format(indent, line)
    for after_file in after:
        if not os.path.exists(after_file) or not os.access(after_file, os.R_OK):
            exit('Unable to read {}'.format(after_file))
        contents += open(after_file).read()
        index += [after_file]
    for command in postprocess:
        p = subprocess.Popen(command, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        contents, stderr = list(map(lambda x: x.decode(), p.communicate(input=buffer(contents.encode('utf-8')))))
        if verbose > 0 and stderr:
            sys.stderr.write(stderr)
    copy_contents = []
    for copy_file in copy:
        if not os.path.exists(copy_file) or not os.access(copy_file, os.R_OK):
            exit('Unable to read {}'.format(copy_file))
        copy_contents += [open(copy_file).read()]
        index = [copy_file]+index
    return '{}{}'.format(''.join(copy_contents), contents), index

def changed_files(out_file, indexed_files, verbose=0):
    """ Returns list of component files with more recent change date than out_file """
    out_file_mtime = os.path.getmtime(out_file)
    changed = list(filter(lambda x: out_file_mtime < os.path.getmtime(x), indexed_files))
    if verbose > 1 and changed:
        for changed_file in changed:
            info('{} is more recent than out-file.\n'.format(changed_file))
    return changed

def jsew(directory, filename, out_file, force=False, verbose=0, copy=[], before=[], after=[], postprocess=[]):
    """ Process and save to out file. Returns file save status """
    contents, indexed_files = process(directory, filename, copy=copy, before=before, after=after, postprocess=postprocess)
    changed = []
    out_file_exists = os.path.exists(out_file)
    if out_file_exists:
        changed = changed_files(out_file, indexed_files, verbose)
    if not out_file_exists or force or changed:
        with open(out_file,'w') as f:
            f.write(contents)
        if verbose > 1:
            info('{} saved.'.format(out_file))
        return True
    elif verbose > 1:
        info('{} skipped.'.format(out_file))
    return False

if __name__ == '__main__':
    try:
        opts, args = getopt.getopt(sys.argv[1:], 'o:fd:c:b:a:p:iv', ('out','force','dir','copy','before','after','postprocess','index','verbose','help',))
    except getopt.error as msg:
        usage_exit(msg)
    out_file = None
    force = False
    cwd = None
    copy = []
    before = []
    after = []
    postprocess = []
    index_only = False
    verbose = 0
    for o,a in opts:
        if o == '--help':
            usage_exit()
        elif o in ['-o','--out']:
            out_file = a
        elif o in ['-f','--force']:
            force = True
        elif o in ['-d','--dir']:
            cwd = a
        elif o in ['-c','--copy']:
            copy += [a]
        elif o in ['-b','--before']:
            before += [a]
        elif o in ['-a','--after']:
            after += [a]
        elif o in ['-p','--postprocess']:
            postprocess += [a]
        elif o in ['-i','--index']:
            index_only = True
        elif o in ['-v','--verbose']:
            verbose += 1
    if len(args) > 1:
        exit('Too many arguments!', help=True)
    elif len(args) < 1:
        exit('Input file parameter missing!', help=True)
    if cwd != None:
        if not os.path.exists(cwd):
            exit('Directory {} does not exist!'.format(path))
        os.chdir(cwd)
    directory = os.path.dirname(args[0])
    filename = os.path.basename(args[0])
    if index_only or out_file == None:
        contents, indexed_files = process(directory, filename, copy=copy, before=before, after=after, postprocess=postprocess)
        if index_only:
            for indexed_file in indexed_files:
                sys.stdout.write('{}\n'.format(indexed_file))
        else:
            sys.stdout.write(contents)
    else:
        sys.exit(int(not jsew(directory, filename, out_file, force, verbose, copy=copy, before=before, after=after, postprocess=postprocess)))
