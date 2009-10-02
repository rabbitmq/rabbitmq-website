# Note: deploy tasks will use current shell username. To override, set
# the variable RSH_USER, e.g.:
#
# $ make deploy-stage RSH_USER=chris
#

TARGET_DIR=target
SRC_XML=site
SRC_XSL=site
PYTHON=/usr/bin/python

SOURCES=$(wildcard $(SRC_XML)/*.xml)

TARGETS=$(patsubst $(SRC_XML)/%.xml,$(TARGET_DIR)/%.html,$(SOURCES)) $(TARGET_DIR)/news.atom

all: test

test: init $(TARGETS)
	$(PYTHON) webserver.py target

init:
	mkdir -p $(TARGET_DIR)
	cp -R site/* $(TARGET_DIR)

$(TARGET_DIR)/%.html: $(SRC_XML)/%.xml $(SRC_XSL)/page.xsl ${SRC_XML}/rabbit.ent
	xsltproc --novalid $(SRC_XSL)/page.xsl $< > $@

clean:
	rm -rf $(TARGET_DIR)

