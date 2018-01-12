.ONESHELL:# single shell invocation for all lines in a rule
.PHONY: run

.DEFAULT_GOAL = help

### TARGETS ###
#

clean: ;

distclean: ;

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'

run: ## Serve website from http://localhost:8191
	python2 ./driver.py
