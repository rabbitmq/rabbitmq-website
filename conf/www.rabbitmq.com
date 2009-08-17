# Needed packages:
# libapache2-mod-python python-libxslt1

<VirtualHost *:80>
    ServerName www.rabbitmq.com
    ServerAlias stage.rabbitmq.com
    ServerAlias rabbitmq.misshelpful.lshift.net
    ServerAlias spork.lshift.net
    ServerAlias ladle.lshift.net
    ServerAlias ladle
    ServerAlias rabbitwww-stage.lshift.net
    ServerAlias rabbitwww.lshift.net
    ServerAdmin simon@lshift.net

    DocumentRoot /srv/www.rabbitmq.com/site/

    CustomLog /var/log/apache2/access-www.rabbitmq.com.log combined
    ErrorLog /var/log/apache2/error-www.rabbitmq.com.log

    <Location />
      SetHandler python-program
      PythonHandler xsl
      PythonDebug On
      PythonPath "['/srv/www.rabbitmq.com/code/'] + sys.path"
    </Location>

    <Location ~ "/(css|img|resources|static|favicon.ico|news.atom)">
        SetHandler None
    </Location>

    ServerSignature On
    <Directory /srv/www.rabbitmq.com/site>
  #      RewriteEngine on
#        RewriteRule ^election/?(.*)$  http://dev.lshift.net/paul/election/$1 [L,R=permanent]
 #       RewriteRule ^~([a-z]*)/?(.*)$  http://dev.lshift.net/$1/$2    [L,R=permanent]
    </Directory>

</VirtualHost>

<VirtualHost *:80>
    ServerName rabbitmq.com
    ServerAlias ww.rabbitmq.com
    ServerAlias www.rabbitmq.com

    Redirect permanent / http://www.rabbitmq.com/
</VirtualHost> 

