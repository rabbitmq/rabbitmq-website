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
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:doc="https://www.rabbitmq.com/namespaces/ad-hoc/doc"
                xmlns="http://www.w3.org/2005/Atom"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                exclude-result-prefixes="xhtml doc"
                version="1.0">
  <xsl:output method="xml"/>

  <!-- Atom spec: http://tools.ietf.org/html/rfc4287 -->

  <xsl:param name="updated"/>

  <xsl:template match="/">
    <feed>
      <xsl:apply-templates select="xhtml:html/xhtml:head"/>
      <xsl:choose>
        <xsl:when test="$updated">
          <updated><xsl:value-of select="$updated"/></updated>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates select="xhtml:html/xhtml:body/doc:feed/doc:item/doc:date">
            <xsl:sort select="@iso" order="descending" />
          </xsl:apply-templates>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="xhtml:html/xhtml:body/doc:feed/doc:item">
        <xsl:sort select="doc:date/@iso" order="descending"/>
      </xsl:apply-templates>
    </feed>
  </xsl:template>

  <xsl:template match="xhtml:head">
    <!-- For our feed ID, the URL is as good as anything, even if it's a bit confusing.
    See http://diveintomark.org/archives/2004/05/28/howto-atom-id -->
    <id>https://www.rabbitmq.com/news.atom</id>
    <link rel="self" href="https://www.rabbitmq.com/news.atom"/>
    <link rel="alternate" type="text/html" href="https://www.rabbitmq.com/news.html"/>
    <title type="text"><xsl:value-of select="xhtml:title"/></title>
      <!--
          We transgressively omit the author, since there isn't a sensible value
      <author>
      </author>
      -->
  </xsl:template>

  <xsl:template match="doc:item">
    <entry>
      <!-- For entry IDs, there's no good candidate.  But we use the date anyway.  -->
      <id>tag:rabbitmq.com,2007:<xsl:value-of select="doc:date/@iso"/></id>
      <title type="text"><xsl:value-of select="doc:title"/></title>
      <updated><xsl:value-of select="doc:date/@iso"/></updated>
      <author>
          <name>RabbitMQ</name>
          <uri>https://www.rabbitmq.com/</uri>
          <email>rabbitmq-core@groups.vmware.com</email>
      </author>
      <content type="xhtml">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <xsl:apply-templates select="doc:text/*|doc:text/text()" mode="xhtml"/>
        </div>
      </content>
    </entry>
  </xsl:template>

  <!-- The source document content is in the null namespace, but for Atom
  we need either escaped HTML or something in the XHTML namespace -->

  <xsl:template match="text()" mode="xhtml">
    <xsl:value-of select="translate(., '&#x99;', '')"/>
  </xsl:template>

  <xsl:template match="*" mode="xhtml">
    <xsl:element namespace="http://www.w3.org/1999/xhtml" name="{local-name()}">
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates select="node()|text()" mode="xhtml"/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="doc:date">
    <xsl:if test="position() = 1">
      <updated><xsl:value-of select="@iso" /></updated>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
