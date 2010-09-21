<!DOCTYPE html PUBLIC "bug in xslt processor requires fake doctype"
"otherwise css isn't included" [
<!ENTITY % entities SYSTEM "rabbit.ent" >
%entities;
]>
<r:include xmlns="http://www.w3.org/1999/xhtml" xmlns:r="http://www.rabbitmq.com/namespaces/ad-hoc/conformance">
    <!-- re-usable content for windows bundle -->
    <p>
      As a convenient alternative for Windows users, a bundle
      download exists, which contains the RabbitMQ server, Java client
      libraries and .Net client, as well as a complete Erlang
      distribution, ready to install.
    </p>
    <r:downloads signature="no">
        <r:download id="bundle" downloadfile="complete-rabbitmq-bundle-&version-server;.zip" downloadpath="bundles/v&version-server;">Server, Java Client, .Net Client, Erlang distribution</r:download>
    </r:downloads>
    <p>
      Consult <a href="/releases/bundles/">the archive</a> if you want
      to download a version of the bundle other than the above.
    </p>
</r:include>
