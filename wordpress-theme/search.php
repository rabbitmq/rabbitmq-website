<?php get_header(); ?>
<div id="left-content">
<?php if (have_posts()) : ?>
  <h1 class="pagetitle">Search Results</h1>
  <div class="navigation">
    <div class="alignleft"><?php next_posts_link('&laquo; Older Entries') ?></div>
    <div class="alignright"><?php previous_posts_link('Newer Entries &raquo;') ?></div>
  </div>

  <?php while (have_posts()) : the_post(); ?>
  <div class="post">
    <h3 id="post-<?php the_ID(); ?>"><a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>"><?php the_title(); ?></a></h3>
    <small><?php the_time('l, F jS, Y') ?></small>
    <p class="postmetadata"><?php the_tags('Tags: ', ', ', '<br />'); ?> Posted in <?php the_category(', ') ?> | <?php edit_post_link('Edit', '', ' | '); ?>  <?php comments_popup_link('No Comments &#187;', '1 Comment &#187;', '% Comments &#187;'); ?></p>
  </div>

  <?php endwhile; ?>

  <div class="navigation">
    <div class="alignleft"><?php next_posts_link('&laquo; Older Entries') ?></div>
    <div class="alignright"><?php previous_posts_link('Newer Entries &raquo;') ?></div>
  </div>

<?php else : ?>

  <h2 class="center">No posts found. Try a different search?</h2>
  <?php include (TEMPLATEPATH . '/searchform.php'); ?>

<?php endif; ?>
</div>
<?php get_sidebar(); ?>
<?php get_footer(); ?>
