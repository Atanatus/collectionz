'use strict';

const muecaArt = 'assets/img/mueca-radiactivo.webp';
const packArt = 'assets/img/sobre-temporada-1.png';
const cardImagePath = card => `assets/cartas/temporada-1/${card.editionId}.png`;
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
    if (copies) {
      return `<button type="button" class="card owned" data-card="${card.id}" aria-label="${name}, ${copies} copias">
        <img src="${cardImagePath(card)}" alt="" width="1000" height="1400" loading="lazy">
        ${copies > 1 ? `<small class="copy-count">×${copies}</small>` : ''}
      </button>`;
    }
    return `<button type="button" class="card" data-card="${card.id}" aria-label="${name}, por conseguir">
      <small>#${card.number}</small><span>${name}</span>
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
    image.src = cardImagePath(card);
    image.alt = card.variant ? `${card.species} · ${card.variant}` : card.species;
    button.append(image);
    return button;
  }));
}

function renderTrialPacks() {
  const inventory = trialInventoryForDisplay();
  main.innerHTML = `<a href="#perfil">← Volver a Perfil</a><h1>Mis sobres</h1>
    <img class="pack-art" src="${packArt}" alt="Sobre de ACCRETION, Temporada 1">
    <p>Prueba gratuita de Temporada 1. Las cartas se guardan en este navegador.</p>
    <form id="abrir-sobre-prueba">
      <label>Camino <select name="camino">${packPaths.map(path => `<option>${path}</option>`).join('')}</select></label>
      <button type="submit" ${inventory ? '' : 'disabled'}>Abrir sobre de prueba</button>
    </form>
    <p id="sobre-estado" role="status">${inventory ? '6 cartas distintas · 10 % de probabilidad de exclusiva.' : 'No se puede acceder al inventario de prueba de este navegador.'}</p>
    <div id="sobre-resultado" class="trial-cards" aria-label="Último sobre abierto"></div>
    <a href="#albumes/abierto">Ver mi álbum →</a> · <a href="#perfil/inventario">Ver inventario →</a>`;
  renderTrialPack(main.querySelector('#sobre-resultado'), inventory?.lastPack ?? []);
}

function renderInventory() {
  const inventory = trialInventoryForDisplay();
  const links = '<p><a href="#perfil/mis-sobres">Abrir sobres de prueba →</a> · <a href="#albumes/abierto">Ver álbum →</a></p>';
  const heading = '<a href="#perfil">← Volver a Perfil</a><h1>Inventario</h1>';
  if (!inventory) {
    main.innerHTML = heading + '<p>No se puede leer el inventario de este navegador.</p>' + links;
    return;
  }
  const owned = seasonOneCards.filter(card => Object.hasOwn(inventory.copies, card.id));
  if (owned.length === 0) {
    main.innerHTML = heading + '<p>Tu inventario está vacío. Abre un sobre de prueba para conseguir tus primeras cartas.</p>' + links;
    return;
  }
  const total = owned.reduce((sum, card) => sum + inventory.copies[card.id], 0);
  const cards = owned.map(card => {
    const name = card.variant ? `${card.species} · ${card.variant}` : card.species;
    return `<li><button type="button" data-card="${card.id}">
      ${name} <small>· ${card.role} · ×${inventory.copies[card.id]}</small>
    </button></li>`;
  }).join('');
  main.innerHTML = heading + `<p>${owned.length} fichas distintas · ${total} cartas en total</p>
    <p><a href="#perfil/mazo">Preparar mi mazo →</a></p><ul aria-label="Cartas obtenidas">${cards}</ul>` + links;
}

function renderTrialDeck() {
  const heading = '<a href="#perfil/inventario">← Volver al inventario</a><h1>Mi mazo de prueba</h1>';
  const inventory = trialInventoryForDisplay();
  if (!inventory) {
    main.innerHTML = heading + '<p>No se puede leer el inventario de este navegador.</p>';
    return;
  }
  const owned = seasonOneCards.filter(card => Object.hasOwn(inventory.copies, card.id));
  if (!owned.length) {
    main.innerHTML = heading + '<p>Abre un sobre de prueba para conseguir cartas.</p><a href="#perfil/mis-sobres">Ir a Mis sobres →</a>';
    return;
  }
  let saved;
  try {
    saved = readTrialDeck();
  } catch {
    main.innerHTML = heading + '<p>No se puede leer el mazo guardado en este navegador.</p>';
    return;
  }
  const fields = owned.map(card => {
    const name = card.variant ? `${card.species} · ${card.variant}` : card.species;
    const count = inventory.copies[card.id];
    const max = Math.min(count, trialSpeciesLimit);
    return `<li><label>${name} · ${card.role} · ${count} en inventario
      <select name="${card.id}" data-copias="${count}">
        ${Array.from({ length: max + 1 }, (_, value) =>
          `<option value="${value}" ${Math.min(saved[card.id] ?? 0, max) === value ? 'selected' : ''}>${value}</option>`).join('')}
      </select></label></li>`;
  }).join('');
  main.innerHTML = heading + `<p>12 cartas, máximo 2 por especie contando variantes y al menos 2 especies aptas para Activa.</p>
    <form id="mazo-prueba"><ul>${fields}</ul>
      <p id="mazo-estado" role="status"></p><button type="submit">Guardar mazo</button>
    </form>`;
  updateDeckStatus(main.querySelector('#mazo-prueba'));
}

function deckSelection(form) {
  return Object.fromEntries([...form.querySelectorAll('select')].map(field => [field.name, Number(field.value)]));
}

function updateDeckStatus(form) {
  const fields = [...form.querySelectorAll('select')];
  const copies = Object.fromEntries(fields.map(field => [field.name, Number(field.dataset.copias)]));
  const check = validateTrialDeck(deckSelection(form), copies);
  form.querySelector('#mazo-estado').textContent = `${check.total}/${trialDeckSize} cartas · ${check.errors.join(' ') || 'Mazo válido.'}`;
}

let preparedTrialOpening = null;
let trialDuel = null;

function renderTrialDuelCard(id) {
  const card = seasonCardsById.get(id);
  const name = card.variant ? `${card.species} · ${card.variant}` : card.species;
  return `<button type="button" data-card="${card.id}">${name}</button>`;
}

function renderBattleCard(creature) {
  const card = seasonCardsById.get(creature.id);
  const name = card.variant ? `${card.species} · ${card.variant}` : card.species;
  return `<button type="button" class="battle-card" data-card="${card.id}" aria-label="Ver carta de ${name}">
      <img src="${cardImagePath(card)}" alt="" width="1000" height="1400">
    </button>
    <span class="battle-stats">
      <strong>${name}</strong>
      <meter min="0" max="${card.hp}" value="${creature.hp}" aria-label="Puntos de vida de ${name}"></meter>
      <span>${creature.hp}/${card.hp} PV · ${creature.energy} E</span>
      ${creature.exhausted ? '<span>Agotada</span>' : ''}
      ${creature.movementLocked ? '<span>Movimiento bloqueado</span>' : ''}
    </span>`;
}

function renderStartedTrialDuel(duel) {
  const sides = [['Rival', duel.rival], ['Tú', duel.player]].map(([label, side]) => {
    const slots = [['Activa', side.active], ['Apoyo', side.support]].map(([name, creature]) =>
      `<div class="battle-slot"><strong>${name}</strong>
        ${creature ? renderBattleCard(creature) : '<div class="battle-empty" aria-label="Puesto vacío">Vacío</div>'}</div>`
    ).join('');
    const deck = side.deck.length
      ? '<img src="assets/cartas/temporada-1/reverso.png" alt="" width="1000" height="1400">'
      : '<div class="battle-empty">Vacío</div>';
    const lives = Array.from({ length: 3 }, (_, index) =>
      `<span class="battle-life${index < side.lives ? ' is-live' : ''}"></span>`
    ).join('');
    return `<section class="battle-side" aria-label="${label}">
      <h2>${label} <span class="battle-lives" role="img" aria-label="${side.lives} de 3 vidas">${lives}</span>
        <small>Mano ${side.hand.length}</small></h2>
      <div class="battle-zones">
        <div class="battle-slot"><strong>Mazo · ${side.deck.length}</strong>${deck}</div>
        ${slots}
        <details class="battle-discard"><summary>Eliminadas · ${side.discarded.length}</summary>
          <div>${side.discarded.map(renderTrialDuelCard).join(' ') || 'Vacío'}</div>
        </details>
      </div>
    </section>`;
  }).join('');
  const ownTurn = duel.turn === 'player' && !duel.result;
  const hand = duel.player.hand.map((creature, index) => {
    const buttons = ownTurn ? ['active', 'support'].filter(slot => canPlaceTrialCreature(duel, slot, index)).map(slot => {
      const label = slot === 'active' ? 'Activa' : 'Apoyo';
      const action = duel.player[slot] ? 'Relevar' : slot === 'active' || duel.player.supportLost ? 'Reponer' : 'Colocar';
      return `<button type="button" data-duel-action="place" data-duel-slot="${slot}" data-duel-replace="${index}">${action} ${label}</button>`;
    }).join(' ') : '';
    return `<li class="battle-slot">${renderBattleCard(creature)}${buttons}</li>`;
  }).join(' ');
  let controls = '';
  if (ownTurn && duel.phase === 'draw') {
    controls = '<button data-duel-action="draw">Robar</button> <button data-duel-action="skip">Omitir robo</button>';
  } else if (ownTurn && duel.phase === 'replacement') {
    controls = '<button data-duel-action="energy">Ir a acciones</button>';
  } else if (ownTurn && duel.phase === 'actions') {
    const active = duel.player.active;
    const attacks = trialActiveAttacks(active);
    const skill = trialSupportSkill(duel.player);
    const support = duel.player.support;
    const supportSpecies = support && seasonCardsById.get(support.id).number;
    const healing = supportSpecies === '015';
    const liberation = supportSpecies === '012';
    const targets = healing ? ['active', 'support'].filter(slot => {
      const creature = duel.player[slot];
      return creature && creature.hp < seasonCardsById.get(creature.id).hp;
    }) : liberation ? [
      ...(active?.exhausted ? ['exhaustion'] : []),
      ...(active?.movementLocked ? ['movement'] : [])
    ] : ['active'];
    const supportLabels = { exhaustion: 'Quitar agotamiento', movement: 'Quitar bloqueo de movimiento' };
    const supportControls = skill ? targets.map(slot =>
      `<button data-duel-action="support" data-duel-target="${slot}" ${skill.enabled ? '' : 'disabled'}>
        ${skill.ability}${healing ? (slot === 'active' ? ' · Curar Activa' : ' · Curar Hendral') : liberation ? ` · ${supportLabels[slot]}` : ''} · ${skill.cost} energía</button>`
    ).join(' ') : '';
    const { active: enemyActive, support: enemySupport } = duel.rival;
    const bothOccupied = Boolean(enemyActive && enemySupport);
    const attackControls = attacks.map((attack, index) => {
      const unavailable = active.acted ? 'Ya actuó' : active.exhausted ? 'Agotada'
        : active.energy < attack.cost ? `Falta energía · ${active.energy}/${attack.cost}` : '';
      const disabled = unavailable ? 'disabled' : '';
      const reason = unavailable ? `<small>${unavailable}</small>` : '';
      const bonus = duel.player.bonus;
      const damage = enemyActive || enemySupport ? `${attack.damage + bonus} daño` : '1 vida';
      const splash = bothOccupied && attack.splashDamage ? ` + ${attack.splashDamage} al Apoyo` : '';
      const attackSupport = bothOccupied && attack.supportTargetDamage
        ? `<button data-duel-action="attack" data-duel-attack="${index}" data-duel-target="support" ${disabled}>
          ${attack.ability} al Apoyo · ${attack.cost} energía · ${attack.supportTargetDamage + bonus} daño${reason}</button>` : '';
      return `<button data-duel-action="attack" data-duel-attack="${index}" ${disabled}>
        ${attack.ability} · ${attack.cost} energía · ${damage}${splash}${attack.exhausts ? ' · Agota' : ''}${reason}</button> ${attackSupport}`;
    }).join(' ');
    controls = `${supportControls} ${attackControls} <button data-duel-action="end">Terminar turno</button>`;
  }
  const hybridMove = ownTurn ? trialHybridMove(duel) : null;
  if (hybridMove) {
    const label = hybridMove === 'swap' ? 'Intercambiar Híbridas' : 'Subir Apoyo a Activa';
    controls = `<button type="button" data-duel-action="hybrid">${label}</button> ${controls}`;
  }
  const status = { player: 'Victoria', rival: 'Derrota', draw: 'Empate por repetición' };
  return `<div class="battle-screen">
    <div class="battle-heading">
      <h1 tabindex="-1">${duel.result ? status[duel.result] : 'Duelo en curso'}</h1>
      ${duel.result ? '' : `<p>Turno ${duel.round} · ${duel.turn === 'player' ? 'Tu turno' : 'Turno del rival'}</p>`}
      <a href="#duelo/preparar">${duel.result ? 'Preparar otra partida' : 'Volver a preparar'}</a>
    </div>
    <div class="battle-board">${sides}</div>
    <div class="battle-console">
      <section class="battle-hand"><h2>Tu mano · ${duel.player.hand.length}/6</h2>
        ${hand ? `<ul>${hand}</ul>` : '<p>Vacía</p>'}
      </section>
      <div class="battle-controls">
        ${controls ? `<div class="actions">${controls}</div>` : ''}
        <p role="status">${duel.message}</p>
      </div>
    </div>
  </div>`;
}

function renderTrialDuel(view) {
  const heading = '<h1>Duelo de prueba</h1>';
  const rules = '<p><a href="#ayuda/reglas">Consultar reglas del duelo →</a></p>';
  if (view === 'partida' && trialDuel) return renderStartedTrialDuel(trialDuel);
  if (view !== 'preparar') {
    return heading + '<p><a class="cta" href="#duelo/preparar">Elegir mazo →</a></p>' + rules;
  }

  let selection;
  let check;
  try {
    selection = readTrialDeck();
    check = validateTrialDeck(selection, readTrialInventory().copies);
  } catch {
    return heading + '<p>No se pudo leer el mazo o el inventario de este navegador.</p>' + rules;
  }

  const edit = '<p><a href="#perfil/mazo">Ir a Mi mazo de prueba →</a></p>';
  if (check.errors.length) return heading + '<p>Guarda un mazo válido para preparar la partida.</p>' + edit + rules;

  return heading + `<label for="mazo-duelo">Mazo</label>
    <select id="mazo-duelo"><option>Mi mazo de prueba · ${check.total} cartas</option></select>
    <p>El rival de prueba usa la misma composición, barajada por separado.</p>
    <button id="preparar-duelo" type="button">Preparar partida</button>
    <div id="apertura-duelo" aria-live="polite"></div>` + edit + rules;
}

function showTrialOpening() {
  const result = main.querySelector('#apertura-duelo');
  preparedTrialOpening = null;
  try {
    const selection = readTrialDeck();
    const check = validateTrialDeck(selection, readTrialInventory().copies);
    if (check.errors.length) {
      result.textContent = check.errors.join(' ');
      return;
    }
    const opening = prepareTrialOpening(selection);
    preparedTrialOpening = opening;
    const sides = [['Tú', opening.player], ['Rival', opening.rival]].map(([label, side]) => {
      const card = seasonCardsById.get(side.activeId);
      const name = card.variant ? `${card.species} · ${card.variant}` : card.species;
      return `<section><h3>${label}</h3><p>3 vidas · Mazo ${side.deck.length} · Mano 0</p>
        <p>Activa: <button type="button" data-card="${card.id}">${name}</button></p>
        <p>Apoyo vacío · Eliminadas 0</p></section>`;
    }).join('');
    result.innerHTML = `<h2>Apertura preparada</h2>
      <p>${opening.starter === 'player' ? 'Empiezas tú.' : 'Empieza el rival.'}
        ${opening.player.draws === opening.rival.draws ? 'Desempate al azar.' : ''}</p>
      <div class="products">${sides}</div>
      <p><button id="comenzar-duelo" type="button">Comenzar duelo</button></p>`;
  } catch {
    result.textContent = 'No se pudo preparar la apertura.';
  }
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
  const current = section === 'perfil' && ['mazo', 'mis-sobres'].includes(view)
    ? `#perfil/${view}` : `#${section}`;
  document.body.classList.toggle('duel-in-progress', section === 'duelo' && view === 'partida' && Boolean(trialDuel));
  for (const link of document.querySelectorAll('.site-sidebar a, .player-panel a')) {
    if (link.hash === current) link.setAttribute('aria-current', 'page');
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
      main.innerHTML = renderTrialDuel(view);
      break;
    case 'tienda':
      main.innerHTML = '<h1>Tienda</h1><div class="products" aria-label="Formatos de sobres" tabindex="0">' +
        [['Sobre individual', 'sobre', '1 sobre de 6 cartas'], ['Lote de sobres', 'lote', 'Cantidad por definir'], ['Caja', 'caja', 'Cantidad por definir']].map(([name, art, units]) =>
          `<section class="product">${art === 'sobre' ? `<img class="pack-art" src="${packArt}" alt="">` : `<div class="art" data-format="${art}" aria-hidden="true"></div>`}<h2>${name}</h2><p>Temporada 1 · ${units}</p><p>Precio por definir</p><button disabled>Comprar</button></section>`).join('') + '</div><p>Las compras siguen en preparación. <a href="#perfil/mis-sobres">Puedes abrir un sobre de prueba →</a></p>';
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
      else if (view === 'inventario') renderInventory();
      else if (view === 'mazo') renderTrialDeck();
      else main.innerHTML = '<h1>Perfil</h1><article><h2>Mis sobres</h2><p>Prueba la apertura de sobres de Temporada 1.</p><a href="#perfil/mis-sobres">Ver mis sobres</a></article><article><h2>Inventario</h2><p>Consulta las cartas obtenidas y cuántas copias tienes.</p><a href="#perfil/inventario">Ver inventario</a></article>';
      break;
  }
}

