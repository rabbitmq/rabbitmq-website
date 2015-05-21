<?xml version="1.0" encoding="utf-8"?>
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
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
                xmlns:atom="http://www.w3.org/2005/Atom"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
		version="1.0">
  <xsl:output method="xml"/>

  <!-- Atom spec: http://tools.ietf.org/html/rfc4287 -->

  <xsl:param name="updated"/>

  <xsl:template match="/">
    <atom:feed>
      <xsl:apply-templates select="html/head"/>
      <atom:updated><xsl:value-of select="$updated"/></atom:updated>
      <xsl:apply-templates select="xhtml:html/xhtml:body/doc:feed/doc:item">
        <xsl:sort select="doc:date/@iso" order="descending"/>
      </xsl:apply-templates>
    </atom:feed>
  </xsl:template>

  <xsl:template match="/xhtml:html/xhtml:head">
    <!-- For our feed ID, the URL is as good as anything, even if it's a bit confusing.
    See http://diveintomark.org/archives/2004/05/28/howto-atom-id -->
    <atom:id>http://www.rabbitmq.net/news.atom</atom:id>
    <atom:link rel="self" href="http://www.rabbitmq.net/news.atom"/>
    <atom:link rel="alternate" type="text/html" href="http://www.rabbitmq.net/news.html"/>
    <atom:title type="text"><xsl:value-of select="title"/></atom:title>
      <!--
          We transgressively omit the author, since there isn't a sensible value
      <atom:author>
      </atom:author>
      -->
  </xsl:template>

  <xsl:template match="doc:item">
    <atom:entry>
      <!-- For entry IDs, there's no good candidate.  But we use the date anyway.  -->
      <atom:id>tag:rabbitmq.net,2007:<xsl:value-of select="doc:date/@iso"/></atom:id>
      <atom:title type="text"><xsl:value-of select="doc:title"/></atom:title>
      <atom:updated><xsl:value-of select="doc:date/@iso"/></atom:updated>
      <atom:content type="xhtml">
        <xhtml:div>
          <xsl:apply-templates select="doc:text/*|doc:text/text()" mode="xhtml"/>
        </xhtml:div>
      </atom:content>
    </atom:entry>
  </xsl:template>

  <!-- The source document content is in the null namespace, but for Atom
  we need either escaped HTML or something in the XHTML namespace -->

  <xsl:template match="text()" mode="xhtml">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template match="*" mode="xhtml">
    <xsl:element namespace="http://www.w3.org/1999/xhtml" name="{local-name()}">
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates select="node()|text()" mode="xhtml"/>
    </xsl:element>
  </xsl:template>

</xsl:stylesheet>
