<?xml version="1.0"?>
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="linux-max-open-files-limit-different-limits">
    <p>
      There are two limits in play: the maximum number of open files the OS kernel
      allows (<code>fs.file-max</code>) and the per-user limit (<code>ulimit -n</code>).
      The former must be higher than the latter.
    </p>
    <p>
      For more information about controlling <code>fs-file-max</code> with <code>sysctl</code>,
      please refer to the excellent <a href="http://docs.basho.com/riak/latest/ops/tuning/open-files-limit/#Linux">Riak guide on open file limit tuning</a>.
    </p>
</doc:subsection>
