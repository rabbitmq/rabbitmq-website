<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml"
                xmlns:x="http://www.rabbitmq.com/2011/extensions"
                xmlns:c="http://www.rabbitmq.com/namespaces/ad-hoc/conformance"
                exclude-result-prefixes="x c">

  <xsl:import href="page.xsl" />
  <xsl:output method="html" indent="yes" />

  <xsl:variable name="spec-doc" select="document('resources/specs/amqp0-9-1.unmodified.xml')"/>
  <xsl:variable name="specification" select="document('specification.xml')" />
  <xsl:key name="method-key" match="c:method" use="@name" />
  <xsl:key name="domain-key" match="domain" use="@name"/>

  <xsl:template match="x:insert-spec-here">
    <div id="content-pane">
      <h2>AMQP 0-9-1 Reference Guide</h2>
      <xsl:call-template name="render-disclaimer" />
      <!-- switch context from source file to spec doc -->
      <xsl:for-each select="$spec-doc/amqp">
          <xsl:call-template name="render-toc" />
          <xsl:call-template name="render-summary" />
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
        <a href="#protocol-info">Protocol Information</a>
      </li>
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
      original specification</a> is released under the <a href="http://www.amqp.org/confluence/display/AMQP/AMQP+License">AMQP license</a>.
    </p>
    <p>
      Elsewhere on this site you can read details of <a href="specification.html">RabbitMQ's conformance
      to the specification</a>. Please also be aware that RabbitMQ implements <a href="extensions.html">several extensions</a>
      to the core specification that are not documented here.
    </p>
    <div>
      <h3 id="protocol-info" class="inline-block">Protocol Information</h3>
      <xsl:call-template name="render-link-to-toc"/>
    </div>
    <dl>
      <dt>Major-minor version:</dt>
      <dd><xsl:value-of select="concat(@major, '-', @minor)" /></dd>
      <dt>Revision:</dt>
      <dd><xsl:value-of select="@revision" /></dd>
      <dt>Port:</dt>
      <dd><xsl:value-of select="@port" /></dd>
      <dt>Description:</dt>
      <dd><xsl:value-of select="@comment" /></dd>
    </dl>
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
    <xsl:apply-templates select="class" />
    <hr />
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
    <hr />
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
        <a href="{concat('#class.', @name)}"><xsl:value-of select="@name"/></a>
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
        <xsl:variable name="method-id" select="concat('#', ../@name, '.', @name)" />
        <xsl:choose>
          <xsl:when test="position() = 1">
            <td>
              <a href="{$method-id}">
                <xsl:value-of select="@name" />
              </a>
            </td>
            <td><xsl:value-of select="@index"/></td>
            <td><xsl:value-of select="$label" /></td>
          </xsl:when>
          <xsl:otherwise>
            <tr>
              <td>
                <a href="{$method-id}">
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
    <tr id="{concat('constant.', @name)}">
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
    <tr id="{concat('domain.', @name)}">
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
      </td>
    </tr>
  </xsl:template>

  <xsl:template match="class">
    <div id="{concat('class.', @name)}" class="class">
    <h3 class="inline-block">
      <xsl:value-of select="@name"/>
    </h3>
    <p><xsl:apply-templates select="doc"/></p>
    <xsl:call-template name="render-rules" />
    <xsl:call-template name="render-fields" />
    <xsl:call-template name="render-methods" />
    </div>
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
    <h5 id="{$method-name}" class="method-sig">
      <div class="method-name">
        <xsl:value-of select="@name"/>
        <xsl:text>(</xsl:text>
      </div>
      <div class="method-params">
        <xsl:apply-templates select="field" mode="render-method-sig"/>
        <xsl:text>)</xsl:text>
        <xsl:if test="response">
          <span class="method-retval">
          <xsl:text> &#x2794; </xsl:text>
          <a class="sync-response-method" href="{concat('#', ../@name, '.', response/@name)}">
            <xsl:value-of select="response/@name" />
          </a>
          </span>
        </xsl:if>
      </div>
    </h5>
    <dl>
      <dt>ID:</dt>
      <dd>
        <xsl:value-of select="@index"/>
      </dd>
      <dt>Synchronous:</dt>
      <dd>
        <xsl:choose>
          <xsl:when test="@synchronous = '1'">
            <xsl:text>yes</xsl:text>
          </xsl:when>
          <xsl:otherwise>no</xsl:otherwise>
        </xsl:choose>
      </dd>
      <xsl:for-each select="$specification">
        <xsl:for-each select="key('method-key', $method-name)">
          <dt>RabbitMQ support:</dt>
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
    <p>
      <xsl:apply-templates select="doc" />
    </p>
    <xsl:call-template name="render-rules" />
    <xsl:call-template name="render-parameters" />
    <xsl:call-template name="render-link-to-classes-summary"/>
    <xsl:if test="position() != last()">
      <hr/>
    </xsl:if>
  </xsl:template>

  <xsl:template match="field" mode="render-method-sig">
	<a href="{concat('#', ../../@name, '.', ../@name, '.', @name)}">
      <span class="parameter">
        <xsl:if test="@domain">
	      <span class="data-type" title="{key('domain-key', @domain)/@type}">
		    <xsl:value-of select="@domain"/>
	      </span>
          <xsl:text>&#xA0;</xsl:text>
        </xsl:if>
        <span class="param-name" title="{@label}">
          <xsl:value-of select="@name"/>
        </span>
      </span>
    </a>
    <xsl:if test="position() != last()">
      <xsl:text>, </xsl:text>
    </xsl:if>
  </xsl:template>

  <xsl:template name="render-rules">
    <xsl:if test="rule">
      <ul class="rules">
        <xsl:for-each select="rule">
          <li>
            <xsl:apply-templates />
            <xsl:if test="@on-failure">
              <span>Error code: </span>
              <a href="{concat('#constant.', @on-failure)}">
                <xsl:value-of select="@on-failure"/>
              </a>
            </xsl:if>
          </li>
        </xsl:for-each>
      </ul>
    </xsl:if>
  </xsl:template>

  <xsl:template name="render-fields">
    <xsl:if test="field">
      <h4>Fields</h4>
      <p>The <em><xsl:value-of select="@name" /></em> class defines the following fields:</p>
      <xsl:call-template name="render-field-list"/>
    </xsl:if>
  </xsl:template>

  <xsl:template name="render-parameters">
    <xsl:if test="field">
      <h5>Parameters:</h5>
      <xsl:call-template name="render-field-list"/>
    </xsl:if>
  </xsl:template>

  <xsl:template name="render-field-list">
      <xsl:for-each select="field">
        <p id="{concat(../../@name, '.', ../@name, '.', @name)}" class="field">
          <xsl:if test="@domain">
            <a href="{concat('#domain.', @domain)}" title="{key('domain-key', @domain)/@type}">
              <xsl:value-of select="@domain"/>
            </a>
            <xsl:text> </xsl:text>
          </xsl:if>
  		  <span title="{@label}" class="field-name"><xsl:value-of select="@name"/></span>
        </p>
        <xsl:if test="doc | @label">
          <p class="param-desc">
            <xsl:choose>
              <xsl:when test="doc">
                <xsl:apply-templates select="doc"/>
              </xsl:when>
              <xsl:when test="@label">
                <xsl:call-template name="capitalise">
                  <xsl:with-param name="s" select="@label"/>
                </xsl:call-template>
                <xsl:text>.</xsl:text>
              </xsl:when>
            </xsl:choose>
          </p>
        </xsl:if>
        <xsl:call-template name="render-rules" />
      </xsl:for-each>
  </xsl:template>

  <xsl:template match="doc[not(@type)]">
    <xsl:value-of select="." />
  </xsl:template>

  <xsl:template match="doc[@type='grammar']">
    <p class="grammar-label">Class Grammar:</p>
    <pre class="code">
      <xsl:value-of select="." />
    </pre>
  </xsl:template>
  
  <xsl:template match="doc[@type='scenario']">
    <!-- noop -->
  </xsl:template>

  <xsl:template name="render-disclaimer">
    <xsl:comment> Note: the element IDs in the content section of this document are autogenerated and therefore subject to change </xsl:comment>
  </xsl:template>

  <xsl:template name="render-link-to-toc">
    <a class="back totoc" href="#toc">(back to toc)</a>
  </xsl:template>

  <xsl:template name="render-link-to-classes-summary">
    <a class="back tosummary" href="#classes-summary">(back to summary)</a>
  </xsl:template>

  <xsl:template name="capitalise">
    <xsl:param name="s"/>
    <xsl:variable name="first" select="translate(substring($s, 1, 1), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
    <xsl:value-of select="concat($first, substring($s, 2))"/>
  </xsl:template>

</xsl:stylesheet>
