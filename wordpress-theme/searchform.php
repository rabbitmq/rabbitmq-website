<form method="get" id="searchform" action="<?php bloginfo('url'); ?>/">
<div>
<input type="submit" id="searchsubmit" value="Search" />
<input type="text" value="<?php the_search_query(); ?>" name="s" id="s" />
</div>
</form>
