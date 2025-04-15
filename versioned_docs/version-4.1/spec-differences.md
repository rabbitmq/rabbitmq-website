---
title: Spec Differences
displayed_sidebar: docsSidebar
---
<div id="left-content">
    <h2>Undeprecated Features</h2>
    <p>
        In addition to extensions beyond the specification, RabbitMQ also undeprecates some features that were removed from AMQP 0-9-1.
    </p>
    <ul>
        <li>Auto-delete exchanges</li>
        <li>Internal exchanges</li>
    </ul>
    <p>
        The access class was deprecated from AMQP 0-9-1. RabbitMQ implements the
        <span class="code">access.request</span> method from this class as a no-op in order to maintain compatibility with older clients. This method will be removed in the future and should not be relied upon.
    </p>

    <h2>amq.* Exchange Immutability</h2>
    <p>AMQP 0-9-1 spec dictates that it must not be possible to declare an exchange with the <span class="code">amq.</span> prefix. RabbitMQ also prohibits deletion of such exchanges.</p>
    <div id="help-and-feedback">
        <h2>Getting Help and Providing Feedback</h2>
        <p>
            If you have questions about the contents of this guide or any other topic related to RabbitMQ, don't hesitate to ask them using <a href="https://github.com/rabbitmq/rabbitmq-server/discussions">GitHub Discussions</a> or our
            community <a href="https://www.rabbitmq.com/discord">Discord server</a>.
        </p>
    </div>
    <div id="contribute">
        <h2>Help Us Improve the Docs &lt;3</h2>
        <p>If you'd like to contribute an improvement to the site, its source is <a href="https://github.com/rabbitmq/rabbitmq-website">available on GitHub</a>. Simply fork the repository and submit a pull request. Thank you!</p>
    </div>
</div>
