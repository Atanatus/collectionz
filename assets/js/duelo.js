'use strict';

function shuffleTrialCards(cards, random) {
  for (let index = cards.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [cards[index], cards[other]] = [cards[other], cards[index]];
  }
  return cards;
}

function prepareTrialOpening(selection, random = Math.random) {
  const ids = Object.entries(selection).flatMap(([id, count]) => Array(count).fill(id));

  function prepareSide() {
    const deck = shuffleTrialCards([...ids], random);
    const activeIndex = deck.findIndex(id => ['Activa', 'Híbrida'].includes(seasonCardsById.get(id).role));
    if (activeIndex < 0) throw new Error('El mazo no tiene una Activa inicial.');
    const [activeId] = deck.splice(activeIndex, 1);
    return { activeId, deck: shuffleTrialCards(deck, random), draws: activeIndex + 1 };
  }

  const player = prepareSide();
  const rival = prepareSide();
  const starter = player.draws === rival.draws
    ? (random() < 0.5 ? 'player' : 'rival')
    : (player.draws < rival.draws ? 'player' : 'rival');
  return { player, rival, starter };
}

function createTrialActive(id) {
  return { id, hp: seasonCardsById.get(id).hp, energy: 0, acted: false, replaced: false };
}

function startTrialDuel(opening) {
  function createSide(side) {
    return { active: createTrialActive(side.activeId), deck: [...side.deck], hand: [], discarded: [], lives: 3 };
  }
  const duel = {
    turn: opening.starter, round: 1, result: null, seen: new Map(), message: '',
    player: createSide(opening.player), rival: createSide(opening.rival)
  };
  beginTrialTurn(duel);
  return duel;
}

function beginTrialTurn(duel) {
  const side = duel[duel.turn];
  if (side.active) {
    side.active.acted = false;
    side.active.replaced = false;
  }
  const key = JSON.stringify([duel.turn, duel.player, duel.rival], (name, value) => {
    if (name === 'acted' || name === 'replaced') return undefined;
    return ['hand', 'discarded'].includes(name) ? [...value].sort() : value;
  });
  const count = (duel.seen.get(key) ?? 0) + 1;
  duel.seen.set(key, count);
  if (count === 3) {
    duel.result = 'draw';
    return;
  }
  duel.phase = 'draw';
  if (!side.deck.length || side.hand.length <= 2 || side.hand.length === 6) {
    resolveTrialDraw(duel, side.hand.length <= 2);
  }
}

function resolveTrialDraw(duel, draw) {
  if (duel.result || duel.phase !== 'draw') return false;
  const side = duel[duel.turn];
  if (draw && side.deck.length && side.hand.length < 6) side.hand.push(side.deck.shift());
  duel.phase = 'replacement';
  return true;
}

function canReplaceTrialActive(side, index) {
  const card = seasonCardsById.get(side.hand[index]);
  return !side.active && Boolean(card && card.role !== 'Apoyo');
}

function replaceTrialActive(duel, index) {
  const side = duel[duel.turn];
  if (duel.result || duel.phase !== 'replacement' || !canReplaceTrialActive(side, index)) return false;
  side.active = createTrialActive(side.hand.splice(index, 1)[0]);
  side.active.replaced = true;
  return true;
}

function advanceTrialEnergy(duel) {
  if (duel.result || duel.phase !== 'replacement') return false;
  const active = duel[duel.turn].active;
  if (active) active.energy = Math.min(10, active.energy + 1);
  duel.phase = 'actions';
  return true;
}

function trialBasicAttack(active) {
  if (!active) return null;
  const card = seasonCardsById.get(active.id);
  const skill = card.skills[0];
  const damage = skill.damage ?? (card.number === '011' ? (active.replaced ? 160 : 100) : null);
  return damage === null ? null : { ...skill, damage };
}

function attackTrialDuel(duel) {
  const active = duel[duel.turn].active;
  const skill = trialBasicAttack(active);
  if (duel.result || duel.phase !== 'actions' || !skill || active.acted || active.energy < skill.cost) return false;
  const opponent = duel.turn === 'player' ? 'rival' : 'player';
  const target = duel[opponent];
  active.energy -= skill.cost;
  active.acted = true;
  duel.message = skill.ability + (target.active ? ` · ${skill.damage} de daño` : ' · Ataque directo');
  if (target.active) {
    target.active.hp = Math.max(0, target.active.hp - skill.damage);
    if (target.active.hp > 0) return true;
    target.discarded.push(target.active.id);
    target.active = null;
  }
  target.lives -= 1;
  if (!target.lives) duel.result = duel.turn;
  return true;
}

function endTrialTurn(duel) {
  if (duel.result || duel.phase !== 'actions') return false;
  duel.turn = duel.turn === 'player' ? 'rival' : 'player';
  duel.round += 1;
  beginTrialTurn(duel);
  return true;
}

function playTrialRival(duel) {
  if (duel.result || duel.turn !== 'rival') return;
  resolveTrialDraw(duel, true);
  const index = duel.rival.hand.findIndex((_, position) => canReplaceTrialActive(duel.rival, position));
  if (index >= 0) replaceTrialActive(duel, index);
  advanceTrialEnergy(duel);
  attackTrialDuel(duel);
  endTrialTurn(duel);
}
