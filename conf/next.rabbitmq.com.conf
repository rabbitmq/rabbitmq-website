# Needed packages:
# libapache2-mod-python python-libxslt1

<VirtualHost *:80>
    ServerName next.rabbitmq.com
    # TODO alias this into the eng.vmware.com namespace in some smart way
    ServerAdmin postmaster@rabbitmq.com

    DocumentRoot /srv/next.rabbitmq.com/site/

    CustomLog /var/log/apache2/access-next.rabbitmq.com.log combined
    ErrorLog /var/log/apache2/error-next.rabbitmq.com.log

    # Send 404 and 500s to the appropriate pages.  403 is permission denied.
    ErrorDocument 403 /404.html
    ErrorDocument 404 /404.html
    ErrorDocument 500 /500.html

    # These directories are created/managed by the sync-nightly infrastructure
    Alias /nightlies /home/rabbitmq/extras/nightlies
    Alias /debian-snapshot /home/rabbitmq/extras/nightlies/debian

    <Directory /home/rabbitmq/extras/nightlies/rabbitmq-server>
        Options +FollowSymLinks
    </Directory>

    ServerSignature On
    <Directory /srv/next.rabbitmq.com/site>
        Options -Indexes
    </Directory>

    # Via: http://mail-archives.apache.org/mod_mbox/httpd-announce/201108.mbox/%3C20110824161640.122D387DD@minotaur.apache.org%3E
    #
    # Drop the Range header when more than 5 ranges.
    # CVE-2011-3192

    SetEnvIf Range (,.*?){5,} bad-range=1
    RequestHeader unset Range env=bad-range
</VirtualHost>
