<?xml version="1.0"?>
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="max-open-files-intro">
  <p>
    RabbitMQ installations running production workloads may need system
    limits and kernel parameters tuning in order to handle a decent number of
    concurrent connections and queues. The main setting that needs adjustment
    is the max number of open files, also known as <code>ulimit -n</code>.
    The default value on most operating systems is <code>1024</code>, which can be too low
    for a messaging broker. We recommend allowing for at least <code>65536</code> file descriptors
    for user <code>rabbitmq</code> in production environments. <code>4096</code> should be sufficient
    for most development workloads.
  </p>
</doc:subsection>
