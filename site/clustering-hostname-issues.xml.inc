<?xml version="1.0"?>
<doc:section name="issues-hostname" xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc">
  <doc:heading>Issues with hostname</doc:heading>
  <p>
    RabbitMQ names the database directory using the
    current hostname of the system. If the hostname
    changes, a new empty database is created. To avoid data loss it's
    crucial to set up a fixed and resolvable hostname. For example:

    <pre class="sourcecode">
sudo -s # become root
echo "rabbit" > /etc/hostname
echo "127.0.0.1 rabbit" >> /etc/hosts
hostname -F /etc/hostname
    </pre>

Whenever the hostname changes you should restart RabbitMQ:
<pre class="sourcecode">$ /etc/init.d/rabbitmq-server restart</pre>
  </p>
  <p>
    A similar effect can be achieved by using <code>rabbit@localhost</code>
    as the broker nodename.
  </p>
  <p>
    The impact of this solution is that clustering will not work, because
    the chosen hostname will not resolve to a routable address from remote
    hosts. The <code>rabbitmqctl</code> command will similarly fail when
    invoked from a remote host. A more sophisticated solution that does not
    suffer from this weakness is to use DNS, e.g. 
    <a href="http://aws.amazon.com/route53/">Amazon Route 53</a> if running
    on EC2.
  </p>
</doc:section>
