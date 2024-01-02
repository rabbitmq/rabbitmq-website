<?xml version="1.0" encoding="utf-8"?>
<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml"
                xmlns:x="https://www.rabbitmq.com/2011/extensions"
                exclude-result-prefixes="x">

  <xsl:import href="page.xsl" />
  <xsl:output method="html" indent="yes" />

  <xsl:variable name="spec-doc" select="document('resources/specs/amqp0-9-1.extended.xml')"/>
  <xsl:key name="domain-key" match="domain" use="@name"/>

  <xsl:template match="x:insert-spec-here">
    <div id="content-pane">
      <!-- switch context from source file to spec doc -->
      <xsl:for-each select="$spec-doc/amqp">
          <xsl:call-template name="render-content" />
      </xsl:for-each>
      <xsl:if test="not($spec-doc/amqp)">
        <p/>
        <em>Oops! Failed to load amqp-0-9-1.xml source file</em>
      </xsl:if>
    </div>
  </xsl:template>

  <xsl:template name="in-this-page">
    <div class="in-this-page">
      <h4>In This Page</h4>
      <ul>
        <li>
          <a href="#protocol-info">Protocol Information</a>
        </li>
        <li>
          <a href="#classes">Classes</a>
          <ul>
            <xsl:for-each select="$spec-doc/amqp">
              <xsl:apply-templates select="class" mode="summary"/>
            </xsl:for-each>
          </ul>
        </li>
        <li>
          <a href="#domains">Domains</a>
        </li>
        <li>
          <a href="#constants">Constants</a>
        </li>
      </ul>
    </div>
  </xsl:template>

  <xsl:template name="render-content">
    <p>
      This page contains a complete reference to RabbitMQ's implementaton of version 0-9-1 of the AMQP specification. The
      <a href="resources/specs/amqp0-9-1.xml">original specification</a> was published by
      the <a href="http://www.amqp.org">AMQP WG</a> in 2008 and is made available under the
      <a href="http://www.amqp.org/legal/amqp-license">AMQP license</a>.
    </p>
    <p>
      Elsewhere on this site you can read details of <a href="specification.html">RabbitMQ's conformance
      to the specification</a>. RabbitMQ implements <a href="extensions.html">several extensions</a>
      to the core specification that are documented in this guide. The original and extended
      specification downloads can be found on the <a href="protocol.html">protocol page</a>.
    </p>
    <p>
      You may also be interested in our <a href="amqp-0-9-1-quickref.html">Protocol &amp; API Quick Reference</a>.
    </p>
    <div>
      <h3 id="protocol-info" class="inline-block">Protocol Information</h3>
      <xsl:call-template name="render-link-to-top"/>
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
      <h3 id="classes" class="inline-block">Classes</h3>
      <xsl:call-template name="render-link-to-top"/>
    </div>
    <p>The following classes, with their associated methods, are defined in the specification:</p>
    <xsl:apply-templates select="class" />
    <hr />
    <div>
      <h3 id="domains" class="inline-block">Domains</h3>
      <xsl:call-template name="render-link-to-top"/>
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
        <xsl:apply-templates select="domain">
          <xsl:sort select="@name" data-type="text" order="ascending"/>
        </xsl:apply-templates>
      </tbody>
    </table>
    <hr />
    <div>
      <h3 id="constants" class="inline-block">Constants</h3>
      <xsl:call-template name="render-link-to-top"/>
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
        <xsl:apply-templates select="constant"/>
      </tbody>
    </table>
  </xsl:template>

  <xsl:template match="class" mode="summary">
    <li><a href="{concat('#class.', @name)}"><xsl:value-of select="@name"/></a></li>
  </xsl:template>

  <xsl:template match="constant">
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

  <xsl:template match="domain">
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
    <p>
      <xsl:call-template name="capitalise">
        <xsl:with-param name="s" select="@label"/>
      </xsl:call-template>
      <xsl:text>.</xsl:text>
    </p>
    <p><xsl:apply-templates select="doc"/></p>
    <xsl:call-template name="render-rules" />
    <xsl:call-template name="render-fields" />
    <xsl:call-template name="render-methods" />
    </div>
  </xsl:template>

  <xsl:template name="render-methods">
    <xsl:if test="method">
      <h4>Methods</h4>
      <xsl:apply-templates select="method" />
    </xsl:if>
  </xsl:template>

  <xsl:template match="method">
    <xsl:variable name="method-name" select="concat(../@name, '.', @name)" />
    <h5 id="{$method-name}" class="method-sig">
      <div class="method-name" title="{concat(@name, ' - id:', @index)}">
        <xsl:value-of select="@name"/>
        <xsl:text>(</xsl:text>
      </div>
      <div class="method-params">
        <xsl:apply-templates select="field" mode="render-method-sig"/>
        <xsl:text>)</xsl:text>
        <xsl:if test="response">
          <span class="method-retval">
          <xsl:text>&#xA0;&#x2794;&#xA0;</xsl:text>
          <xsl:apply-templates select="response" mode="render-method-sig"/>
          </span>
        </xsl:if>
      </div>
    </h5>
    <p>
       <xsl:call-template name="capitalise">
         <xsl:with-param name="s" select="@label"/>
       </xsl:call-template>
       <xsl:text>.</xsl:text>
    </p>
    <p>
      <xsl:apply-templates select="doc" />
    </p>
    <xsl:call-template name="render-rules" />
    <xsl:call-template name="render-parameters" />
    <xsl:call-template name="render-link-to-top"/>
    <xsl:if test="position() != last()">
      <hr/>
    </xsl:if>
  </xsl:template>

  <xsl:template match="field" mode="render-method-sig">
    <a href="{concat('#', ../../@name, '.', ../@name, '.', @name)}">
      <span class="parameter">
        <xsl:choose>
          <xsl:when test="@domain">
            <span class="data-type" title="{key('domain-key', @domain)/@type}">
              <xsl:value-of select="@domain"/>
            </span>
            <xsl:text>&#xA0;</xsl:text>
          </xsl:when>
          <xsl:when test="@type">
            <!-- 'reserved' parameters use @type rather than @domain -->
            <span class="data-type" title="{@type}">
              <xsl:value-of select="@type"/>
            </span>
            <xsl:text>&#xA0;</xsl:text>
          </xsl:when>
        </xsl:choose>
        <span class="param-name" title="{@label}">
          <xsl:value-of select="@name"/>
        </span>
      </span>
    </a>
    <xsl:if test="position() != last()">
      <xsl:text>, </xsl:text>
    </xsl:if>
  </xsl:template>

  <xsl:template match="response" mode="render-method-sig">
    <a href="{concat('#', ../../@name, '.', @name)}">
      <xsl:value-of select="@name" />
    </a>
    <xsl:if test="position() != last()">
      <xsl:text> | </xsl:text>
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
      <table class="fields-table">
        <thead>
          <tr>
            <th>Definition</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <xsl:for-each select="field">
            <xsl:call-template name="render-field"/>
          </xsl:for-each>
        </tbody>
      </table>
    </xsl:if>
  </xsl:template>

  <xsl:template name="render-field">
    <tr>
      <td>
        <xsl:if test="@domain">
          <a href="{concat('#domain.', @domain)}" title="{key('domain-key', @domain)/@type}">
            <xsl:value-of select="@domain"/>
          </a>
          <xsl:text> </xsl:text>
        </xsl:if>
        <span title="{@label}" class="field-name"><xsl:value-of select="@name"/></span>
      </td>
      <td>
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
      </td>
    </tr>
  </xsl:template>

  <xsl:template name="render-parameters">
    <xsl:if test="field">
      <h5>Parameters:</h5>
      <xsl:for-each select="field">
        <xsl:call-template name="render-parameter"/>
      </xsl:for-each>
    </xsl:if>
  </xsl:template>

  <xsl:template name="render-parameter">
    <p id="{concat(../../@name, '.', ../@name, '.', @name)}" class="field">
      <xsl:choose>
        <xsl:when test="@domain">
          <a href="{concat('#domain.', @domain)}" title="{key('domain-key', @domain)/@type}">
            <xsl:value-of select="@domain"/>
          </a>
          <xsl:text> </xsl:text>
        </xsl:when>
        <xsl:when test="@type">
          <!-- 'reserved' parameters use @type rather than @domain -->
          <a href="{concat('#domain.', @type)}" title="{@type}">
            <xsl:value-of select="@type"/>
          </a>
          <xsl:text> </xsl:text>
        </xsl:when>
      </xsl:choose>
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

  <xsl:template name="render-link-to-top">
    <a class="back" href="#">(back to top)</a>
  </xsl:template>

  <xsl:template name="capitalise">
    <xsl:param name="s"/>
    <xsl:variable name="first" select="translate(substring($s, 1, 1), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
    <xsl:value-of select="concat($first, substring($s, 2))"/>
  </xsl:template>

</xsl:stylesheet>
