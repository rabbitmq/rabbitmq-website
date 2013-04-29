<?xml version="1.0"?>
<!DOCTYPE doc:subsection [
<!ENTITY % entities SYSTEM "rabbit.ent" >
%entities;
]>
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="">
    <doc:heading>File Locations</doc:heading>
    <p>
        The Generic Unix tarball is designed as far as possible to
        run without requiring configuration changes or special
        permissions. The directories and files used by default are
        all held under the installation
        directory <code>rabbitmq_server-&version-server;</code>
        which is in the <span class="envvar">$RABBITMQ_HOME</span>
        variable in the scripts.
    </p>
    <p>
        Should you wish to install RabbitMQ Server such that it uses
        the conventional system directories for configuration,
        database, log files, plugins etc, it is possible to do this.
    </p>
    <p>
        Find the line:
        <pre class="sourcecode">SYS_PREFIX=${RABBITMQ_HOME}</pre>
        in the <code>sbin/rabbitmq-defaults</code> script and
        change this line to:
        <pre class="sourcecode">SYS_PREFIX=</pre>
        but do not modify any other line in this script.
    </p>
    <p>
        <em>Note: </em>After this modification the default directory
        locations may require different permissions. In particular
        <strong>RABBITMQ_MNESIA_BASE</strong> and
        <strong>RABBITMQ_LOG_BASE</strong> may need to be created (the
        server will attempt to create them at startup), and the
        <strong>RABBITMQ_ENABLED_PLUGINS_FILE</strong> will need
        to be writable (for <code>rabbitmq-plugins</code>).  The
        configuration files will be looked for
        in <code>/etc/rabbitmq/</code>.
    </p>
</doc:subsection>
