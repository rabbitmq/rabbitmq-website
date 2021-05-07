<!--
Copyright (c) 2007-2021 VMware, Inc. or its affiliates.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Windows-specific Issues

This guide is a companion to the main [Windows installation guide](/install-windows.html).

It documents known conditions and scenarios which can cause RabbitMQ Windows service
or CLI tools to malfunction.


## <a id="erlang-distribution-port" class="anchor" href="#erlang-distribution-port">Erlang Distribution Port</a>

To specify a non-standard port to be used for Erlang distribution, do the following:

 * Make sure to use the same administrative user that was used to install RabbitMQ
 * Stop the RabbitMQ Windows service using `.\rabbitmq-service.bat stop`
 * Remove the RabbitMQ Windows service using `.\rabbitmq-service.bat remove`
 * Create the `%AppData%\RabbitMQ\rabbitmq-env-conf.bat` file with the following contents (use your own port number):

<pre class="lang-powershell">
set DIST_PORT=44556
</pre>

 * Install the RabbitMQ Windows service using `.\rabbitmq-service.bat install`
 * Start the RabbitMQ Windows service using `.\rabbitmq-service.bat start`
 * Verify what port is being used for inter-node and CLI tool communication:

<pre class="lang-bash">
epmd -names
</pre>

## <a id="multiple-erlang-versions" class="anchor" href="#multiple-erlang-versions">Multiple Versions of Erlang May Cause Installation Issues</a>

Due to how the Windows `.exe` installer detects an installed version of Erlang, RabbitMQ may end up not using the latest version of Erlang installed. Please ensure that only one version of Erlang is installed -
the version you wish RabbitMQ to use. If you must upgrade Erlang, use this procedure:

 * Make sure to use the same administrative user that was used to install RabbitMQ
 * Stop the RabbitMQ Windows service using `.\rabbitmq-service.bat stop`
 * Uninstall Erlang
 * Install the new version of Erlang
 * Open the "RabbitMQ Command Prompt (sbin dir)" start menu item and run the commands below to reinstall the Windows service

<pre class="lang-powershell">
.\rabbitmq-service.bat remove
.\rabbitmq-service.bat install
.\rabbitmq-service.bat start
</pre>

If any environment variables have changed in the mean time, [Windows service reinstallation](/configure.html#rabbitmq-env-file-windows) would
also be necessary.


## <a id="non-ascii-paths" class="anchor" href="#non-ascii-paths">Cannot Install to a Path with non-ASCII Characters</a>

RabbitMQ will fail to start with the error that reads

<pre class="lang-plaintext">
RabbitMQ: Erlang machine stopped instantly (distribution name conflict?)
</pre>

when installed to a path with non-ASCII characters in it.
This is because we need to pass the location of the compiled Erlang files to the Erlang VM.
It expects input in UTF-8, but the console will typically use some other encoding.

### Mitigation

One of these options can be used to mitigate:

 * Override `RABBITMQ_BASE` to point to a directory
   that only has ASCII characters and [**re-install** the Windows service](/configure.html#rabbitmq-env-file-windows).
 * Edit the file `rabbitmq-server.bat` and change the
   line `set TDP0=%~dp0` to `set TDP0=%~dps0`.
   This will use short paths (the infamous `C:\PROGRA~1`) everywhere.


## <a id="non-ascii-cli" class="anchor" href="#non-ascii-cli">CLI Tools Display or Parse non-ASCII Characters Incorrectly</a>

Similarly, [RabbitMQ CLI tools](/cli.html) will expect command line
parameters to be encoded in UTF-8, and display strings as
UTF-8. The console will instead provide and expect some country-specific encoding.

### Mitigation

One of these options can be used to mitigate:

 * Avoid using non-ASCII characters in RabbitMQ installation and [node directory](/relocate.html) paths
 * On recent versions of Windows, issue the command
   <pre class="lang-powershell">chcp 65001</pre> before using CLI tools to force
   the console to use UTF-8
 * Where possible, use the [management plugin](/management.html) instead of CLI tools.


## <a id="cookie-location" class="anchor" href="#cookie-location">Installing as a non-administrator User Leaves `.erlang.cookie` in the Wrong Place</a>

If RabbitMQ is installed using a non-administrative account, a [shared secret](/cli.html#erlang-cookie) file
used by nodes and CLI tools will not be placed into a correct location,
leading to [authentication failures](/cli.html#cli-authentication-failures) when `rabbitmqctl.bat`
and other CLI tools are used.

### Mitigation

One of these options can be used to mitigate:

 * Re-install RabbitMQ using an administrative user
 * Copy the file `.erlang.cookie` manually
   from `%SystemRoot%` or `%SystemRoot%\system32\config\systemprofile`
   to `%HOMEDRIVE%%HOMEPATH%`.

See [How CLI Tools Authenticate to Nodes (and Nodes to Each Other](/cli.html#erlang-cookie) in the CLI guide.


## <a id="computername-vs-hostname" class="anchor" href="#computername-vs-hostname">COMPUTERNAME is different from HOSTNAME</a>

Older versions of RabbitMQ calculated the node name using the `COMPUTERNAME`
environment variable, which is always upper-case. Later versions of RabbitMQ
use `HOSTNAME` which may be lowercase. If you are upgrading from an old
(pre-`3.6.0`) version of RabbitMQ to a current one and see [the issue described
here](https://github.com/rabbitmq/rabbitmq-server/issues/1568), you should set
a system-wide environment variable named `RABBITMQ_NODENAME` with the following
value: `rabbit@ALL_CAPS_HOSTNAME`.

Then, RabbitMQ will continue to use the all-caps hostname and the upgrade will
succeed.
