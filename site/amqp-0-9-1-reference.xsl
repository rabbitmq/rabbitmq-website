<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml"
                xmlns:x="http://www.rabbitmq.com/2011/extensions"
                xmlns:c="http://www.rabbitmq.com/namespaces/ad-hoc/conformance"
                exclude-result-prefixes="x c">

  <xsl:import href="page.xsl" />
  <xsl:output method="html" indent="yes" />
  
  <xsl:variable name="spec-doc" select="document('resources/specs/amqp0-9-1.xml')"/>
  <xsl:variable name="specification" select="document('specification.xml')" />
  <xsl:key name="method-key" match="c:method" use="@name" />
  
  <xsl:template match="x:insert-spec-here">
    <div id="content-pane">
      <h2>AMQP 0-9-1 Reference Guide</h2>
      <!-- switch context from source file to spec doc -->
      <xsl:for-each select="$spec-doc/amqp">
		  <xsl:call-template name="render-toc" />
		  <xsl:call-template name="render-summary" />
		  <xsl:apply-templates select="class" />
	  </xsl:for-each>
	  <xsl:if test="not($spec-doc/amqp)">
	    <p/>
	    <em>Oops! Failed to load amqp-0-9-1.xml source file</em>
	  </xsl:if>
    </div>
  </xsl:template>

  <xsl:template name="render-toc">
    <h3 id="toc">Table of Contents</h3>
    <ul>
      <li>
        <a href="#classes-summary">Classes and Methods</a>
      </li>
      <li>
        <a href="#domains-summary">Domains</a>
      </li>
      <li>
        <a href="#constants-summary">Constants</a>
      </li>
    </ul>
  </xsl:template>

  <xsl:template name="render-summary">
    <p>
      This page contains a complete reference to version 0-9-1 of the AMQP specification
      as published by the <a href="http://www.amqp.org">AMQP WG</a> in 2008. The <a href="http://www.amqp.org/confluence/download/attachments/720900/amqp0-9-1.xml">
        original specification
      </a> is released under the <a href="http://www.amqp.org/confluence/display/AMQP/AMQP+License">AMQP license</a>.
    </p>
    <p>
      Elsewhere on this site you can read details of <a href="specification.html">
        RabbitMQ's conformance to the specification
      </a>. Please also be aware that RabbitMQ
      implements <a href="extensions.html">several extensions</a> to the core specification
      that are not documented here.
    </p>
    <div>
      <h3 id="classes-summary" class="inline-block">Class and Method Summary</h3>
      <xsl:call-template name="render-link-to-toc"/>
    </div>
    <p>The following classes, with their associated methods, are defined in the specification:</p>
    <table id="classes-table">
      <thead>
        <tr>
          <th class="col-1">Class</th>
          <th class="col-2">ID</th>
          <th class="col-3">Label</th>
          <th class="col-4">Method</th>
          <th class="col-5">ID</th>
          <th class="col-6">Method Label</th>
        </tr>
      </thead>
      <tbody>
        <xsl:apply-templates mode="summary" select="class"/>
      </tbody>
    </table>
    <div>
      <h3 id="domains-summary" class="inline-block">Domain Summary</h3>
      <xsl:call-template name="render-link-to-toc"/>
    </div>
    <p>The following domains are defined in the specification:</p>
    <table id="domains-table">
      <thead>
        <tr>
          <th class="col-1">Name</th>
          <th class="col-2">Type</th>
          <th class="col-3">Description</th>
        </tr>
      </thead>
      <tbody>
        <xsl:apply-templates mode="summary" select="domain">
          <xsl:sort select="@name" data-type="text" order="ascending"/>
        </xsl:apply-templates>
      </tbody>
    </table>
    <div>
      <h3 id="constants-summary" class="inline-block">Constant Summary</h3>
      <xsl:call-template name="render-link-to-toc"/>
    </div>
    <p>Many constants are error codes. Where this is so, they fall into one of two categories:</p>
    <ul>
      <li>
        <em>Channel Errors:</em> These are associated with failures that affect the current channel
        but no other channels created from the same connection.
      </li>
      <li>
        <em>Connection Errors:</em> These are associated with failures that preclude any further
        activity on the connection and mandate its closure.
      </li>
    </ul>
    <p>The following constants are defined in the specification:</p>
    <table id="constants-table">
      <thead>
        <tr>
          <th class="col-1">Name</th>
          <th class="col-2">Value</th>
          <th class="col-3">Error Class</th>
          <th class="col-4">Description</th>
        </tr>
      </thead>
      <tbody>
        <xsl:apply-templates mode="summary" select="constant"/>
      </tbody>
    </table>
  </xsl:template>

  <xsl:template match="class" mode="summary">
    <tr>
      <td rowspan="{count(method)}">
        <a href="{concat('#', generate-id())}"><xsl:value-of select="@name"/></a>
      </td>
      <td rowspan="{count(method)}"><xsl:value-of select="@index"/></td>
      <td rowspan="{count(method)}">
        <xsl:call-template name="capitalise">
          <xsl:with-param name="s" select="@label" />
        </xsl:call-template>
      </td>
      <xsl:for-each select="method">
        <xsl:variable name="label">
          <xsl:call-template name="capitalise">
            <xsl:with-param name="s" select="@label" />
          </xsl:call-template>
        </xsl:variable>
        <xsl:choose>
          <xsl:when test="position() = 1">
            <td>
              <a href="{concat('#', generate-id())}">
                <xsl:value-of select="@name" />
              </a>
            </td>
            <td><xsl:value-of select="@index"/></td>
            <td><xsl:value-of select="$label" /></td>
          </xsl:when>
          <xsl:otherwise>
            <tr>
              <td>
                <a href="{concat('#', generate-id())}">
                  <xsl:value-of select="@name" />
                </a>
              </td>
              <td><xsl:value-of select="@index"/></td>
              <td><xsl:value-of select="$label" /></td>
            </tr>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:for-each>
    </tr>
  </xsl:template>

  <xsl:template match="constant" mode="summary">
    <tr>
      <td><xsl:value-of select="@name"/></td>
      <td><xsl:value-of select="@value"/></td>
      <td>
        <xsl:choose>
          <xsl:when test="starts-with(@class, 'hard')">connection</xsl:when>
          <xsl:when test="starts-with(@class, 'soft')">channel</xsl:when>
        </xsl:choose>
      </td>
      <td><xsl:value-of select="doc[1]"/></td>
    </tr>
  </xsl:template>

  <xsl:template match="domain" mode="summary">
    <tr id="{generate-id()}">
      <td><xsl:value-of select="@name"/></td>
      <td><xsl:value-of select="@type"/></td>
      <td>
        <xsl:choose>
          <xsl:when test="doc">
            <xsl:value-of select="doc"/>
          </xsl:when>
          <xsl:when test="@label">
            <xsl:value-of select="concat('[', @label, ']')"/>
          </xsl:when>
        </xsl:choose>
        <xsl:call-template name="render-rules" />
        <xsl:call-template name="render-asserts" />
      </td>
    </tr>
  </xsl:template>

  <xsl:template match="class">
    <h3 id="{generate-id()}" class="inline-block">
      <xsl:value-of select="@name"/>
    </h3>
    <xsl:call-template name="render-link-to-classes-summary"/>
    <xsl:apply-templates select="doc"/>
    <xsl:call-template name="render-rules" />
    <xsl:call-template name="render-fields" />
    <xsl:call-template name="render-methods" />
  </xsl:template>

  <xsl:template name="render-methods">
    <xsl:if test="method">
      <h4>Methods</h4>
      <p>
        The <em><xsl:value-of select="@name" /></em> class defines the following methods:
      </p>
      <xsl:apply-templates select="method" />
    </xsl:if>
  </xsl:template>

  <xsl:template match="method">
	<xsl:variable name="method-name" select="concat(../@name, '.', @name)" />
    <h5 id="{generate-id()}" class="inline-block">
      <xsl:value-of select="$method-name"/>
    </h5>
    <xsl:call-template name="render-link-to-classes-summary"/>
    <dl>
      <dt>ID:</dt>
      <dd>
        <xsl:value-of select="@index"/>
      </dd>
      <dt>Purpose:</dt>
      <dd>
        <xsl:call-template name="capitalise">
          <xsl:with-param name="s" select="@label"/>
        </xsl:call-template>
      </dd>
      <dt>Synchronous:</dt>
      <dd>
        <xsl:choose>
          <xsl:when test="@synchronous = '1'">
            <xsl:text>yes</xsl:text>
            <xsl:if test="response">
              <xsl:text>; the expected response is </xsl:text>
			  <a class="sync-response-method" href="{concat('#', generate-id(../method[@name = current()/response/@name]))}">
			    <xsl:value-of select="concat(../@name, '.', response/@name)" />
 			  </a>
            </xsl:if>
          </xsl:when>
          <xsl:otherwise>no</xsl:otherwise>
        </xsl:choose>
      </dd>
      <dt>Accepted by:</dt>
      <dd>
        <xsl:value-of select="chassis/@name"/>
      </dd>
      <dt>Parameters:</dt>
      <dd>
        <xsl:variable name="num-fields" select="count(field)" />
        <xsl:choose>
          <xsl:when test="$num-fields = 0">none</xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$num-fields" />
          </xsl:otherwise>
        </xsl:choose>
      </dd>
	  <xsl:for-each select="$specification">
	    <xsl:for-each select="key('method-key', $method-name)">   
          <dt>RabbitMQ implementation:</dt>
	      <dd>
	        <xsl:variable name="status" select="current()/c:status/@value"/>
	        <xsl:choose>
	          <xsl:when test="$status = 'ok'">full</xsl:when>
	          <xsl:otherwise><xsl:value-of select="$status" /></xsl:otherwise>
	        </xsl:choose>
	        <xsl:if test="current()/c:notes">
	          <xsl:value-of select="concat('; ', current()/c:notes)"/>
	        </xsl:if>
	      </dd>
        </xsl:for-each>
      </xsl:for-each>
    </dl>
    <xsl:apply-templates select="doc" />
    <xsl:call-template name="render-parameters" />
    <xsl:call-template name="render-rules" />
  </xsl:template>

  <xsl:template name="render-rules">
    <xsl:if test="rule">
      <p class="rules-label">Rules:</p>
      <ul class="rules">
        <xsl:for-each select="rule">
          <li>
            <xsl:if test="@name">
              <em><xsl:value-of select="@name"/></em>
            </xsl:if>
            <xsl:apply-templates />
          </li>
        </xsl:for-each>
      </ul>
    </xsl:if>
  </xsl:template>

  <xsl:template name="render-fields">
    <xsl:if test="field">
      <h4>Fields</h4>
      <p>The <em><xsl:value-of select="@name" /></em> class defines the following fields:</p>
      <xsl:call-template name="render-field-table"/>
    </xsl:if>
  </xsl:template>

  <xsl:template name="render-parameters">
    <xsl:if test="field">
      <p>Parameter summary:</p>
      <xsl:call-template name="render-field-table"/>
    </xsl:if>
  </xsl:template>

  <xsl:template name="render-field-table">
    <table class="fields-table">
      <thead>
        <tr>
          <th class="col-1">Ordinal</th>
          <th class="col-2">Name</th>
          <th class="col-3">Domain</th>
          <th class="col-4">Purpose</th>
          <th class="col-5">Description</th>
        </tr>
      </thead>
      <tbody>
        <xsl:apply-templates select="field" />
      </tbody>
    </table>
  </xsl:template>

  <xsl:template match="field">
    <tr>
      <td><xsl:value-of select="position()"/></td>
      <td><xsl:value-of select="@name"/></td>
      <td>
        <a href="{concat('#',generate-id(//domain[@name = current()/@domain]))}"><xsl:value-of select="@domain"/></a>
      </td>
      <td><xsl:value-of select="@label"/></td>
      <!-- note: may be worthwhile highlighting rules docs vs plain docs-->
      <td>
        <xsl:apply-templates select="doc"/>
        <xsl:call-template name="render-rules" />
        <xsl:call-template name="render-asserts" />
      </td>
    </tr>
  </xsl:template>

  <xsl:template match="doc">
    <p><xsl:value-of select="." /></p>
  </xsl:template>

  <xsl:template match="doc[@type='grammar']">
    <p class="grammar-label">Class Grammar:</p>
    <pre class="code">
      <xsl:value-of select="." />
    </pre>
  </xsl:template>

  <xsl:template match="doc[@type='scenario']">
    <p>
      <span class="scenario-label">Test scenario:</span>
      <span class="scenario-text">
        <xsl:value-of select="." />
      </span>
    </p>
  </xsl:template>

  <xsl:template name="render-asserts">
    <xsl:if test="assert">
      <p class="asserts-label">Value Contraints:</p>
      <dl class="asserts">
        <xsl:apply-templates select="assert" />
      </dl>
    </xsl:if>
  </xsl:template>

  <xsl:template match="assert">
    <dt class="assert">
      <xsl:value-of select="@check" />
      <xsl:if test="@value | @method | @field">
        <xsl:text>:</xsl:text>
      </xsl:if>
    </dt>
    <dd class="assert">
      <xsl:value-of select="concat(@value, ' ')" />
      <xsl:if test="@method">
        <xsl:value-of select="concat('method=', @method, ' ')" />
      </xsl:if>
      <xsl:if test="@field">
        <xsl:value-of select="concat('field=', @field)" />
      </xsl:if>
    </dd>
  </xsl:template>

  <xsl:template name="render-link-to-toc">
    <a class="back" href="#toc">(back to toc)</a>
  </xsl:template>

  <xsl:template name="render-link-to-classes-summary">
    <a class="back" href="#classes-summary">(back to summary)</a>
  </xsl:template>

  <xsl:template name="capitalise">
    <xsl:param name="s"/>
    <xsl:variable name="first" select="translate(substring($s, 1, 1), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
    <xsl:value-of select="concat($first, substring($s, 2))"/>
  </xsl:template>

</xsl:stylesheet>
