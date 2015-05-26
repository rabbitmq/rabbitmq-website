<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE stylesheet [
<!ENTITY % entities SYSTEM "rabbit.ent" >
%entities;
]>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml"
                xmlns:html="http://www.w3.org/1999/xhtml"
                xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
                xmlns:r="http://www.rabbitmq.com/namespaces/ad-hoc/conformance"
                xmlns:xi="http://www.w3.org/2003/XInclude"
                xmlns:x="http://www.rabbitmq.com/2011/extensions"
                exclude-result-prefixes="r doc html xi x"
                version="1.0">

<!--
Copyright (C) 2007-2015 Pivotal Software, Inc. 

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License, 
Version 2.0 (the "License”); you may not use this file except in compliance 
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
  
<xsl:include href="feed.xsl"/>
<xsl:output method="xml" media-type="text/html" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" omit-xml-declaration="yes" indent="yes" encoding="UTF-8"/>
<xsl:param name="page-name"/>
<xsl:param name="site-mode"/>

  <xsl:template match="html:head">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
      <meta name="googlebot" content="NOODP"/>
      <meta name="google-site-verification" content="nSYeDgyKM9mw5CWcZuD0xu7iSWXlJijAlg9rcxVOYf4"/>
      <meta name="google-site-verification" content="6UEaC3SWhpGQvqRnSJIEm2swxXpM5Adn4dxZhFsNdw0"/>
      <link rel="stylesheet" href="/css/rabbit.css" type="text/css"/>
      <xsl:if test="$site-mode = 'next'">
        <link rel="stylesheet" href="/css/rabbit-next.css" type="text/css"/>
      </xsl:if>
      <xsl:if test="$site-mode = 'previous'">
        <doc:style>
          <doc:body>
            <doc:background>
              <doc:url>/img/previous-bg.png</doc:url>
            </doc:background>
          </doc:body>
        </doc:style>
      </xsl:if>
      <xsl:comment><![CDATA[[if IE 6]>
      <link rel="stylesheet" href="/css/rabbit-ie6.css" type="text/css" />
      <![endif]]]></xsl:comment>
      <link rel="icon" type="/image/vnd.microsoft.icon" href="/favicon.ico"/>
      <link rel="stylesheet" href="/css/tutorial.css" type="text/css"/>
      <script type="text/javascript" src="/js/site.js"/>
      <script type="text/javascript" src="/js/ga-bootstrap.js"/>
      <title>RabbitMQ - <xsl:value-of select="//html:title"/></title>
      <xsl:apply-templates/>
    </head>
  </xsl:template>

  <xsl:template match="html:body">
    <body>
      <div id="outerContainer">
        <xsl:call-template name="page-header"/>
        <xsl:choose>
          <xsl:when test="//html:body[@suppress-rhs]">
            <xsl:apply-templates/>
          </xsl:when>
          <xsl:otherwise>
            <div id="left-content">
              <h1><xsl:value-of select="//html:title"/></h1>
              <xsl:apply-templates/>
            </div>
            <div id="right-nav">
              <xsl:call-template name="in-this-section"/>
              <xsl:call-template name="in-this-page"/>
              <xsl:call-template name="related-links"/>
            </div>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:call-template name="page-footer"/>
      </div>
    </body>
  </xsl:template>

  <!-- Remember to edit the wordpress template too! -->
  <xsl:template name="page-header">
    <div id="rabbit-logo">
      <a href="/"><img src="/img/rabbitmq_logo_strap.png" alt="RabbitMQ" width="253" height="53"/></a>
    </div>
    <div id="pivotal-logo">
      <a href="http://pivotal.io/"><img src="/img/logo-pivotal-118x25.png" alt="Pivotal" width="118" height="25"/></a>
    </div>
    <div id="nav-search">
      <xsl:if test="$site-mode = 'www'">
      <div id="search-box">
        <form action="/search.html" method="get">
          <input type="text" name="q" size="25" id="search-query" value="Search RabbitMQ" onfocus="handle_SearchBoxFocus();" onblur="handle_SearchBoxBlur();" />
          <input type="submit" id="search-button" alt="Search" value="" />
        </form>
      </div>
      </xsl:if>
      <ul class="mainNav">
        <xsl:call-template name="main-nav"/>
        <xsl:if test="$site-mode = 'www'">
          <li><a href="/blog/">Blog</a></li>
        </xsl:if>
      </ul>
    </div>
    <div class="nav-separator"/>
  </xsl:template>

  <!-- Remember to edit the wordpress template too! -->
  <xsl:template name="page-footer">
    <div class="clear"/>
    <div class="pageFooter">
      <p class="righter">
        <a href="/sitemap.html">Sitemap</a> |
        <a href="/contact.html">Contact</a>
      </p>
      <p id="copyright">
        Copyright &#169; 2015 Pivotal Software, Inc. All rights reserved
        |&#160;<a href="http://pivotal.io/privacy-policy">Privacy Policy</a>
        |&#160;<a href="https://github.com/rabbitmq/rabbitmq-website/">This Site is Open Source</a>        
        |&#160;<a href="https://groups.google.com/forum/#!msg/rabbitmq-users/UuvnsOV7yS4/14b8pHcs8I0J">We're Hiring</a>
      </p>
    </div>
  </xsl:template>

  <!-- ############################################################ -->

  <xsl:template name="in-this-page">
    <xsl:if test="//html:body[@show-in-this-page]">
      <div class="in-this-page">
        <h4>In This Page</h4>
        <ul>
          <xsl:for-each select="//doc:section[@name]">
            <li>
              <a href="#{@name}"><xsl:value-of select=".//doc:heading[1]"/></a>
            </li>
          </xsl:for-each>
        </ul>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template match="doc:section">
    <div class="docSection">
      <xsl:if test="@name"><a name="{@name}"/></xsl:if>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="doc:subsection">
    <div class="docSubsection">
      <xsl:if test="@name"><a name="{@name}"/></xsl:if>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="doc:subsubsection">
    <div class="docSubsection">
      <xsl:if test="@name"><a name="{@name}"/></xsl:if>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="doc:roadmapentry">
    <div class="docRoadmapentry">
      <xsl:if test="@name"><a name="{@name}"/></xsl:if>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="doc:section/doc:heading">
    <h2 class="docHeading"><xsl:apply-templates/></h2>
  </xsl:template>

  <xsl:template match="doc:subsection/doc:heading">
    <h3 class="docHeading"><xsl:apply-templates/></h3>
  </xsl:template>

  <xsl:template match="doc:subsubsection/doc:heading">
    <h3 class="docHeading"><xsl:apply-templates/></h3>
  </xsl:template>

  <xsl:template match="doc:roadmapentry/doc:heading">
    <div class="docRoadmapentryHeading"><xsl:apply-templates/></div>
  </xsl:template>

  <xsl:template match="doc:feed">
    <ul class="feed">
      <xsl:apply-templates/>
    </ul>
  </xsl:template>

  <xsl:template match="doc:link">
    <a href="{@linkend}"><xsl:apply-templates/></a>
  </xsl:template>

  <xsl:template match="doc:item">
    <li>
      <xsl:choose>
    <xsl:when test="doc:link">
      <a id="{doc:date/@iso}" class="feed-item-title" href="{doc:link}">
        <xsl:value-of select="doc:title"/>
      </a>
    </xsl:when>
    <xsl:otherwise>
      <span class="feed-item-title">
        <xsl:value-of select="doc:title"/>
      </span>
    </xsl:otherwise>
      </xsl:choose>
      <span class="feed-item-date">
    <xsl:value-of select="doc:date"/>
      </span>
      <hr/>
      <xsl:apply-templates select="doc:text"/>
    </li>
  </xsl:template>

  <xsl:template match="doc:text">
    <xsl:copy-of select="node()"/>
  </xsl:template>


  <!-- ############################################################ -->

  <xsl:template match="r:downloads">
    <table class="downloads" border="0" cellpadding="0" cellspacing="0">
      <tr>
    <th class="desc">Description</th>
    <th>Download </th>
        <xsl:if test="@signature = 'yes'">
            <th>&#160;</th>
        </xsl:if>
      </tr>
      <xsl:apply-templates/>
    </table>
  </xsl:template>

  <xsl:template match="r:download">
    <tr>
      <td class="desc" id="{@id}"><xsl:apply-templates /></td>
      <td>
      <xsl:choose>
        <xsl:when test="@absolute = 'yes'">
          <a class="adownload" href="{@url}"><xsl:value-of select="@downloadfile"/></a>
        </xsl:when>
        <xsl:otherwise>
          <a class="adownload" href="/releases/{@downloadpath}/{@downloadfile}"><xsl:value-of select="@downloadfile"/></a>
        </xsl:otherwise>
      </xsl:choose>

      </td>
      <xsl:choose>
        <xsl:when test="../@signature = 'yes' and not(@signature = 'no')">
          <td class="signature">
            <a href="/releases/{@downloadpath}/{@downloadfile}.asc">(Signature)</a>
          </td>
        </xsl:when>
        <xsl:otherwise>
          <td class="signature">
          </td>
        </xsl:otherwise>
      </xsl:choose>
    </tr>
  </xsl:template>

  <xsl:template match="r:repositories">
    <p>
      For information on how to work with the RabbitMQ GitHub
      repositories, please see <a href="github.html">this page</a>.
    </p>
    <xsl:choose>
      <xsl:when test="@type = 'plugin'">
        <p>
          For more information about the installation of plugins, refer to the
          <a href="/plugin-development.html#getting-started">Plugin Development: Getting Started</a> documentation.
        </p>
      </xsl:when>
    </xsl:choose>

    <table class="downloads" border="0" cellpadding="0" cellspacing="0">
      <tr>
    <th>Snapshot</th>
    <th>Repository checkout command</th>
    <th>Repository overview</th>
      </tr>
      <xsl:apply-templates/>
    </table>
  </xsl:template>

  <xsl:template match="r:repository[@type = 'hg']">
    <tr>
      <td>
    <a class="adownload" href="{@url}archive/default.zip"><xsl:value-of select="@shortname"/></a>
      </td>
      <td>
    <code>hg clone <xsl:value-of select="@url"/></code>
      </td>
      <td>
    <a class="arepo" href="{@url}">Browse source</a>
      </td>
    </tr>
  </xsl:template>

  <xsl:template match="r:repository[@type = 'github']">
    <tr>
      <td>
    <a class="adownload" href="{@url}/archives/master"><xsl:value-of select="@shortname"/></a>
      </td>
      <td>
    <code>git clone <xsl:value-of select="@url"/>.git</code>
      </td>
      <td>
    <a class="arepo" href="{@url}">Browse source</a>
      </td>
    </tr>
  </xsl:template>

  <!-- ############################################################ -->

  <xsl:template match="r:plugin">
    <tr>
      <th><xsl:value-of select="@name"/></th>
    </tr>
    <tr>
      <td><xsl:apply-templates/></td>
    </tr>
  </xsl:template>

  <xsl:template match="r:community-plugin-link">
    <xsl:variable name="plugins" select="document('community-plugins.xml.dat')" />
    <xsl:variable name="plugin">
      <xsl:choose>
        <xsl:when test="@name">
          <xsl:value-of select="@name" />
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="ancestor::r:plugin/@name" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="release" select="$plugins/plugins/@version" />
    <xsl:variable name="version" select="$plugins/plugins/plugin[@name = $plugin]/@latest" />
    Download:
    <xsl:choose>
      <xsl:when test="$version">
        <a href="/community-plugins/{$release}/{$plugin}-{$version}.ez"><xsl:value-of select="$plugin"/>-<xsl:value-of select="$version"/>.ez</a>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$plugin"/> has not yet been built for <xsl:value-of select="$release"/>.
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="r:readme-link">
    <xsl:choose>
      <xsl:when test="@extension">
        <a href="http://hg.rabbitmq.com/{@repo}/file/&version-server-tag;/README{@extension}">README for this plugin</a>
      </xsl:when>
      <xsl:otherwise>
        <a href="http://hg.rabbitmq.com/{@repo}/file/&version-server-tag;/README">README for this plugin</a>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- ############################################################ -->

  <xsl:template match="r:classes">
    <table class="amqpRules" border="0" cellpadding="0" cellspacing="0">
      <tr>
    <th>Current Status</th>
    <th>Class</th>
    <th>Notes</th>
      </tr>
      <xsl:apply-templates/>
    </table>
  </xsl:template>

  <xsl:template match="r:methods">
    <table class="amqpRules" border="0" cellpadding="0" cellspacing="0">
      <tr>
    <th>Current Status</th>
    <th>Method</th>
    <th>Notes</th>
      </tr>
      <xsl:apply-templates/>
    </table>
  </xsl:template>

  <xsl:template match="r:qpid-tests">
    <table class="amqpRules" border="0" cellpadding="0" cellspacing="0">
      <tr>
    <th>Current Status</th>
    <th>Test Name</th>
    <!-- <th>Test Class</th> -->
    <th>Notes</th>
      </tr>
      <xsl:apply-templates/>
    </table>
  </xsl:template>

  <xsl:template match="r:class|r:method">
    <tr id="{concat(local-name(), '-status-', @name)}">
      <td class="statusCell status_{r:status/@value}">
    <xsl:apply-templates select="r:status"/>
      </td>
      <td><xsl:value-of select="@name"/></td>
      <td><xsl:apply-templates select="r:notes"/></td>
    </tr>
  </xsl:template>

  <xsl:template match="r:qpid-test">
    <tr>
      <td class="statusCell status_{r:status/@value}">
    <xsl:apply-templates select="r:status"/>
      </td>
      <td><xsl:value-of select="@name"/></td>
      <!-- <td><xsl:value-of select="@class"/></td> -->
      <td><xsl:apply-templates select="r:notes"/></td>
    </tr>
  </xsl:template>

  <xsl:template match="r:rules">
    <table class="amqpRules" border="0" cellpadding="0" cellspacing="0">
      <tr>
    <th>Current Status</th>
    <th>Type</th>
    <th>Actor</th>
    <th>Reference</th>
    <th>Text</th>
      </tr>
      <xsl:apply-templates/>
    </table>
  </xsl:template>

  <xsl:template match="r:rule">
    <tr>
      <td class="statusCell status_{r:status/@value}">
    <xsl:apply-templates select="r:status"/>
      </td>
      <td><xsl:value-of select="r:type"/></td>
      <td><xsl:value-of select="r:actor"/></td>
      <td><xsl:value-of select="r:xref"/></td>
      <td>
    <div>
      <xsl:if test="normalize-space(r:context)">
        <xsl:value-of select="normalize-space(r:context)"/>:
      </xsl:if>
      <xsl:value-of select="r:text"/>
    </div>
    <xsl:if test="r:notes">
      <div class="notes">
        <span class="leader">Notes: </span>
        <xsl:apply-templates select="r:notes"/>
      </div>
    </xsl:if>
      </td>
    </tr>
  </xsl:template>

  <xsl:template match="r:status[text()]">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template match="r:status">
    <xsl:value-of select="@value"/>
  </xsl:template>

  <xsl:template match="r:notes">
    <xsl:apply-templates/>
  </xsl:template>

  <!-- ############################################################ -->
  <xsl:key name="page-key" match="x:page" use="@url" />

  <xsl:template name="related-links">
    <xsl:variable name="pages" select="document('pages.xml.dat')" />

    <xsl:for-each select="$pages">
      <xsl:if test="count(key('page-key', $page-name)/x:related) &gt; 0">
        <div id="related-links">
          <h4>Related Links</h4>
          <ul>
            <xsl:apply-templates select="key('page-key', $page-name)/x:related"/>
          </ul>
        </div>
      </xsl:if>
    </xsl:for-each>
  </xsl:template>

  <xsl:template name="main-nav">
    <xsl:variable name="pages" select="document('pages.xml.dat')" />
    <xsl:for-each select="$pages">
      <xsl:for-each select="x:pages/x:page">
        <xsl:variable name="key" select="@url" />
        <li>
          <a href="{@url}">
            <xsl:if test="count(key('page-key', $page-name)/ancestor-or-self::x:page[@url = $key]) &gt; 0">
              <xsl:attribute name="class">selected</xsl:attribute>
            </xsl:if>
            <xsl:value-of select="@text"/>
          </a>
        </li>
      </xsl:for-each>
    </xsl:for-each>
  </xsl:template>

  <xsl:template name="in-this-section">
    <xsl:variable name="pages" select="document('pages.xml.dat')" />
    <xsl:for-each select="$pages">
      <xsl:for-each select="key('page-key', $page-name)">
        <xsl:variable name="section" select="ancestor-or-self::x:page[parent::x:pages]/@url" />
        <xsl:for-each select="key('page-key', $section)">
          <xsl:if test="count(x:modal[@mode=$site-mode]/x:page) &gt; 0 or count(x:page) &gt; 0">
            <div id="in-this-section">
              <h4>In This Section</h4>
              <ul>
                <xsl:apply-templates mode="pages" />
              </ul>
            </div>
          </xsl:if>
        </xsl:for-each>
      </xsl:for-each>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="x:page" mode="pages">
    <li>
      <xsl:if test="@gap-after">
        <xsl:attribute name="class">gap-after</xsl:attribute>
      </xsl:if>
      <xsl:variable name="key" select="@url" />
      <xsl:choose>
        <xsl:when test="count(key('page-key', $page-name)/ancestor-or-self::x:page[@url = $key]) &gt; 0">
          <a href="{@url}" class="selected">
            <xsl:value-of select="@text"/>
          </a>
          <xsl:if test="x:page">
            <ul><xsl:apply-templates mode="pages" /></ul>
          </xsl:if>
        </xsl:when>
        <xsl:otherwise>
          <a href="{@url}"><xsl:value-of select="@text"/></a>
        </xsl:otherwise>
      </xsl:choose>
    </li>
  </xsl:template>

  <xsl:template match="x:modal">
    <xsl:if test="@mode = $site-mode">
        <xsl:apply-templates />
    </xsl:if>
  </xsl:template>

  <xsl:template match="x:modal" mode="pages">
    <xsl:if test="@mode = $site-mode">
        <xsl:apply-templates mode="pages"/>
    </xsl:if>
  </xsl:template>

  <xsl:template match="x:sitemap">
    <xsl:variable name="pages" select="document('pages.xml.dat')" />
    <xsl:for-each select="$pages">
      <xsl:for-each select="x:pages/x:page">
        <h3><a href="{@url}"><xsl:value-of select="@text"/></a></h3>
        <ul>
          <xsl:apply-templates mode="sitemap" />
        </ul>
      </xsl:for-each>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="x:page" mode="sitemap">
    <li>
      <a href="{@url}"><xsl:value-of select="@text"/></a>
      <xsl:if test="x:page">
        <ul><xsl:apply-templates mode="sitemap" /></ul>
      </xsl:if>
    </li>
  </xsl:template>

  <xsl:template match="x:related">
    <xsl:variable name="page" select="key('page-key', @url)" />
    <li>
      <a href="{@url}">
        <xsl:choose>
          <xsl:when test="@text">
            <xsl:value-of select="@text" />
          </xsl:when>
          <xsl:when test="$page/@text">
            <xsl:value-of select="$page/@text" />
          </xsl:when>
        </xsl:choose>
      </a>
    </li>
  </xsl:template>

  <!-- ############################################################ -->
  <xsl:template match="*[local-name(.) = 'code']">
    <span class="code {./@class}">
      <!-- ignore any other attributes on the code element -->
      <xsl:apply-templates select="node()" />
    </span>
  </xsl:template>

  <xsl:template match="@*">
    <xsl:copy/>
  </xsl:template>

  <xsl:template match="html:title"/>

  <xsl:template match="html:*">
    <xsl:element name="{name()}" namespace="{namespace-uri()}">
      <xsl:apply-templates select="@*|node()" />
    </xsl:element>
  </xsl:template>

  <xsl:template match="*">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
