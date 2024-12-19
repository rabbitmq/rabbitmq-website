/**
 * Docusaurus uses SVGR internally, which in turn uses SVGO. This alters the
 * SVGO config and merges the changes back into Docusaurus' webpack config.
 *
 * @returns {Object}
 *
 * https://stackoverflow.com/questions/75990030/docusaurus-strips-some-attributes-from-inline-svgs-need-id-for-accessibility
 */
function configureSvgo() {
  return {
    name: 'configure-svgo',
    configureWebpack(config) {
      const path = require('path');
      /** @type {object[]} */
      const rules = config.module.rules;

      const rule = rules.find((rule) => {
        /** @type {string|undefined} */
        const loader = rule.oneOf?.[0]?.use?.[0]?.loader;
        return loader && loader.includes(path.sep + "@svgr" + path.sep);
      });

      const svgoConfig = rule.oneOf[0].use[0].options.svgoConfig;
      svgoConfig.plugins = [
        'removeDoctype',
        'removeXMLProcInst',
        'removeComments',
        'removeEditorsNSData',
        'removeUnknownsAndDefaults',
        'removeUnusedNS',
        'convertStyleToAttrs',
      ];

      //const util = require('util');
      //console.log(util.inspect(rule, false, null, true));

      return {
        mergeStrategy: {
          "module.rules": "replace"
        },
        module: { rules }
      };
    }
  };
}

module.exports = configureSvgo;
