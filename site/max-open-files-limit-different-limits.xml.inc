<?xml version="1.0"?>
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="linux-max-open-files-limit-different-limits">
    <p>
      There are two limits in play: the maximum number of open files the OS kernel
      allows (<code>fs.file-max</code>) and the per-user limit (<code>ulimit -n</code>).
      The former must be higher than the latter.
    </p>
</doc:subsection>
