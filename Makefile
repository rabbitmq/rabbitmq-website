# Note: deploy tasks will use current shell username. To override, set
# the variable RSH_USER, e.g.:
#
# $ make deploy-stage RSH_USER=chris
#

TARGET_DIR=target
SRC_XML=src/xml
SRC_XSL=src/xsl
SOURCES=$(wildcard $(SRC_XML)/*.xml)

TARGETS=$(patsubst $(SRC_XML)/%.xml,$(TARGET_DIR)/%.html,$(SOURCES)) $(TARGET_DIR)/news.atom

ifdef RSH_USER
	RSH_USER_PREFIX=$(RSH_USER)@
endif

RSYNC_CMD=rsync -irvz --delete-after \
	--exclude-from=build-support/deploy-excludes.txt -e ssh $(TARGET_DIR)/ 

all: init $(TARGETS)

init:
	mkdir -p $(TARGET_DIR)
	cp -R src/static/* $(TARGET_DIR)

$(TARGET_DIR)/%.html: $(SRC_XML)/%.xml $(SRC_XSL)/page.xsl
	xsltproc --novalid $(SRC_XSL)/page.xsl $< > $@

$(TARGET_DIR)/%.atom: $(SRC_XML)/%.xml $(SRC_XSL)/feed.xsl
	xsltproc --novalid --stringparam updated '$(shell date +"%FT%T%z")' $(SRC_XSL)/feed.xsl $< > $@

clean:
	rm -rf $(TARGET_DIR)

release:
	@build-support/release.sh

deploy-stage: all
	$(RSYNC_CMD) $(RSH_USER_PREFIX)charlotte:/home/rabbitmq/stage/rabbitmq

deploy-live: all
	$(RSYNC_CMD) $(RSH_USER_PREFIX)charlotte:/home/rabbitmq/live/rabbitmq
