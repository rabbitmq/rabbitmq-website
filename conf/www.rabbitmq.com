# Needed packages:
# libapache2-mod-python python-libxslt1

<VirtualHost *:80>

    Include sites-available/www.rabbitmq.com-common

</VirtualHost>

<VirtualHost *:80>
    ServerAdmin postmaster@rabbitmq.com
    ServerName rabbitmq.com
    ServerAlias ww.rabbitmq.com
    ServerAlias www.rabbitmq.org
    ServerAlias www.rabbitmq.net
    ServerAlias rabbitmq.org
    ServerAlias rabbitmq.net

    Redirect permanent / http://www.rabbitmq.com/
</VirtualHost>
