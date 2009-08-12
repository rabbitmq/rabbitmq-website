# Note: deploy tasks will use current shell username. To override, set
# the variable RSH_USER, e.g.:
#
# $ make deploy-stage RSH_USER=chris
#

SRC_DIR=site
TARGET_DIR=site

SOURCES=$($(SRC_DIR)/news.xml

TARGETS=$(TARGET_DIR)/news.atom

ifdef RSH_USER
	RSH_USER_PREFIX=$(RSH_USER)@
endif

# RSYNC_CMD=rsync -irvz --delete-after \
# 	--exclude-from=build-support/deploy-excludes.txt -e ssh $(TARGET_DIR)/ 

all: init $(TARGETS)

init:
#	mkdir -p $(TARGET_DIR)
#	cp -R site/* $(TARGET_DIR)

# $(TARGET_DIR)/%.html: $(SRC_XML)/%.xml $(SRC_XSL)/page.xsl ${SRC_XML}/rabbit.ent
#	xsltproc --novalid $(SRC_XSL)/page.xsl $< > $@

$(TARGET_DIR)/%.atom: $(SRC_DIR)/%.xml $(SRC_DIR)/feed-atom.xsl
	xsltproc --novalid --stringparam updated '$(shell date +"%FT%T%z")' $(SRC_DIR)/feed-atom.xsl $< > $@

clean:
	rm $(TARGET_DIR)/news.atom

release:
#	@build-support/release.sh


