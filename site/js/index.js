/* index.js */

/* Remove 'release' from release titles on homepage feed */
var feedLinks = document.getElementById("intro").getElementsByTagName("a");
for(var i = 0, max = feedLinks.length; i < max; i++) 
{
  feedLinks[i].innerHTML = feedLinks[i].innerHTML.replace('release','');
}