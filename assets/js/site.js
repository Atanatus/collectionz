'use strict';

const muecaArt = 'assets/img/mueca-radiactivo.webp';
const main = document.querySelector('#contenido');
const albums = [
  { name: 'Álbum 1', season: 'Temporada 1', total: 27, copies: {} }
];
const sections = ['inicio', 'albumes', 'duelo', 'tienda', 'mercado', 'perfil'];
const singlePage = matchMedia('(max-width: 600px)');
let selectedAlbum = 0;
let page = 0;

function renderPage(album, index) {
  const start = index * 6;
  const length = Math.min(6, album.total - start);
  const cards = Array.from({ length }, (_, offset) => {
    const number = start + offset + 1;
    const copies = album.copies[number] || 0;
    return copies
      ? `<div class="card owned">${album === albums[0] && number === 1 ? `<img src="${muecaArt}" alt="Mueca Radiactivo">` : `Carta ${number}`}${copies > 1 ? `<small>×${copies}</small>` : ''}</div>`
      : `<div class="card" aria-label="Carta ${number} pendiente">#${number}</div>`;
  }).join('');
  return `<section class="page" aria-label="Página ${index + 1}"><div class="cards">${cards}</div><p>Página ${index + 1}</p></section>`;
}

function renderAlbums(view) {
  const album = albums[selectedAlbum];
  if (view !== 'abierto') {
    return `<h1>Álbumes</h1><div class="shelf"><div class="selector">
      <button data-album="-1" aria-label="Álbum anterior" ${selectedAlbum === 0 ? 'disabled' : ''}>←</button>
      <button class="cover" id="open-album">${album.name}<br><small>Abrir álbum</small></button>
      <button data-album="1" aria-label="Álbum siguiente" ${selectedAlbum === albums.length - 1 ? 'disabled' : ''}>→</button>
    </div><aside><h2>${album.name}</h2><p>${album.season}</p><p>Cartas distintas: ${Object.keys(album.copies).length}/${album.total}</p></aside></div>`;
  }
  const step = singlePage.matches ? 1 : 2;
  const totalPages = Math.ceil(album.total / 6);
  const start = Math.floor(page / step) * step;
  const pages = Array.from({ length: Math.min(step, totalPages - start) }, (_, offset) => renderPage(album, start + offset)).join('');
  return `<a href="#albumes">← Volver a Álbumes</a><h1>${album.name}</h1><div class="book">${pages}</div><div class="actions">
    <button data-page="${Math.max(0, start - step)}" ${start === 0 ? 'disabled' : ''}>← Anterior</button>
    <button data-page="${start + step}" ${start + step >= totalPages ? 'disabled' : ''}>Siguiente →</button>
  </div>`;
}

function render() {
  const [requested, view] = location.hash.slice(1).split('/');
  const section = sections.includes(requested) ? requested : 'inicio';
  for (const link of document.querySelectorAll('nav a')) {
    if (link.hash === '#' + (section === 'duelo' ? 'inicio' : section)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  switch (section) {
    case 'inicio':
      main.innerHTML = `<h1>Últimas novedades</h1>
        <article class="hero"><div><p class="hero-ja" lang="ja">放射能の怪異</p><h2>Mueca<br>Radiactivo</h2>
        <p>Ilustración de desarrollo del universo de ACCRETION.</p><a class="cta" href="#albumes">Explorar álbumes →</a> <a class="cta" href="#duelo">Duelo →</a></div>
        <img src="${muecaArt}" alt="Mueca Radiactivo, criatura de tinta morada con sonrisa luminosa" width="820" height="539"></article>
        <article><h2>Bienvenido a ACCRETION</h2><p>Aquí publicaremos las novedades de temporadas, cartas y actualizaciones.</p></article>`;
      break;
    case 'albumes':
      main.innerHTML = renderAlbums(view);
      break;
    case 'duelo':
      main.innerHTML = '<h1>Duelo</h1><p>El tablero se está probando en el prototipo local de ACCRETION. Esta sección se abrirá cuando el duelo se integre en la web.</p><a href="#inicio">Volver a Inicio</a>';
      break;
    case 'tienda':
      main.innerHTML = '<h1>Tienda</h1><div class="products" aria-label="Formatos de sobres" tabindex="0">' +
        [['Sobre individual', 'sobre', '1 sobre de 6 cartas'], ['Lote de sobres', 'lote', 'Cantidad por definir'], ['Caja', 'caja', 'Cantidad por definir']].map(([name, art, units]) =>
          `<section class="product"><div class="art" data-format="${art}" aria-hidden="true"></div><h2>${name}</h2><p>Temporada 1 · ${units}</p><p>Precio por definir</p><button disabled>Comprar</button></section>`).join('') + '</div>';
      break;
    case 'mercado':
      main.innerHTML = '<h1>Mercado</h1><p>Compraventa de cartas individuales entre jugadores. Próximamente.</p>';
      break;
    case 'perfil':
      main.innerHTML = view === 'mis-sobres'
        ? '<a href="#perfil">← Volver a Perfil</a><h1>Mis sobres</h1><p>No tienes sobres pendientes en esta maqueta.</p><a href="#tienda">Ir a la tienda</a>'
        : '<h1>Perfil</h1><article><h2>Mis sobres</h2><p>Consulta aquí los sobres pendientes de abrir.</p><a href="#perfil/mis-sobres">Ver mis sobres</a></article>';
      break;
  }
}

main.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.id === 'open-album') {
    page = 0;
    location.hash = 'albumes/abierto';
  } else if (button.dataset.album !== undefined) {
    selectedAlbum += Number(button.dataset.album);
    render();
    main.querySelector(`button[data-album="${button.dataset.album}"]:not(:disabled), #open-album`)?.focus();
  } else if (button.dataset.page !== undefined) {
    const previousPage = page;
    page = Number(button.dataset.page);
    render();
    const controls = [...main.querySelectorAll('button[data-page]:not(:disabled)')];
    const sameDirection = controls.find(control => Math.sign(Number(control.dataset.page) - page) === Math.sign(page - previousPage));
    (sameDirection || controls[0])?.focus({ preventScroll: true });
    main.querySelector('.book').scrollIntoView({ block: 'nearest' });
  }
});
addEventListener('hashchange', render);
singlePage.addEventListener('change', render);
render();
