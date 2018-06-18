SHELL := bash# we want bash behaviour in all shell invocations

.DEFAULT_GOAL = help

PLATFORM := $(shell uname)
ifneq ($(PLATFORM),Darwin)
  $(error Only OS X is currently supported, please contribute support for your OS)
endif

export PATH := /usr/local/opt/libxslt/bin:$(PATH)
export LDFLAGS := "-L/usr/local/opt/libxslt/lib"
export CPPFLAGS := "-I/usr/local/opt/libxslt/include"

PIPENV_BIN := $(realpath /usr/local/bin/pipenv)

TCP_PORT := 8191

### TARGETS ###
#

clean: ;

distclean: ;

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'

/usr/local/opt/libxslt:
	@brew install libxslt
libxslt: /usr/local/opt/libxslt/

/usr/local/bin/pyhon3:
	@brew install python
python3: /usr/local/bin/python3

"$(PIPENV_BIN)": python3
	@brew install pipenv
pipenv: $(PIPENV_BIN)

deps: libxslt pipenv
	@pipenv install

preview: deps ## Preview docs
	@pipenv run ./driver.py

browse: ## Open docs in browser
	@open http://localhost:$(TCP_PORT)
