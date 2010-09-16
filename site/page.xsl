<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" xmlns:r="http://www.rabbitmq.com/namespaces/ad-hoc/conformance" exclude-result-prefixes="r doc" version="1.0">

<xsl:include href="feed.xsl"/>
<xsl:output method="html" media-type="text/xml" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" omit-xml-declaration="yes" indent="yes" encoding="UTF-8"/>

  <xsl:template match="/html/head">
    <xsl:copy>
      <xsl:apply-templates/>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
      <meta name="description" content="RabbitMQ is a complete and highly reliable enterprise messaging system based on the emerging AMQP standard"/>
      <meta name="googlebot" content="NOODP"/>
      <meta name="google-site-verification" content="nSYeDgyKM9mw5CWcZuD0xu7iSWXlJijAlg9rcxVOYf4"/>
      <meta name="google-site-verification" content="6UEaC3SWhpGQvqRnSJIEm2swxXpM5Adn4dxZhFsNdw0"/>
      <link rel="stylesheet" rev="stylesheet" href="/css/rabbit.css" type="text/css"/>
      <link rel="icon" type="/image/vnd.microsoft.icon" href="favicon.ico"/>
      <script type="text/javascript">
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
    </xsl:copy>
  </xsl:template>

  <xsl:template match="/html/body">
    <xsl:copy>
      <div id="outerContainer">
	<xsl:call-template name="page-header"/>
	<xsl:apply-templates/>
	<xsl:call-template name="page-footer"/>
      </div>
    </xsl:copy>
    <script type="text/javascript" src="/site.js"/>
  </xsl:template>

  <xsl:template match="table">
    <table border="0" cellpadding="0" cellspacing="0">
      <xsl:apply-templates/>
    </table>
  </xsl:template>

  <xsl:template name="page-header">
    <h1>
      <a href="/"><img border="0" src="/img/rabbitmq_logo_strap.png" alt="RabbitMQ" width="361" height="76"/></a>
    </h1>
    <div class="s2-logo">
      <a href="http://www.springsource.com"><img border="0" src="/img/spring09_logo.png" alt="SpringSource" width="240" height="50"/></a>
    </div>
    <div id="search-box">
      <form action="search.html" method="get">
        <input type="text" name="q" size="25" id="search-query" value="Search RabbitMQ" onfocus="handle_SearchBoxFocus();" onblur="handle_SearchBoxBlur();" />
        <input type="submit" id="search-button" alt="Search" value="" />
      </form>
    </div>
    <ul class="mainNav">
      <li><a href="/download.html">Download</a></li>
      <li><a href="/documentation.html">Documentation</a></li>
      <li><a href="/how.html">Get Started</a></li>
      <li><a href="/services.html">Services</a></li>
      <li><a href="/community.html">Community</a></li>
      <li><a href="/blog/">Blog</a></li>
    </ul>
    <div class="nav-separator"/>
  </xsl:template>

  <xsl:template name="page-footer">
    <div class="clear"/>	
    <div class="pageFooter"><p><a class="about" href="about.html">About us</a> RabbitMQ&#8482; is a Trademark of Rabbit
