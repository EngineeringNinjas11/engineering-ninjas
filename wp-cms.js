// Engineering Ninjas — WordPress.com connection

const WP_API =
  'https://public-api.wordpress.com/rest/v1.1/sites/engineeringninjas.wordpress.com';

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
  return post?.featured_image || '';
}

function postCategories(post) {
  const categories = post?.terms?.category || {};
  return Object.values(categories).map(c => c.name);
}

function postCard(post) {
  const img = postImage(post);

  const excerpt = stripHtml(
    post.excerpt || post.content || ''
  ).slice(0, 150);

  const title = decodeHtml(post.title || 'Untitled');
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

async function getPosts(params = 'number=12') {
  const res = await fetch(`${WP_API}/posts/?${params}`);

  if (!res.ok) {
    throw new Error(`WordPress API error ${res.status}`);
  }

  const data = await res.json();

  return data.posts || [];
}

async function getPostBySlug(slug) {
  const res = await fetch(
    `${WP_API}/posts/slug:${encodeURIComponent(slug)}`
  );

  if (!res.ok) {
    throw new Error(`WordPress API error ${res.status}`);
  }

  const post = await res.json();

  return post || null;
}

async function getPostsForCategory(name) {

  const posts = await getPosts('number=100');

  return posts.filter(post =>
    postCategories(post).some(
      category =>
        category.toLowerCase() === name.toLowerCase()
    )
  );
}
