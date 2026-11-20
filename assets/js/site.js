'use strict';

const muecaArt = 'assets/img/mueca-radiactivo.webp';
const main = document.querySelector('#contenido');
const albums = [
  { name: 'Álbum 1', season: 'Temporada 1', total: seasonOneCards.length, copies: {} }
];
const sections = ['inicio', 'albumes', 'duelo', 'tienda', 'mercado', 'perfil', 'ayuda'];
const singlePage = matchMedia('(max-width: 600px)');
let selectedAlbum = 0;
let page = 0;

function renderPage(album, index) {
  const start = index * 6;
  const cards = seasonOneCards.slice(start, start + 6).map(card => {
    const copies = album.copies[card.id] || 0;
    const name = card.variant ? `${card.species} · ${card.variant}` : card.species;
    return `<button type="button" class="card${copies ? ' owned' : ''}" data-card="${card.id}">
      <small>#${card.number}</small><span>${name}</span>${copies > 1 ? `<small>×${copies}</small>` : ''}
    </button>`;
  }).join('');
  return `<section class="page" aria-label="Página ${index + 1}"><div class="cards">${cards}</div><p>Página ${index + 1}</p></section>`;
}

function trialInventoryForDisplay() {
  try {
    return readTrialInventory();
  } catch {
    return null;
  }
}

function renderTrialPack(cards, ids) {
  cards.replaceChildren(...ids.map(id => {
    const card = seasonCardsById.get(id);
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.card = id;
    button.className = 'trial-card';

    const image = document.createElement('img');
    image.src = `assets/cartas/temporada-1/${card.editionId}.png`;
    image.alt = card.variant ? `${card.species} · ${card.variant}` : card.species;
    button.append(image);
    return button;
  }));
}

function renderTrialPacks() {
  const inventory = trialInventoryForDisplay();
  main.innerHTML = `<a href="#perfil">← Volver a Perfil</a><h1>Mis sobres</h1>
    <p>Prueba gratuita de Temporada 1. Las cartas se guardan en este navegador.</p>
    <form id="abrir-sobre-prueba">
      <label>Camino <select name="camino">${packPaths.map(path => `<option>${path}</option>`).join('')}</select></label>
      <button type="submit" ${inventory ? '' : 'disabled'}>Abrir sobre de prueba</button>
    </form>
    <p id="sobre-estado" role="status">${inventory ? '6 cartas distintas · 10 % de probabilidad de exclusiva.' : 'No se puede acceder al inventario de prueba de este navegador.'}</p>
    <div id="sobre-resultado" class="trial-cards" aria-label="Último sobre abierto"></div>
    <a href="#albumes/abierto">Ver mi álbum →</a>`;
  renderTrialPack(main.querySelector('#sobre-resultado'), inventory?.lastPack ?? []);
}

function renderAlbums(view) {
  const album = { ...albums[selectedAlbum], copies: trialInventoryForDisplay()?.copies ?? {} };
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
  return `<a href="#albumes">← Volver a Álbumes</a><h1>${album.name}</h1><p><a href="#perfil/mis-sobres">Abrir un sobre de prueba →</a></p><div class="book">${pages}</div><div class="actions">
    <button data-page="${Math.max(0, start - step)}" ${start === 0 ? 'disabled' : ''}>← Anterior</button>
    <button data-page="${start + step}" ${start + step >= totalPages ? 'disabled' : ''}>Siguiente →</button>
  </div>`;
}

