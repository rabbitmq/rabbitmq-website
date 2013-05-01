<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml"
                xmlns:html="http://www.w3.org/1999/xhtml"
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

  <xsl:template match="*|@*">
    <xsl:copy>
      <xsl:apply-templates select="node()|@*" />
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
