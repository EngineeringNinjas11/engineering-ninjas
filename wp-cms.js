// Engineering Ninjas — WordPress.com connection

const WP_API =
  'https://public-api.wordpress.com/wp/v2/sites/engineeringninjas.wordpress.com';

function stripHtml(html = '') {
  const d = document.createElement('div');
  d.innerHTML = html;
  return (d.textContent || d.innerText || '').trim();
}

function decodeHtml(html = '') {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || d.innerText || '';
}

function postImage(post) {
  return post?._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
}

function postCategories(post) {
  const terms = post?._embedded?.['wp:term'] || [];
  const categories = terms.flat().filter(t => t.taxonomy === 'category');
  return categories.map(c => c.name);
}

function postCard(post) {
  const img = postImage(post);

  const excerpt = stripHtml(
    post.excerpt?.rendered || post.content?.rendered || ''
  ).slice(0, 150);

  const title = decodeHtml(post.title?.rendered || 'Untitled');
  const slug = post.slug || '';

  const categories = postCategories(post);
  const category = categories[0] || 'ENGINEERING';

  return `
    <article class="article-card">

      ${
        img
          ? `<img class="article-cover" src="${img}" alt="${title.replace(/"/g, '&quot;')}">`
          : `<div class="article-icon">⚡</div>`
      }

      <div class="article-card-content">

        <div class="article-category">
          ${category}
        </div>

        <h3>${title}</h3>

        <p>
          ${excerpt}${excerpt.length >= 150 ? '…' : ''}
        </p>

        <a href="article.html?slug=${encodeURIComponent(slug)}">
          Read article →
        </a>

      </div>

    </article>
  `;
}

async function getPosts(params = 'per_page=12&_embed=1') {
  const res = await fetch(`${WP_API}/posts?${params}`);

  if (!res.ok) {
    throw new Error(`WordPress API error ${res.status}`);
  }

  return await res.json();
}

async function getPostBySlug(slug) {
  const res = await fetch(
    `${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed=1`
  );

  if (!res.ok) {
    throw new Error(`WordPress API error ${res.status}`);
  }

  const posts = await res.json();

  return posts[0] || null;
}

async function getPostsForCategory(name) {
  const res = await fetch(
    `${WP_API}/posts?per_page=100&_embed=1`
  );

  if (!res.ok) {
    throw new Error(`WordPress API error ${res.status}`);
  }

  const posts = await res.json();

  return posts.filter(post =>
    postCategories(post).some(
      category => category.toLowerCase() === name.toLowerCase()
    )
  );
}
