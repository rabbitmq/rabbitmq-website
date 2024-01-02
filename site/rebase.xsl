<?xml version="1.0" encoding="UTF-8"?>
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
                xmlns="http://www.w3.org/1999/xhtml"
                xmlns:html="http://www.w3.org/1999/xhtml"
                xmlns:doc="https://www.rabbitmq.com/namespaces/ad-hoc/doc"
                version="1.0">

<!--
 Optional post-processing transformation that adds
 a base virtual directory to hyperlinks and images
-->

<xsl:output method="xml" media-type="text/html" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" omit-xml-declaration="yes" indent="yes" encoding="UTF-8"/>
<xsl:param name="link-prefix"/>

  <xsl:template match="*/@*[name() = 'href' or name() = 'src']">
    <xsl:choose>
      <xsl:when test="contains(., '://')">
        <xsl:copy/>
      </xsl:when>
      <xsl:when test="not(starts-with(., '/'))">
        <xsl:copy/>
      </xsl:when>
      <xsl:when test="starts-with(., '/releases')">
        <xsl:copy/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:attribute name="{name()}">
            <xsl:value-of select="'/'" />
            <xsl:value-of select="$link-prefix" />
            <xsl:value-of select="." />
        </xsl:attribute>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="doc:style">
    <style>
      <xsl:apply-templates select="*" />
    </style>
  </xsl:template>
  <xsl:template match="doc:body">
    body { <xsl:apply-templates select="*" /> }
  </xsl:template>
  <xsl:template match="doc:background">
    background: <xsl:apply-templates select="*" />
  </xsl:template>
  <xsl:template match="doc:url">
    url(/<xsl:value-of select="$link-prefix" /><xsl:value-of select="text()" />);
  </xsl:template>

  <xsl:template match="*|@*">
    <xsl:copy>
      <xsl:apply-templates select="node()|@*" />
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
