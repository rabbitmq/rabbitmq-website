import {visit} from 'unist-util-visit';
import {h} from 'hastscript';
const _ = require('lodash');

const plugin = (options) => {
    const transformer = async (ast) => {
        // only images
        visit(ast, { name: "img" }, (node, index, parentNode) => {
            const altAttribute = node.attributes.find(a => a.name === "alt")
            var alt = altAttribute === undefined ? undefined : altAttribute.value
            alt = alt === "" ? undefined : alt
            const hasCaption = parentNode.children
                .findIndex(c => c.name === "figcaption") === -1 ? false : true
            const parentIsParagraph = parentNode.tagName === "p" ? true : false
            if (alt === undefined || hasCaption || !parentIsParagraph) {
                // nothing to do if there is no text
                return
            } else {
                const altCaption = alt.split('|')
                var caption
                if (altCaption.length === 2 && altCaption[1] === '') {
                    // "alt|", only alt attribute
                    altAttribute.value = altCaption[0]
                    node.attributes.filter(a => a.name !== "alt").unshift(altAttribute)
                    return
                } else if (altCaption.length === 2) {
                    // "alt|caption", alt and caption are different
                    alt = altCaption[0]
                    caption = altCaption[1]
                } else if (altCaption.length === 1) {
                    // "alt-caption", same value for alt and caption
                    alt = altCaption[0]
                    caption = altCaption[0]
                } else {
                    return
                }
                // we switch the original alt attribute with the correct (split) one
                altAttribute.value = alt
                node.attributes.filter(a => a.name !== "alt").unshift(altAttribute)
                // we add the figure and the caption, the original node sits in the middle
                const figure = h("figure", {}, [
                    node,
                    h("figcaption", _.unescape(caption))
                ])
                parentNode.children = [figure]
            }
        });
    };
    return transformer;
};

export default plugin;