function render() {
  const [requested, view] = location.hash.slice(1).split('/');
  const section = sections.includes(requested) ? requested : 'inicio';
  for (const link of document.querySelectorAll('nav a')) {
    if (link.hash === '#' + (['duelo', 'ayuda'].includes(section) ? 'inicio' : section)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  switch (section) {
    case 'inicio':
      main.innerHTML = `<h1>Últimas novedades</h1>
        <article class="hero"><div><p class="hero-ja" lang="ja">放射能の怪異</p><h2>Mueca<br>Radiactivo</h2>
        <p>Ilustración de desarrollo del universo de ACCRETION.</p><a class="cta" href="#albumes">Explorar álbumes →</a> <a class="cta" href="#duelo">Duelo →</a> <a class="cta" href="#ayuda">Guía de juego →</a></div>
        <img src="${muecaArt}" alt="Mueca Radiactivo, criatura de tinta morada con sonrisa luminosa" width="820" height="539"></article>
        <article><h2>Bienvenido a ACCRETION</h2><p>Aquí publicaremos las novedades de temporadas, cartas y actualizaciones.</p></article><p><a href="#perfil/mis-sobres">Abrir un sobre de prueba →</a></p>`;
      break;
    case 'albumes':
      main.innerHTML = renderAlbums(view);
      break;
    case 'duelo':
      main.innerHTML = '<h1>Duelo</h1><p>El tablero se está probando en el prototipo local de ACCRETION. Esta sección se abrirá cuando el duelo se integre en la web.</p><p><a href="#ayuda/reglas">Consultar reglas del duelo →</a></p><a href="#inicio">Volver a Inicio</a>';
      break;
    case 'tienda':
      main.innerHTML = '<h1>Tienda</h1><div class="products" aria-label="Formatos de sobres" tabindex="0">' +
        [['Sobre individual', 'sobre', '1 sobre de 6 cartas'], ['Lote de sobres', 'lote', 'Cantidad por definir'], ['Caja', 'caja', 'Cantidad por definir']].map(([name, art, units]) =>
          `<section class="product"><div class="art" data-format="${art}" aria-hidden="true"></div><h2>${name}</h2><p>Temporada 1 · ${units}</p><p>Precio por definir</p><button disabled>Comprar</button></section>`).join('') + '</div><p>Las compras siguen en preparación. <a href="#perfil/mis-sobres">Puedes abrir un sobre de prueba →</a></p>';
      break;
    case 'mercado':
      main.innerHTML = '<h1>Mercado</h1><p>Compraventa de cartas individuales entre jugadores. Próximamente.</p><p><a href="#albumes/abierto">Consultar el catálogo de cartas →</a></p>';
      break;
    case 'ayuda':
      main.innerHTML = view === 'reglas'
        ? `<a href="#ayuda">← Volver a la guía</a><h1>Reglas del duelo</h1>
          <p>Resumen del prototipo en desarrollo.</p>
          <h2>Preparación</h2><p>Cada jugador empieza con tres vidas y un mazo de doce cartas. En mesa hay un puesto de Activa y otro de Apoyo.</p>
          <h2>Turno</h2><p>El orden de juego pasa por robo, reposición, colocación, energía, acciones y fin de turno. El puesto de la carta determina cómo puede jugarse.</p>
          <h2>Fin del duelo</h2><p>Pierdes al quedarte sin vidas. Si ambos jugadores pierden su última vida en la misma resolución, hay empate. La tercera aparición del mismo estado de inicio de turno también produce empate antes del robo.</p>
          <p><a href="#duelo">← Volver a Duelo</a></p>`
        : `<a href="#inicio">← Volver a Inicio</a><h1>Guía de juego</h1>
          <h2>Coleccionar</h2><p>Abre sobres de prueba, consulta las cartas de la temporada y revisa cuántas fichas distintas has obtenido.</p>
          <ul><li><a href="#perfil/mis-sobres">Abrir sobres de prueba</a></li><li><a href="#albumes/abierto">Consultar el álbum</a></li></ul>
          <h2>Jugar</h2><p>Consulta las reglas básicas mientras se integra el tablero.</p>
          <p><a href="#ayuda/reglas">Leer las reglas del duelo →</a></p>`;
      break;
    case 'perfil':
      if (view === 'mis-sobres') renderTrialPacks();
      else main.innerHTML = '<h1>Perfil</h1><article><h2>Mis sobres</h2><p>Prueba la apertura de sobres de Temporada 1.</p><a href="#perfil/mis-sobres">Ver mis sobres</a></article>';
      break;
  }
}

main.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.card) {
    const card = seasonOneCards.find(entry => entry.id === button.dataset.card);
    const dialog = document.querySelector('#detalle-carta');
    const image = document.querySelector('#detalle-imagen');
    const name = card.variant ? `${card.species} · ${card.variant}` : card.species;
    document.querySelector('#detalle-nombre').textContent = name;
    document.querySelector('#detalle-datos').textContent = [card.role, `${card.hp} PV`, card.path].filter(Boolean).join(' · ');
    image.hidden = true;
    image.onload = () => { image.hidden = false; };
    image.alt = name;
    const source = `assets/cartas/temporada-1/${card.editionId}.png`;
    if (image.getAttribute('src') === source && image.complete && image.naturalWidth) {
      image.hidden = false;
    } else {
      image.src = source;
    }
    dialog.showModal();
  } else if (button.id === 'open-album') {
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
main.addEventListener('submit', async event => {
  const form = event.target;
  if (form.id !== 'abrir-sobre-prueba') return;
  event.preventDefault();
  const button = form.querySelector('button');
  if (button.disabled) return;
  button.disabled = true;
  const status = main.querySelector('#sobre-estado');
  const results = main.querySelector('#sobre-resultado');
  try {
    const inventory = await openTrialPack(form.elements.camino.value);
    if (form.isConnected) {
      renderTrialPack(results, inventory.lastPack);
      status.textContent = 'Seis cartas añadidas a tu álbum.';
    }
  } catch {
    if (form.isConnected) status.textContent = 'No se pudo guardar el sobre. Comprueba el almacenamiento del navegador.';
  } finally {
    button.disabled = false;
  }
});
addEventListener('storage', event => {
  if (event.key === trialInventoryKey && location.hash.startsWith('#albumes')) render();
});
addEventListener('hashchange', () => {
  render();
  const heading = main.querySelector('h1');
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  window.scrollTo(0, 0);
});
singlePage.addEventListener('change', render);
render();
