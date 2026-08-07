const grid = document.getElementById('grid');
const statusLine = document.getElementById('status-line');
const countBadge = document.getElementById('count-badge');
const searchInput = document.getElementById('search');
const clearBtn = document.getElementById('clear-btn');
const cards = Array.from(grid.querySelectorAll('.card'));

countBadge.textContent = cards.length + ' recipes';

function normalize(s){
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

let emptyState = null;

function applySearch(){
  const q = normalize(searchInput.value.trim());
  clearBtn.classList.toggle('show', q.length > 0);

  let visibleCount = 0;
  for(const card of cards){
    const title = normalize(card.dataset.title || '');
    const match = q === '' || title.includes(q);
    card.style.display = match ? '' : 'none';
    if(match) visibleCount++;
  }

  if(emptyState){ emptyState.remove(); emptyState = null; }
  if(visibleCount === 0){
    emptyState = document.createElement('div');
    emptyState.className = 'empty';
    emptyState.innerHTML = '<b>No recipes match that search.</b>Try a different dish.';
    grid.appendChild(emptyState);
  }

  statusLine.innerHTML = q === ''
    ? ''
    : (visibleCount
        ? `<b>${visibleCount}</b> match${visibleCount === 1 ? '' : 'es'} for "${searchInput.value.trim()}"`
        : `No matches for "${searchInput.value.trim()}"`);
}

searchInput.addEventListener('input', applySearch);
clearBtn.addEventListener('click', () => { searchInput.value=''; applySearch(); searchInput.focus(); });
