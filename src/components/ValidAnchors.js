import useBrokenLinks from '@docusaurus/useBrokenLinks';

export default function ValidAnchors({children}) {
  var raw_anchors = children.props.children;
  var anchors = raw_anchors.split(/\r?\n/);

  const brokenLinks = useBrokenLinks();
  anchors.forEach((anchor) => brokenLinks.collectAnchor(anchor));

  return (<span></span>);
}
