<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" <?php language_attributes(); ?>>

<head>
    <!-- OneTrust Cookie Consent -->
    <meta content='73d8ba46-8c12-43f6-8c22-24aa21b8d93d' name='onetrust-data-domain'>
    <meta content='https://tags.tiqcdn.com/utag/vmware/microsites-privacy/prod/utag.js' name='microsites-utag'>
    <script src='https://d1fto35gcfffzn.cloudfront.net/assets/jquery-1.11.2.min.js'></script>
    <script src='//www.vmware.com/files/templates/inc/utag_data.js'></script>
    <script src='//tags.tiqcdn.com/utag/vmware/microsites-privacy/prod/utag.sync.js'></script>
    <script>function OptanonWrapper() { { window.dataLayer.push({ event: 'OneTrustGroupsUpdated' }); } }</script>
    <script>
      function setGTM(w,d,s,l,i){ w[l]=w[l]||[]; w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'}); var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:''; j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); }

      if (document.cookie.indexOf('OptanonConsent') > -1 && document.cookie.indexOf('groups=') > -1) { setGTM(window,document,'script','dataLayer','GTM-TT84L8K'); } else{ waitForOnetrustActiveGroups(); } var timer; function waitForOnetrustActiveGroups() { if (document.cookie.indexOf('OptanonConsent') > -1 && document.cookie.indexOf('groups=') > -1) { clearTimeout(timer); setGTM(window,document,'script','dataLayer','GTM-TT84L8K'); } else{ timer=setTimeout(waitForOnetrustActiveGroups, 250); } }
    </script>
    <!-- End OneTrust Cookie Consent -->
    <title><?php bloginfo('name'); ?> <?php if ( is_single() ) { ?> &raquo; Blog Archive <?php } ?> <?php wp_title(); ?> - Messaging that just works</title>
  <meta xmlns="http://www.w3.org/1999/xhtml" name="description" content="RabbitMQ is a complete and highly reliable enterprise messaging system based on the emerging AMQP standard"></meta>
<meta xmlns="http://www.w3.org/1999/xhtml" name="googlebot" content="NOODP"></meta>
<meta xmlns="http://www.w3.org/1999/xhtml" name="google-site-verification" content="nSYeDgyKM9mw5CWcZuD0xu7iSWXlJijAlg9rcxVOYf4"></meta>
<meta xmlns="http://www.w3.org/1999/xhtml" name="google-site-verification" content="6UEaC3SWhpGQvqRnSJIEm2swxXpM5Adn4dxZhFsNdw0"></meta>
<meta content='width=device-width, initial-scale=1.0, maximum-scale=1, minimum-scale=1, user-scalable=no' id='viewport' name='viewport'/>
<link href="https://fonts.googleapis.com/css?family=Raleway:400,500,600,700" rel="stylesheet"/>

<link xmlns="http://www.w3.org/1999/xhtml" rel="stylesheet" rev="stylesheet" href="/css/rabbit.css" type="text/css"></link>
<link xmlns="http://www.w3.org/1999/xhtml" rel="icon" type="/image/vnd.microsoft.icon" href="/favicon.ico"></link>

<link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); ?>" type="text/css" media="screen" />
<link rel="alternate" type="application/rss+xml" title="<?php bloginfo('name'); ?> RSS Feed" href="<?php bloginfo('rss2_url'); ?>" />
<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />
<script type="text/javascript" src="/js/site.js"></script>
</head>

<body>
  <div xmlns="http://www.w3.org/1999/xhtml" id="outerContainer">
    <div class='container'>
      <div class="rabbit-logo">
        <a href="/"><img src="/img/logo-rabbitmq.svg" alt="RabbitMQ"/></a>
      </div>
      <a class='btn menubtn' onclick='showHide()'>Menu <img src="/img/carrot-down-white.svg"/></a>
      <div class='mobilemenuicon' onclick='showHide()'><img src="/img/mobile-menu-icon.svg"/></div>
      <div id="nav">
        <ul id="mainNav">
          <li><a href="/#features">Features</a></li>
          <li><a href="/#getstarted">Get Started</a></li>
          <li><a href="/#support">Support</a></li>
          <li><a href="/#community">Community</a></li>
          <li><a href="/documentation.html">Docs</a></li>
          <li><a href="https://blog.rabbitmq.com/" class='selected'>Blog</a></li>
        </ul>
      </div>
    </div>
    <div class="nav-separator"></div>
    <div id='innerContainer' class='container'>
