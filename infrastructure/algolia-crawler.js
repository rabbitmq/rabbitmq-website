new Crawler({
  appId: "H10VQIW16Y",
  // This needs to be replaced by the API key provided by Algolia. It's not
  // available from the UI (or I couldn't find it) and thus needs to be
  // retrieved from the existing crawler configuration.
  //
  // This MUST NOT be made public as this is a write API key!
  apiKey: "<<API_KEY>>",
  indexPrefix: "",
  rateLimit: 8,
  maxDepth: 10,
  startUrls: ["https://www.rabbitmq.com"],
  sitemaps: ["https://www.rabbitmq.com/sitemap.xml"],
  discoveryPatterns: ["https://www.rabbitmq.com/**"],
  schedule: "at 08:52 on Friday",
  saveBackup: true,
  ignoreCanonicalTo: true,
  ignoreQueryParams: ["source", "utm_*"],
  safetyChecks: { beforeIndexPublishing: { maxLostRecordsPercentage: 30 } },
  actions: [
    // We crawl documentation separately to give this part a higher page rank.
    // Otherwise, blog posts usually come first in the result. Perhaps there is
    // a better alternative, but I don't know it.
    {
      indexName: "rabbitmq.com",
      pathsToMatch: [
        "https://www.rabbitmq.com/docs/**",
        "https://rabbitmq.com/docs/**",
      ],
      recordExtractor: ({ $, helpers }) => {
        // Priority order:
        // deepest active sub list header -> navbar active item -> 'Documentation'
        const lvl0 =
          $(
            ".menu__link.menu__link--sublist.menu__link--active, .navbar__item.navbar__link--active",
          )
            .last()
            .text() || "Documentation";

        return helpers.docsearch({
          recordProps: {
            lvl0: {
              selectors: "",
              defaultValue: lvl0,
            },
            lvl1: ["header h1", "article h1"],
            lvl2: "article h2",
            lvl3: "article h3",
            lvl4: "article h4",
            lvl5: "article h5, article td:first-child",
            lvl6: "article h6",
            content: "article p, article li, article td:last-child",
            pageRank: 30,
          },
          indexHeadings: true,
          aggregateContent: true,
          recordVersion: "v3",
        });
      },
    },

    // Same as above, but for the entire website except the docs and with no
    // specified page rank.
    {
      indexName: "rabbitmq.com",
      pathsToMatch: [
        "https://www.rabbitmq.com/**",
        "https://rabbitmq.com/**",
        "!https://www.rabbitmq.com/docs/**",
        "!https://rabbitmq.com/docs/**",
      ],
      recordExtractor: ({ $, helpers }) => {
        // Priority order:
        // deepest active sub list header -> navbar active item -> 'Documentation'
        const lvl0 =
          $(
            ".menu__link.menu__link--sublist.menu__link--active, .navbar__item.navbar__link--active",
          )
            .last()
            .text() || "Documentation";

        return helpers.docsearch({
          recordProps: {
            lvl0: {
              selectors: "",
              defaultValue: lvl0,
            },
            lvl1: ["header h1", "article h1"],
            lvl2: "article h2",
            lvl3: "article h3",
            lvl4: "article h4",
            lvl5: "article h5, article td:first-child",
            lvl6: "article h6",
            content: "article p, article li, article td:last-child",
          },
          indexHeadings: true,
          aggregateContent: true,
          recordVersion: "v3",
        });
      },
    },
  ],
  initialIndexSettings: {
    "rabbitmq.com": {
      attributesForFaceting: [
        "type",
        "lang",
        "language",
        "version",
        "docusaurus_tag",
      ],
      attributesToRetrieve: [
        "hierarchy",
        "content",
        "anchor",
        "url",
        "url_without_anchor",
        "type",
      ],
      attributesToHighlight: ["hierarchy", "content"],
      attributesToSnippet: ["content:10"],
      camelCaseAttributes: ["hierarchy", "content"],
      searchableAttributes: [
        "unordered(hierarchy.lvl0)",
        "unordered(hierarchy.lvl1)",
        "unordered(hierarchy.lvl2)",
        "unordered(hierarchy.lvl3)",
        "unordered(hierarchy.lvl4)",
        "unordered(hierarchy.lvl5)",
        "unordered(hierarchy.lvl6)",
        "content",
      ],
      distinct: true,
      attributeForDistinct: "url",
      customRanking: [
        "desc(weight.pageRank)",
        "desc(weight.level)",
        "asc(weight.position)",
      ],
      ranking: [
        "words",
        "filters",
        "typo",
        "attribute",
        "proximity",
        "exact",
        "custom",
      ],
      highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
      highlightPostTag: "</span>",
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 7,
      allowTyposOnNumericTokens: false,
      minProximity: 1,
      ignorePlurals: true,
      advancedSyntax: true,
      attributeCriteriaComputedByMinProximity: true,
      removeWordsIfNoResults: "allOptional",
      separatorsToIndex: "_",
    },
  },
});
