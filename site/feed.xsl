<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
                xmlns:rss1="http://purl.org/rss/1.0/"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                xmlns:atom="http://www.w3.org/2005/Atom"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                >

  <xsl:template match="feed">
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
        <h2><a href="{link|rss1:link|atom:link/@local}"><xsl:value-of select="title|rss1:title|atom:title"/></a></h2>

          <p><xsl:value-of select="description|description|atom:content"  disable-output-escaping="yes"/></p>

         <xsl:choose>
          <xsl:when test="$type = 'ourblog'">
  						<div class="meta">
  							<p>
                <xsl:value-of select="dc:creator|rss1:author|atom:author"/> |
                <xsl:variable name="pub" select="pubDate|rss1:pubDate|atom:pubDate"/>
                <xsl:value-of select="substring($pub, 5, 12)"/> |
                </p>
							</div>
          </xsl:when>
        </xsl:choose>


        </li>
      </xsl:for-each>
    </ol>
  </xsl:template>

</xsl:stylesheet>
