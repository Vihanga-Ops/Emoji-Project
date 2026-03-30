const EMOJI_URL = 'https://akhil-06.github.io/emoji_project/emojiList.js';

const grid       = document.getElementById('emoji-grid');
const searchEl   = document.getElementById('search');
const clearBtn   = document.getElementById('clearBtn');
const statsBar   = document.getElementById('statsBar');
const catRow     = document.getElementById('categoryRow');
const toast      = document.getElementById('toast');
const totalCount = document.getElementById('totalCount');

let allEmojis      = [];
let activeCategory = 'All';
let toastTimer     = null;

/* ── Skeleton loader ── */
function showSkeletons(n = 24) {
  grid.innerHTML = Array.from({ length: n }, () =>
    `<div class="skeleton"></div>`).join('');
}

/* ── Fetch emojis ── */
async function fetchEmojis() {
  showSkeletons();
  try {
    const res = await fetch(EMOJI_URL);
    if (!res.ok) throw new Error('Network error');
    const text = await res.text();

    /* Parse: the file may export as module, assign to variable, or be raw JSON array */
    let data;
    const match = text.match(/(\[[\s\S]*\])/);
    if (match) {
      data = JSON.parse(match[1]);
    } else {
      throw new Error('Could not parse emoji data');
    }

    allEmojis = data;

    /* Log first entry so we can see the real data structure */
    if (allEmojis.length > 0) {
      console.log('📦 First emoji entry:', allEmojis[0]);
      console.log('🔑 Fields:', Object.keys(allEmojis[0]));
    }

    totalCount.textContent = allEmojis.length;
    buildCategories();
    render();

  } catch (err) {
    console.error(err);
    /* Fallback: use a small built-in set so the UI still works */
    allEmojis = getFallbackEmojis();
    totalCount.textContent = allEmojis.length + ' (fallback)';
    buildCategories();
    render();
    showToast('⚠️ Using local fallback data');
  }
}

