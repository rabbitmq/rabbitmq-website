<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" <?php language_attributes(); ?>>

<head>
    <title><?php bloginfo('name'); ?> <?php if ( is_single() ) { ?> &raquo; Blog Archive <?php } ?> <?php wp_title(); ?> - Messaging that just works</title>
  <meta xmlns="http://www.w3.org/1999/xhtml" name="description" content="RabbitMQ is a complete and highly reliable enterprise messaging system based on the emerging AMQP standard"></meta>
<meta xmlns="http://www.w3.org/1999/xhtml" name="googlebot" content="NOODP"></meta>
<meta xmlns="http://www.w3.org/1999/xhtml" name="google-site-verification" content="nSYeDgyKM9mw5CWcZuD0xu7iSWXlJijAlg9rcxVOYf4"></meta>
<meta xmlns="http://www.w3.org/1999/xhtml" name="google-site-verification" content="6UEaC3SWhpGQvqRnSJIEm2swxXpM5Adn4dxZhFsNdw0"></meta>
<link xmlns="http://www.w3.org/1999/xhtml" rel="stylesheet" rev="stylesheet" href="/css/rabbit.css" type="text/css"></link>
<link xmlns="http://www.w3.org/1999/xhtml" rel="icon" type="/image/vnd.microsoft.icon" href="/favicon.ico"></link>
<link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); ?>" type="text/css" media="screen" />
<link rel="alternate" type="application/rss+xml" title="<?php bloginfo('name'); ?> RSS Feed" href="<?php bloginfo('rss2_url'); ?>" />
<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />
<script type="text/javascript" src="/js/site.js"/>
<script xmlns="http://www.w3.org/1999/xhtml" type="text/javascript">
try{
 var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-1001800-1']);
  _gaq.push(['_trackPageview']);
  (function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
}catch(err){};
      </script>
</head>

<body>
<div xmlns="http://www.w3.org/1999/xhtml" id="outerContainer">
    <div id="rabbit-logo">
      <a href="/"><img src="/img/rabbitmq_logo_strap.png" alt="RabbitMQ" width="253" height="53"/></a>
    </div>
    <div id="pivotal-logo">
      <a href="http://pivotal.io/"><img src="/img/logo-pivotal-118x25.png" alt="Pivotal" width="118" height="25"/></a>
    </div>
    <div id="nav-search">
      <div id="search-box">
        <form action="/search.html" method="get">
          <input type="text" name="q" size="25" id="search-query" value="Search RabbitMQ" onfocus="handle_SearchBoxFocus();" onblur="handle_SearchBoxBlur();" />
          <input type="submit" id="search-button" alt="Search" value="" />
        </form>
      </div>
      <ul class="mainNav">
        <li><a href="/features.html">Features</a></li>
        <li><a href="/download.html">Installation</a></li>
        <li><a href="/documentation.html">Documentation</a></li>
        <li><a href="/getstarted.html">Get Started</a></li>
        <li><a href="/services.html">Services</a></li>
        <li><a href="/contact.html">Community</a></li>
        <li><a href="/blog/" class="selected">Blog</a></li>
      </ul>
    </div>

  <div class="nav-separator"/>

    <div class="document">

