# Needed packages:
# libapache2-mod-python python-libxslt1

<VirtualHost *:80>
    ServerName www.rabbitmq.com
    ServerAlias stage.rabbitmq.com
    ServerAlias rabbit-web.lshift.net
    ServerAdmin simon@lshift.net

    DocumentRoot /srv/www.rabbitmq.com/site/

    CustomLog /var/log/apache2/access-www.rabbitmq.com.log combined
    ErrorLog /var/log/apache2/error-www.rabbitmq.com.log

    # Send requests for the empty path and .html, .xml, .xsl files to
    # the Python XSLT handler.  It will 404 on the .xml and .xsl files
    <Location ~ "^/(|[^/]*.(html|xml|xsl))$">
      SetHandler python-program
      PythonHandler xsl
      PythonDebug On
      PythonPath "['/srv/www.rabbitmq.com/code/'] + sys.path"
    </Location>

    # Send 404 and 500s to the appropriate pages.  403 is permission denied.
    ErrorDocument 403 /404.html
    ErrorDocument 404 /404.html
    ErrorDocument 500 /500.html

    # These directories are constructed by the rabbitmq-umbrella
    Alias /examples /home/rabbitmq/extras/examples
    Alias /javadoc /home/rabbitmq/extras/javadoc
    Alias /releases /home/rabbitmq/extras/releases
    Alias /debian /home/rabbitmq/extras/releases/debian

    # /how appeared on some printed materials
    Redirect permanent /how http://www.rabbitmq.com/how.html

    ServerSignature On
    <Directory /srv/www.rabbitmq.com/site>
    </Directory>

</VirtualHost>

<VirtualHost *:80>
    ServerAdmin webmaster@lshift.net
    ServerName rabbitmq.com
    ServerAlias ww.rabbitmq.com
    ServerAlias www.rabbitmq.org
    ServerAlias www.rabbitmq.net
    ServerAlias rabbitmq.org
    ServerAlias rabbitmq.net

    Redirect permanent / http://www.rabbitmq.com/
</VirtualHost> 