main.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.id === 'preparar-duelo') {
    showTrialOpening();
  } else if (button.id === 'comenzar-duelo' && preparedTrialOpening) {
    trialDuel = startTrialDuel(preparedTrialOpening);
    preparedTrialOpening = null;
    playTrialRival(trialDuel);
    button.disabled = true;
    location.hash = 'duelo/partida';
  } else if (trialDuel?.turn === 'player' && (button.dataset.duelAction || button.dataset.duelReplace !== undefined)) {
    switch (button.dataset.duelAction) {
      case 'draw': resolveTrialDraw(trialDuel, true); break;
      case 'skip': resolveTrialDraw(trialDuel, false); break;
      case 'energy': advanceTrialEnergy(trialDuel); break;
      case 'place': placeTrialCreature(trialDuel, button.dataset.duelSlot, Number(button.dataset.duelReplace)); break;
      case 'hybrid': moveTrialHybrid(trialDuel); break;
      case 'support': useTrialSupport(trialDuel, button.dataset.duelTarget); break;
      case 'attack': attackTrialDuel(trialDuel, Number(button.dataset.duelAttack), button.dataset.duelTarget === 'support'); break;
      case 'end':
        endTrialTurn(trialDuel);
        playTrialRival(trialDuel);
        break;
    }
    const action = button.dataset.duelAction;
    render();
    const enabledActions = [...main.querySelectorAll('button[data-duel-action]:not(:disabled)')];
    const next = enabledActions.find(control => control.dataset.duelAction === action &&
      control.dataset.duelAttack === button.dataset.duelAttack &&
      control.dataset.duelTarget === button.dataset.duelTarget &&
      control.dataset.duelSlot === button.dataset.duelSlot &&
      control.dataset.duelReplace === button.dataset.duelReplace)
      ?? enabledActions.find(control => !control.closest('.battle-hand'))
      ?? enabledActions[0]
      ?? main.querySelector('h1');
    next?.focus({ preventScroll: true });
  } else if (button.dataset.card) {
    const card = seasonOneCards.find(entry => entry.id === button.dataset.card);
    const dialog = document.querySelector('#detalle-carta');
    const image = document.querySelector('#detalle-imagen');
    const name = card.variant ? `${card.species} · ${card.variant}` : card.species;
    document.querySelector('#detalle-nombre').textContent = name;
    document.querySelector('#detalle-datos').textContent = [card.role, `${card.hp} PV`, card.path].filter(Boolean).join(' · ');
    image.hidden = true;
    image.onload = () => { image.hidden = false; };
    image.alt = name;
    const source = cardImagePath(card);
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
main.addEventListener('change', event => {
  const form = event.target.closest('#mazo-prueba');
  if (form) updateDeckStatus(form);
});

main.addEventListener('submit', async event => {
  const form = event.target;
  if (form.id === 'mazo-prueba') {
    event.preventDefault();
    const status = form.querySelector('#mazo-estado');
    try {
      const check = saveTrialDeck(deckSelection(form));
      status.textContent = check.errors.join(' ') || 'Mazo guardado en este navegador.';
    } catch {
      status.textContent = 'No se pudo guardar el mazo en este navegador.';
    }
    return;
  }
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
  if (event.key === trialInventoryKey &&
      (location.hash.startsWith('#albumes') || location.hash === '#perfil/inventario')) render();
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
