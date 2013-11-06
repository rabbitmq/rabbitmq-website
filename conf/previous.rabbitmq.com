# Needed packages:
# libapache2-mod-python python-libxslt1

<VirtualHost *:80>
    ServerName previous.rabbitmq.com
    # TODO alias this into the eng.vmware.com namespace in some smart way
    ServerAdmin postmaster@rabbitmq.com

    DocumentRoot /srv/previous.rabbitmq.com/site/

    CustomLog /var/log/apache2/access-previous.rabbitmq.com.log combined
    ErrorLog /var/log/apache2/error-previous.rabbitmq.com.log

    <Directory /home/rabbitmq/extras/nightlies/rabbitmq-server>
        Options +FollowSymLinks
    </Directory>

    ServerSignature On

    # Via: http://mail-archives.apache.org/mod_mbox/httpd-announce/201108.mbox/%3C20110824161640.122D387DD@minotaur.apache.org%3E
    #
    # Drop the Range header when more than 5 ranges.
    # CVE-2011-3192

    SetEnvIf Range (,.*?){5,} bad-range=1
    RequestHeader unset Range env=bad-range
</VirtualHost>
