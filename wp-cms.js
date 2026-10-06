// Engineering Ninjas content source
// Write and publish articles in your WordPress.com dashboard.
const WP_API = 'https://engineeringninjas.wordpress.com/wp-json/wp/v2';

function stripHtml(html='') {
  const d = document.createElement('div'); d.innerHTML = html;
  return (d.textContent || d.innerText || '').trim();
}
function decodeHtml(html='') {
  const d = document.createElement('div'); d.innerHTML = html;
  return d.textContent || d.innerText || '';
}
function postImage(post) {
  return post?._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
}
function postCard(post) {
  const img = postImage(post);
  const excerpt = stripHtml(post.excerpt?.rendered || post.content?.rendered || '').slice(0, 150);
  const title = decodeHtml(post.title?.rendered || 'Untitled');
  return `<article class="article-card">${img ? `<img class="article-cover" src="${img}" alt="${title.replace(/"/g,'&quot;')}">` : `<div class="article-image electrical">⚡</div>`}<div class="article-body"><span class="tag">Engineering</span><h3>${title}</h3><p>${excerpt}${excerpt.length>=150?'…':''}</p><a class="text-link" href="article.html?slug=${encodeURIComponent(post.slug)}">Read article →</a></div></article>`;
}
async function getPosts(params='per_page=12&_embed=1') {
  const res = await fetch(`${WP_API}/posts?${params}`);
  if (!res.ok) throw new Error(`WordPress API error ${res.status}`);
  return await res.json();
}
async function getPostBySlug(slug) {
  const res = await fetch(`${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed=1`);
  if (!res.ok) throw new Error(`WordPress API error ${res.status}`);
  const posts = await res.json();
  return posts[0] || null;
}
async function getCategoryId(name) {
  const res = await fetch(`${WP_API}/categories?search=${encodeURIComponent(name)}&per_page=10`);
  if (!res.ok) throw new Error(`WordPress API error ${res.status}`);
  const cats = await res.json();
  const exact = cats.find(c => c.name.toLowerCase() === name.toLowerCase());
  return (exact || cats[0] || {}).id || null;
}
async function getPostsForCategory(name) {
  const id = await getCategoryId(name);
  if (!id) return [];
  return await getPosts(`categories=${id}&per_page=20&_embed=1`);
}
