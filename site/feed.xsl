<?xml version="1.0" encoding="utf-8" ?>
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
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
                xmlns:rss1="http://purl.org/rss/1.0/"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                xmlns:atom="http://www.w3.org/2005/Atom"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:doc="https://www.rabbitmq.com/namespaces/ad-hoc/doc"
                xmlns:x="https://www.rabbitmq.com/2011/extensions"
                xmlns="http://www.w3.org/1999/xhtml"
                exclude-result-prefixes="rss1 rdf atom dc x"
                >

  <x:months>
    <x:month>Jan</x:month>
    <x:month>Feb</x:month>
    <x:month>Mar</x:month>
    <x:month>Apr</x:month>
    <x:month>May</x:month>
    <x:month>Jun</x:month>
    <x:month>Jul</x:month>
    <x:month>Aug</x:month>
    <x:month>Sep</x:month>
    <x:month>Oct</x:month>
    <x:month>Nov</x:month>
    <x:month>Dec</x:month>
  </x:months>

  <xsl:template match="doc:homefeed">
    <xsl:apply-templates select="document(@src)/*">
      <xsl:with-param name="type">
        <xsl:choose>
          <xsl:when test="@type">
            <xsl:value-of select="@type"/>
          </xsl:when>
          <xsl:otherwise>none</xsl:otherwise>
        </xsl:choose>
      </xsl:with-param>
      <xsl:with-param name="limit">
        <xsl:choose>
          <xsl:when test="boolean(@limit)">
            <xsl:value-of select="@limit"/>
          </xsl:when>
          <xsl:otherwise>100</xsl:otherwise>
        </xsl:choose>
      </xsl:with-param>
    </xsl:apply-templates>
  </xsl:template>

  <!-- RSS 2.0 is arranged /rss/channel/item -->
  <xsl:template match="/rss">
    <xsl:param name="limit"/>
    <xsl:param name="type"/>
    <xsl:apply-templates select="channel">
      <xsl:with-param name="limit" select="$limit"/>
      <xsl:with-param name="type" select="$type"/>
    </xsl:apply-templates>
  </xsl:template>

  <!-- RSS 1.0 is arranged /rdf:RDF/rss1:item -->
  <xsl:template match="channel|rdf:RDF|atom:feed">
    <xsl:param name="limit" select="100"/>
    <xsl:param name="type"/>
    <ol class="feed">
      <xsl:for-each select="(item|rss1:item|atom:entry)[position() &lt;= $limit]">
        <li>
          <xsl:choose>

            <xsl:when test="$type = 'ournews'">
              <xsl:variable name="itemdate" select="pubDate|rss1:pubDate|atom:updated"/>
              <span class="news-date">
                <xsl:call-template name="date-format">
                  <xsl:with-param name="date" select="substring($itemdate, 0, 11)"/>
                </xsl:call-template>
              </span>
              <a href="./news.html#{$itemdate}"><xsl:value-of select="title|rss1:title|atom:title"/></a>
              <br/>
            </xsl:when>

            <xsl:otherwise>
              <a href="{link|rss1:link|atom:link/@local}"><xsl:value-of select="title|rss1:title|atom:title"/></a>
              <br/>
            </xsl:otherwise>
          </xsl:choose>

          <xsl:choose>
            <xsl:when test="$type = 'ourblog'">
              <xsl:variable name="pub" select="pubDate|rss1:pubDate|atom:pubDate"/>
              <span class="news-date"><xsl:value-of select="substring($pub, 5, 12)"/></span>
              <span class="blog-author">
                <xsl:value-of select="dc:creator|rss1:author|atom:author"/>
              </span>
            </xsl:when>
          </xsl:choose>
        </li>
      </xsl:for-each>
    </ol>
  </xsl:template>

  <xsl:template name="date-format">
    <xsl:param name="date" />
    <xsl:variable name="year" select="substring($date, 1, 4)" />
    <xsl:variable name="month" select="substring($date, 6, 2)" />
    <xsl:variable name="day" select="substring($date, 9, 2)" />
    <xsl:variable name="s-month">
      <xsl:choose>
        <xsl:when test="number($month) != number($month) or $month &lt; 1 or $month &gt; 12">
          <xsl:value-of select="'   '"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="document('')/xsl:stylesheet/x:months/x:month[position() = $month]" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:value-of select="concat($day, ' ', $s-month, ' ', $year)" />
  </xsl:template>

</xsl:stylesheet>
