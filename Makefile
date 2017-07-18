
#RESOURCE_URL = "//dev/jgantt"
RESOURCE_URL = "/download/resources/hvqzao.jgantt:jgantt-static/data"
FILTER_OUT = "__"

.PHONY:	all plugin standalone clean

all:	standalone plugin

version:	index.html bookmarklet.js style.css stage.js logic.js helper.js
	./bin/bump.py $@

plugin:	standalone jira-jgantt-plugin/src/main/resources/data jira-jgantt-plugin/src/main/resources/data/dhtmlxgantt.css jira-jgantt-plugin/src/main/resources/data/dhtmlxgantt.js jira-jgantt-plugin/src/main/resources/data/favicon.png jira-jgantt-plugin/src/main/resources/data/index.html jira-jgantt-plugin/src/main/resources/data/loading.css jira-jgantt-plugin/src/main/resources/data/logic.js jira-jgantt-plugin/src/main/resources/data/stage.js jira-jgantt-plugin/src/main/resources/data/style.css jira-jgantt-plugin/src/main/resources/data/zepto.min.js jira-jgantt-plugin/src/main/resources/js jira-jgantt-plugin/src/main/resources/js/helper.js

jira-jgantt-plugin/src/main/resources/data:
	mkdir -p $@

jira-jgantt-plugin/src/main/resources/data/dhtmlxgantt.css:	build/dhtmlxgantt.css
	cp $< $@

jira-jgantt-plugin/src/main/resources/data/dhtmlxgantt.js:	build/dhtmlxgantt.js
	cp $< $@

jira-jgantt-plugin/src/main/resources/data/favicon.png:	build/favicon.png
	cp $< $@

jira-jgantt-plugin/src/main/resources/data/index.html:	build/index.html
	cp $< $@

jira-jgantt-plugin/src/main/resources/data/loading.css:	build/loading.css
	cp $< $@

jira-jgantt-plugin/src/main/resources/data/logic.js:	build/logic.js
	cp $< $@

jira-jgantt-plugin/src/main/resources/data/stage.js:	build/stage.js
	cp $< $@

jira-jgantt-plugin/src/main/resources/data/style.css:	build/style.css
	cp $< $@

jira-jgantt-plugin/src/main/resources/data/zepto.min.js:	build/zepto.min.js
	cp $< $@

jira-jgantt-plugin/src/main/resources/js:
	mkdir -p $@

jira-jgantt-plugin/src/main/resources/js/helper.js:	helper/helper.js
	cp $< $@

standalone:	build version build/loading.css build/index.html build/dhtmlxgantt.js build/dhtmlxgantt.css build/zepto.min.js build/style.css build/stage.js build/logic.js build/favicon.png helper helper/helper.js

build:	
	mkdir -p $@

build/loading.css:	loading.css
	@#cp $< $@
	yui-compressor $< -o $@

build/index.html:	index.html bookmarklet.js
	./bin/jsew.py -p closure-compiler -p './bin/forward.py -r RESOURCE_URL ${RESOURCE_URL} VERSION version' -p './bin/invert.py -r RESOURCE_URL ${RESOURCE_URL} -q BOOKMARKLET index.html' -o $@ bookmarklet.js

build/dhtmlxgantt.js:	dhtmlxgantt.js lib/dhtmlx/codebase/dhtmlxgantt.js lib/dhtmlx/codebase/ext/dhtmlxgantt_tooltip.js
	./bin/jsew.py -o $@ dhtmlxgantt.js

build/dhtmlxgantt.css:	lib/dhtmlx/codebase/dhtmlxgantt.css 
	cp $< $@

build/zepto.min.js:	lib/zepto/zepto.min.js
	cp $< $@

build/style.css:	style.css
	@#cp $< $@
	yui-compressor $< -o $@

build/stage.js:	stage.js
	./bin/jsew.py -p closure-compiler -p './bin/forward.py -r RESOURCE_URL ${RESOURCE_URL} VERSION version' -o $@ $<

build/logic.js:	logic.js
	./bin/jsew.py -p closure-compiler -p './bin/forward.py -r RESOURCE_URL ${RESOURCE_URL} --replace FILTER_OUT ${FILTER_OUT} VERSION version' -o $@ $<

build/favicon.png:	jgantt.png
	cp $< $@

helper:
	mkdir -p $@

helper/helper.js:	helper.js
	./bin/jsew.py -p closure-compiler -p './bin/forward.py -r RESOURCE_URL ${RESOURCE_URL} VERSION version' -o $@ $<

clean:
	for i in loading.css index.html dhtmlxgantt.js dhtmlxgantt.css zepto.min.js style.css stage.js logic.js favicon.png ; do rm build/$$i >/dev/null 2>&1 || true ; done
	for i in helper.js ; do rm helper/$$i >/dev/null 2>&1 || true ; done
	rm -rf jira-jgantt-plugin/src/main/resources/data/ >/dev/null 2>&1 || true
	rm -rf jira-jgantt-plugin/src/main/resources/js/ >/dev/null 2>&1 || true

