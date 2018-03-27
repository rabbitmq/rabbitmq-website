# [rabbitmq.com](http://www.rabbitmq.com/)

This repository contains source code for [rabbitmq.com](http://www.rabbitmq.com/) content.

All changes that need to be deployed right away need to be committed to the `live` branch.

Changes which should be deployed when the next patch release (a.k.a. stable) of RabbitMQ ships should be committed to the `stable` branch.

Changes which should be deployed when the next 3.6.x patch release of RabbitMQ ships should be committed to the `3.6.x` branch.

Changes which should be deployed when the next minor release (a.k.a. master) of RabbitMQ ships should be committed to the `master` branch.

## Branches

There are a few noteworthy and long-lived named branches in this
repository:

Branch        | Description
:-------------|:--------------------
live          | The current version of the website. This must represent whatever's deployed to [www.rabbitmq.com](http://www.rabbitmq.com/).
stable        | Changes to the website that will correspond to the next point (maintenance) release of RabbitMQ. This gets merged into live when a 3.7.x release occurs.
3.6.x         | Same as stable but for RabbitMQ 3.6.x. This gets merged into live when a 3.6.x release occurs.
master        | Changes to the website that will correspond to the next minor release of RabbitMQ. Periodically deployed to [next.rabbitmq.com](http://next.rabbitmq.com/). This gets merged into stable and then live when a minor release occurs.


## Development environment

### Running a Local Copy

The site requires Python 3.6 at least and Python XSLT support for development, and
assumes Apache is used for deployment. You can use [pyenv](https://github.com/pyenv/pyenv)
to install the appropriate Python version without affecting the version(s) you alreay have
and use on your system. You can also use your OS native package manager, but be aware that those packages
are often out-of-date. For simple development on Debian-based systems, it is enough to run

```sh
sudo apt-get install python-lxml python-markdown python-pygments
```

to install required dependencies and then

```sh
./driver.py [www|next|previous]
```

from the base of the repository to run a local version of the site, with page
regeneration on reload. The site will be available at
[http://localhost:8191](http://localhost:8191/). Note that using [driver.py](https://github.com/rabbitmq/rabbitmq-website/blob/master/driver.py) the site will not
feature:

 * Any release artefacts (this includes the web versions of the man pages)
 * The blog

The script [diagrams.py](https://github.com/rabbitmq/rabbitmq-website/blob/master/code/diagrams.py) generates PNGs from graph descriptions
embedded in files. Generally you don't need to run this, since we
check the PNGs in, but if you do want to use it, you'll also need dot:

```sh
sudo apt-get install graphviz
```

If you want the `site/news.atom` feed generated, you can run the following command:

```sh
xsltproc --novalid site/feed-atom.xsl site/news.xml > site/news.atom
```

### On OS X

Using [Homebrew](http://brew.sh/), you can install the necessary parts with:

```sh
brew install python
pip install lxml markdown
```

Using the system Python, you can install the necessary parts with:

```sh
sudo easy_install pip
sudo pip install lxml markdown
```

### Modes

The website also has the concept of being deployed in modes. The three
modes are:

Mode     | Description
:--------|:------------
www      | This is the "normal" mode. You would normally deploy from the live branch with this mode.
next     | This is the mode for [next.rabbitmq.com](http://next.rabbitmq.com/). This mode has the home page and download page chopped down, no blog or search, and a watermark. You would normally deploy from the master branch with this mode.
previous | For [previous.rabbitmq.com](http://previous.rabbitmq.com/). The website is reduced in the same way as "next", but this mode is meant for previous releases rather than future releases.

You determine which mode you are using with an argument to the driver
or deploy scripts. Modes are implemented with the `<x:modal/>` tag and
the `$page-mode` variable in XSLT.


## Copyright and License

See [NOTICE](NOTICE) and [LICENSE](LICENSE).
