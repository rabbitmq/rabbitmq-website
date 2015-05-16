# rabbitmq.com

This repository contains source code for rabbitmq.com content.




## Branches

There are three noteworthy and long-lived named branches in this
repository:

Branch  | Description
--------|------------------------------------------------------------------------
live:   | The current version of the website. This must represent whatever's
        | deployed to www.rabbitmq.com.
master: | Changes to the website that will correspond to the next release of
        | rabbitmq. This gets merged into live when the release occurs. Normally
        | this should represent whatever's deployed to next.rabbitmq.com.
stable: | Like "master", but for changes that will correspond to the next bugfix
        | release.
stage:  | The staging version of the website. Only relevant while a release is
        | being prepared, it acts to snapshot master in case changes are made
        | to that during the release process.

## Development environment

### Running a Local Copy

The site requires Python and Python XSLT support for development, and
assumes Apache is used for deployment. For simple development on Debian-based
systems, it is enough to run

    sudo apt-get install python-lxml python-markdown python-pygments

to install required dependencies and then

    ./driver.py [www|next|previous]

from the base of the repository to run a local version of the site, with page
regeneration on reload. The site will be available at
[http://localhost:8191](http://localhost:8191/). Note that using driver.py the site will not
feature:

 * Any release artefacts (this includes the web versions of the man pages)
 * The blog

The script code/diagrams.py generates PNGs from graph descriptions
embedded in files. Generally you don't need to run this, since we
check the PNGs in, but if you do want to use it, you'll also need dot:

    sudo apt-get install graphviz

### On OS X

Using the system Python, you can install the necessary parts with:

    sudo easy_install pip
    sudo pip install lxml
    sudo pip install markdown

### Modes

The website also has the concept of being deployed in modes. The three
modes are:

Mode     | Description
---------|------------------------------------------------------------------------
www      | This is the "normal" mode. You would normally deploy from the live
         | branch with this mode.
next     | This is the mode for next.rabbitmq.com. This mode has the home page
         | and download page chopped down, no blog or search, and a watermark.
         | You would normally deploy from the master branch with this mode.
previous | For previous.rabbitmq.com. The website is reduced in the same way
         | as "next", but this mode is meant for previous releases rather than
         | future releases.

You determine which mode you are using with an argument to the driver
or deploy scripts. Modes are implemented with the `<x:modal/>` tag and
the `$page-mode` variable in XSLT.


## Copyright and License

See [NOTICE](NOTICE) and [LICENSE](LICENSE).
