# [rabbitmq.com](https://www.rabbitmq.com/)

This repository contains source code for [rabbitmq.com](https://www.rabbitmq.com/) content.

All changes that need to be deployed right away need to be committed to the `live` branch.

Changes which should be deployed when the next patch release (a.k.a. stable) of RabbitMQ ships should be committed to the `stable` branch.

Changes which should be deployed when the next minor release (a.k.a. main) of RabbitMQ ships should be committed to the `main` branch.

## Branches

There are a few noteworthy and long-lived named branches in this
repository:

Branch         | Description
:--------------|:--------------------
`live`         | The current version of the website. This must represent whatever's deployed to [www.rabbitmq.com](https://www.rabbitmq.com/).
`stable`       | Changes to the website that will correspond to the next point (maintenance) release of RabbitMQ. This gets merged into live when a patch release occurs.
`main`         | Changes to the website that will correspond to the next minor release of RabbitMQ. Periodically deployed to [next.rabbitmq.com](http://next.rabbitmq.com/). This gets merged into stable and then live when a minor release occurs.


## Development environment

### Running a Local Copy

The site requires Python 3.6 or later, `lxml` and Markdown libraries for development. It also
assumes Apache 2.x is used for deployment. [pyenv](https://github.com/pyenv/pyenv)
can be used to install the appropriate Python version without affecting the system version(s).

When using OS native package managers be aware that Python packages
can be out-of-date.

#### On MacOS

On a recent MacOS version with [Homebrew](http://brew.sh/) it should be enough to run

```sh
make preview
```

to install the dependencies and run a local copy on [localhost:8191](http://localhost:8191)

It is also possible to install the dependencies manually:

```sh
brew install python
pip install lxml markdown
```

Using the system Python, dependencies must be installed differently:

```sh
sudo easy_install pip
sudo pip install lxml markdown
```

To run a local copy manually on [localhost:8191](http://localhost:8191), use:

```sh
./driver.py
```

To run a local copy of the "next" version of the site (usually only relevant for `main` and
documentation work for the next feature release):

```sh
./driver.py next
```

#### On Debian-based Linux

On Debian and Ubuntu dependencies can be installed via `apt`:

```sh
sudo apt-get install python3-lxml python3-markdown python3-pygments
```

To run a local copy manually on [localhost:8191](http://localhost:8191), use:

```sh
./driver.py [www|next|previous]
```

#### Run in a python virtual environment

Use [Python virtual environment](https://docs.python.org/3/library/venv.html) to avoid global libraries.

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install lxml markdown
./driver.py [www|next|previous]
```


#### Limitations of Local Copy

Note that when running a local copy the site will not feature:

 * Any release artefacts (such as Web versions of the man pages)
 * The blog


### Modes

The website also has the concept of being deployed in modes. The three
modes are:

Mode     | Description
:--------|:------------
www      | This is the "normal" mode. You would normally deploy from the live branch with this mode.
next     | This is the mode for [next.rabbitmq.com](http://next.rabbitmq.com/). This mode has the home page and download page chopped down, no blog or search, and a watermark. You would normally deploy from the main branch with this mode.
previous | For [previous.rabbitmq.com](http://previous.rabbitmq.com/). The website is reduced in the same way as "next", but this mode is meant for previous releases rather than future releases.

You determine which mode you are using with an argument to the driver
or deploy scripts. Modes are implemented with the `<x:modal/>` tag and
the `$page-mode` variable in XSLT.

### Tutorial Charts (Diagrams)

[diagrams.py](https://github.com/rabbitmq/rabbitmq-website/blob/main/code/diagrams.py) is a script that generates PNGs from graph descriptions
embedded in files. Generally, you don't need to run this, since the generated
PNGs are committed. To work on the diagrams please install Graphviz:

```sh
sudo apt-get install graphviz
```

### Generating the Atom Feed

To generate the `site/news.atom` feed, run the following command:

```sh
xsltproc --novalid site/feed-atom.xsl site/news.xml > site/news.atom
```


## Copyright and License

See [NOTICE](NOTICE) and [LICENSE](LICENSE).