Technologies Ltd.</p></div>
  </xsl:template>

  <!-- ############################################################ -->

  <xsl:template match="doc:div">
    <div class="document">
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="doc:toc">
    <xsl:variable name="tocNode" select="."/>
    <div class="docToc">
      <xsl:apply-templates/>
      <ul class="{@class}">
	<xsl:for-each select="//doc:section[@name]">
	  <li>
	    <a href="#{@name}"><xsl:value-of select=".//doc:heading[1]"/></a>
	    <xsl:if test=".//doc:subsection[@name]">
	      <ul class="{$tocNode/@class}">
		<xsl:for-each select=".//doc:subsection[@name]">
		  <li>
            <a href="#{@name}"><xsl:value-of select=".//doc:heading[1]"/></a>
            <ul class="{$tocNode/@class}">
              <xsl:for-each select=".//doc:subsubsection[@name]">
                <li><a href="#{@name}"><xsl:value-of select=".//doc:heading[1]"/></a></li>
              </xsl:for-each>
            </ul>
          </li>
		</xsl:for-each>
	      </ul>
	    </xsl:if>
	  </li>
	</xsl:for-each>
      </ul>
    </div>
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

  <xsl:template match="doc:toc/doc:heading">
    <h3 class="docHeading"><xsl:apply-templates/></h3>
  </xsl:template>

  <xsl:template match="doc:faqtoc">
    <xsl:variable name="tocNode" select="."/>
    <div class="docToc faqToc">
      <xsl:apply-templates/>
      <ul class="{@class}">
	<xsl:for-each select="//doc:section[@name]">
	  <li>
	    <a href="#{@name}"><xsl:value-of select=".//doc:heading[1]"/></a>
	    <xsl:if test=".//doc:faq[@name]">
	      <ul class="{$tocNode/@class}">
		<xsl:for-each select=".//doc:faq[@name]">
		  <li><a href="#{@name}"><xsl:value-of select=".//doc:heading[1]"/></a></li>
		</xsl:for-each>
	      </ul>
	    </xsl:if>
	  </li>
	</xsl:for-each>
      </ul>
    </div>
  </xsl:template>

  <xsl:template match="doc:faq">
    <div class="faq">
      <xsl:if test="@name"><a name="{@name}"/></xsl:if>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="doc:faq/doc:heading">
    <h3 class="faqHeading"><xsl:apply-templates/></h3>
  </xsl:template>

  <xsl:template match="doc:q">
    <div class="faqQuestion">
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="doc:a">
    <div class="faqAnswer">
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="doc:a/p[1]">
    <xsl:copy>
      <xsl:apply-templates/>
    </xsl:copy>
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
            <th class="onethird">&#160;</th>
        </xsl:if>
      </tr>
      <xsl:apply-templates/>
    </table>
  </xsl:template>

  <xsl:template match="r:download">
    <tr>
      <td class="desc" id="{@id}"><xsl:copy-of select="."/></td>
      <td>
        <a class="adownload" href="releases/{@downloadpath}/{@downloadfile}"><xsl:value-of select="@downloadfile"/></a>
      </td>
      <xsl:if test="../@signature = 'yes'">
         <td class="signature">
            <a href="releases/{@downloadpath}/{@downloadfile}.asc">(Signature)</a>
         </td>
      </xsl:if>
    </tr>
  </xsl:template>

  <xsl:template match="r:repositories">
    <p>
      For information on how to work with the RabbitMQ mercurial
      repositories, please see <a href="mercurial.html">this page</a>.
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
    <tr>
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
  <xsl:template match="r:amilist">
    <table class="amilist" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <th>Availability zone</th>
        <th>Arch</th>
        <th>Ami</th>
        <th>Ec2 command</th>
      </tr>
      <xsl:apply-templates/>
    </table>
  </xsl:template>

  <xsl:template match="r:amiitem">
    <tr>
      <td>
        <xsl:value-of select="@zone"/>
      </td>
      <td>
        <xsl:value-of select="@arch"/>
      </td>
      <td>
        <xsl:value-of select="@ami"/>
      </td>
      <td>
        <code>ec2-run-instances <xsl:value-of select="@ami"/> --key ${EC2_KEYPAIR} --instance-type
            <xsl:if test="@arch = 'x86_64'">m1.large</xsl:if>
            <xsl:if test="@arch != 'x86_64'">m1.small</xsl:if>
            <xsl:if test="@zone != 'us-east-1'">
                --region <xsl:value-of select="@zone"/>
            </xsl:if>
        </code>
      </td>
    </tr>
  </xsl:template>

  <!-- ############################################################ -->
  <xsl:template match="r:snapshotlist">
    <table class="snapshotlist" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <th>Availability zone</th>
        <th>Public snapshot id</th>
        <th>Ec2 command</th>
      </tr>
      <xsl:apply-templates/>
    </table>
  </xsl:template>

  <xsl:template match="r:snapshotitem">
    <tr>
      <td>
        <xsl:value-of select="@zone"/>
      </td>
      <td>
        <xsl:value-of select="@snapid"/>
      </td>
      <td>
        <code>ec2-create-volume --snapshot <xsl:value-of select="@snapid"/> --size 8 \<br/>
        --region <xsl:value-of select="@zone"/> --availability-zone <xsl:value-of select="@zone"/>b
        </code>
      </td>
    </tr>
  </xsl:template>

  <!-- ############################################################ -->
  <xsl:template match="@*">
    <xsl:copy/>
  </xsl:template>

  <xsl:template match="*">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