/* ── Build category pills ── */
function buildCategories() {
  const cats = ['All', ...new Set(allEmojis.map(e => e.category || e.group || 'Other').filter(Boolean))];
  catRow.innerHTML = cats.map(c =>
    `<button class="pill${c === 'All' ? ' active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');
  catRow.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      catRow.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });
}

/* ── Render filtered emojis ── */
function render() {
  const query = searchEl.value.trim().toLowerCase();
  clearBtn.classList.toggle('visible', query.length > 0);

  let filtered = allEmojis;

  /* Category filter */
  if (activeCategory !== 'All') {
    filtered = filtered.filter(e =>
      (e.category || e.group || 'Other') === activeCategory
    );
  }

  /* Search filter */
  if (query) {
    filtered = filtered.filter(e => {
      const name    = (e.name || e.title || e.description || e.label || e.slug || (e.aliases && e.aliases[0]) || '').toLowerCase();
      const aliases = (e.aliases || []).join(' ').toLowerCase();
      const tags    = (e.tags || []).join(' ').toLowerCase();
      return name.includes(query) || aliases.includes(query) || tags.includes(query);
    });
  }

  /* Stats */
  if (query || activeCategory !== 'All') {
    statsBar.innerHTML = `Showing <span>${filtered.length}</span> of ${allEmojis.length} emojis`;
  } else {
    statsBar.innerHTML = `<span>${allEmojis.length}</span> emojis ready to explore`;
  }

  /* Render */
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="big-emoji">🤔</span>
        <h2>No emojis found</h2>
        <p>Try a different word — maybe "face", "animal", or "food"?</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((e, i) => {
    const emoji = e.emoji || e.char || e.character || e.symbol || '❓';
    const name  = e.name || e.title || e.description || e.label ||
                  e.keywords || e.keyword || e.slug ||
                  (e.aliases && e.aliases[0]) ||
                  Object.values(e).find(v => typeof v === 'string' && v.length > 1 && v.length < 60 && v !== emoji) ||
                  '—';
    const delay = Math.min(i * 18, 600);
    return `
      <div class="emoji-card" style="animation-delay:${delay}ms"
           data-emoji="${emoji}" data-name="${name}"
           title="${name}">
        <span class="emoji-face">${emoji}</span>
        <span class="emoji-name">${name}</span>
      </div>`;
  }).join('');

  /* Click to copy */
  grid.querySelectorAll('.emoji-card').forEach(card => {
    card.addEventListener('click', () => {
      const em = card.dataset.emoji;
      const nm = card.dataset.name;
      navigator.clipboard.writeText(em).catch(() => {});
      showToast(`Copied ${em}  ${nm}`);
      /* bounce */
      card.querySelector('.emoji-face').style.transform = 'scale(1.5) rotate(10deg)';
      setTimeout(() => card.querySelector('.emoji-face').style.transform = '', 350);
    });
  });
}

/* ── Toast ── */
function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ── Events ── */
searchEl.addEventListener('input', render);
clearBtn.addEventListener('click', () => {
  searchEl.value = '';
  searchEl.focus();
  render();
});

/* ── Fallback emoji set (if fetch fails) ── */
function getFallbackEmojis() {
  return [
    { emoji: '😀', name: 'grinning face',                  category: 'Smileys & People' },
    { emoji: '😂', name: 'face with tears of joy',          category: 'Smileys & People' },
    { emoji: '😍', name: 'smiling face with heart-eyes',    category: 'Smileys & People' },
    { emoji: '🥰', name: 'smiling face with hearts',        category: 'Smileys & People' },
    { emoji: '😎', name: 'smiling face with sunglasses',    category: 'Smileys & People' },
    { emoji: '🤔', name: 'thinking face',                   category: 'Smileys & People' },
    { emoji: '😴', name: 'sleeping face',                   category: 'Smileys & People' },
    { emoji: '😭', name: 'loudly crying face',              category: 'Smileys & People' },
    { emoji: '🥺', name: 'pleading face',                   category: 'Smileys & People' },
    { emoji: '😤', name: 'face with steam from nose',       category: 'Smileys & People' },
    { emoji: '🙌', name: 'raising hands',                   category: 'People & Body' },
    { emoji: '👏', name: 'clapping hands',                  category: 'People & Body' },
    { emoji: '🤝', name: 'handshake',                       category: 'People & Body' },
    { emoji: '👋', name: 'waving hand',                     category: 'People & Body' },
    { emoji: '💪', name: 'flexed biceps',                   category: 'People & Body' },
    { emoji: '❤️', name: 'red heart',                       category: 'Smileys & People' },
    { emoji: '💛', name: 'yellow heart',                    category: 'Smileys & People' },
    { emoji: '💜', name: 'purple heart',                    category: 'Smileys & People' },
    { emoji: '🖤', name: 'black heart',                     category: 'Smileys & People' },
    { emoji: '💔', name: 'broken heart',                    category: 'Smileys & People' },
    { emoji: '🐶', name: 'dog face',                        category: 'Animals & Nature' },
    { emoji: '🐱', name: 'cat face',                        category: 'Animals & Nature' },
    { emoji: '🦊', name: 'fox',                             category: 'Animals & Nature' },
    { emoji: '🐼', name: 'panda face',                      category: 'Animals & Nature' },
    { emoji: '🦁', name: 'lion',                            category: 'Animals & Nature' },
    { emoji: '🐸', name: 'frog',                            category: 'Animals & Nature' },
    { emoji: '🐙', name: 'octopus',                         category: 'Animals & Nature' },
    { emoji: '🦋', name: 'butterfly',                       category: 'Animals & Nature' },
    { emoji: '🌻', name: 'sunflower',                       category: 'Animals & Nature' },
    { emoji: '🌴', name: 'palm tree',                       category: 'Animals & Nature' },
    { emoji: '🍕', name: 'pizza',                           category: 'Food & Drink' },
    { emoji: '🍔', name: 'hamburger',                       category: 'Food & Drink' },
    { emoji: '🍣', name: 'sushi',                           category: 'Food & Drink' },
    { emoji: '🌮', name: 'taco',                            category: 'Food & Drink' },
    { emoji: '🍦', name: 'soft ice cream',                  category: 'Food & Drink' },
    { emoji: '🍩', name: 'doughnut',                        category: 'Food & Drink' },
    { emoji: '☕',  name: 'hot beverage',                   category: 'Food & Drink' },
    { emoji: '🍺', name: 'beer mug',                        category: 'Food & Drink' },
    { emoji: '🎂', name: 'birthday cake',                   category: 'Food & Drink' },
    { emoji: '🥑', name: 'avocado',                         category: 'Food & Drink' },
    { emoji: '🚀', name: 'rocket',                          category: 'Travel & Places' },
    { emoji: '✈️', name: 'airplane',                        category: 'Travel & Places' },
    { emoji: '🗺️', name: 'world map',                       category: 'Travel & Places' },
    { emoji: '🏖️', name: 'beach with umbrella',             category: 'Travel & Places' },
    { emoji: '🌍', name: 'globe showing europe-africa',     category: 'Travel & Places' },
    { emoji: '🎉', name: 'party popper',                    category: 'Activities' },
    { emoji: '🎮', name: 'video game',                      category: 'Activities' },
    { emoji: '🎸', name: 'guitar',                          category: 'Activities' },
    { emoji: '⚽', name: 'soccer ball',                     category: 'Activities' },
    { emoji: '🏆', name: 'trophy',                          category: 'Activities' },
    { emoji: '💻', name: 'laptop',                          category: 'Objects' },
    { emoji: '📱', name: 'mobile phone',                    category: 'Objects' },
    { emoji: '🔑', name: 'key',                             category: 'Objects' },
    { emoji: '💡', name: 'light bulb',                      category: 'Objects' },
    { emoji: '📚', name: 'books',                           category: 'Objects' },
    { emoji: '⭐', name: 'star',                            category: 'Travel & Places' },
    { emoji: '🌈', name: 'rainbow',                         category: 'Travel & Places' },
    { emoji: '⚡', name: 'high voltage',                    category: 'Travel & Places' },
    { emoji: '🔥', name: 'fire',                            category: 'Travel & Places' },
    { emoji: '✨', name: 'sparkles',                        category: 'Travel & Places' },
  ];
}

/* ── Boot ── */
fetchEmojis();