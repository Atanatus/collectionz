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
  return { id, hp: seasonCardsById.get(id).hp, energy: 0, acted: false, replaced: false, exhausted: 0, movementLocked: false, hitLastTurn: false };
}

function startTrialDuel(opening) {
  function createSide(side) {
    return { active: createTrialActive(side.activeId), deck: [...side.deck], hand: [], support: null, supportLost: false, placed: { active: false, support: false }, bonus: 0, discarded: [], lives: 3 };
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
  if (side.support) side.support.acted = false;
  side.placed.active = false;
  side.placed.support = false;
  const key = JSON.stringify([duel.turn, duel.player, duel.rival], (name, value) => {
    if (name === 'acted' || name === 'replaced' || name === 'placed') return undefined;
    if (name === 'hand') return value.map(({ id, hp, energy, exhausted, movementLocked, hitLastTurn }) =>
      [id, hp, energy, exhausted, movementLocked, hitLastTurn]).sort((left, right) =>
      JSON.stringify(left).localeCompare(JSON.stringify(right)));
    return name === 'discarded' ? [...value].sort() : value;
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
  if (draw && side.deck.length && side.hand.length < 6) side.hand.push(createTrialActive(side.deck.shift()));
  duel.phase = 'replacement';
  return true;
}

function canPlaceTrialCreature(duel, slot, index) {
  if (slot !== 'active' && slot !== 'support') return false;
  const side = duel[duel.turn];
  const creature = side.hand[index];
  const outgoing = side[slot];
  if (duel.result || !['replacement', 'actions'].includes(duel.phase) || !creature || side.placed[slot]) return false;
  const role = seasonCardsById.get(creature.id).role;
  if (slot === 'active' ? role === 'Apoyo' : role === 'Activa') return false;
  if (outgoing) return !outgoing.acted && !outgoing.exhausted && !outgoing.movementLocked;
  const free = slot === 'active' || side.supportLost;
  return !free || duel.phase === 'replacement';
}

function placeTrialCreature(duel, slot, index) {
  if (!canPlaceTrialCreature(duel, slot, index)) return false;
  const side = duel[duel.turn];
  const outgoing = side[slot];
  const free = !outgoing && (slot === 'active' || side.supportLost);
  const [incoming] = side.hand.splice(index, 1);
  if (outgoing) side.hand.push(outgoing);
  side[slot] = incoming;
  incoming.acted = !free;
  incoming.replaced = free && slot === 'active';
  if (!free) side.placed[slot] = true;
  if (slot === 'support') side.supportLost = false;
  return true;
}

function trialHybridMove(duel) {
  if (duel.result || !['replacement', 'actions'].includes(duel.phase)) return null;
  const { active, support } = duel[duel.turn];
  if (!support || seasonCardsById.get(support.id).role !== 'Híbrida') return null;
  if (!active) return duel.phase === 'replacement' ? 'promote' : null;
  if (seasonCardsById.get(active.id).role !== 'Híbrida' || active.acted || active.exhausted || active.movementLocked || support.exhausted || support.movementLocked) return null;
  return 'swap';
}

function moveTrialHybrid(duel) {
  const move = trialHybridMove(duel);
  if (!move) return false;
  const side = duel[duel.turn];
  const { active, support } = side;
  if (active) active.acted = true;
  side.active = support;
  side.support = active;
  if (move === 'promote') side.supportLost = false;
  duel.message = move === 'swap' ? 'Híbridas intercambiadas' : 'Híbrida ascendida a Activa';
  return true;
}

function trialSupportSkill(side) {
  const support = side.support;
  const active = side.active;
  if (!support) return null;
  const card = seasonCardsById.get(support.id);
  const skill = card.skills.find(entry => !entry.slot || entry.slot === 'Apoyo');
  const species = card.number;
  if (!['004', '015', '019'].includes(species)) return null;
  const enabled = !support.acted && !support.exhausted && support.energy >= skill.cost && (
    species === '004' ? active && active.energy < 10 :
    species === '015' ? (active && active.hp < seasonCardsById.get(active.id).hp) || support.hp < card.hp :
    active && !active.acted && !side.bonus
  );
  return { ...skill, enabled };
}

function useTrialSupport(duel, target = 'active') {
  const side = duel[duel.turn];
  const skill = trialSupportSkill(side);
  if (duel.result || duel.phase !== 'actions' || !skill?.enabled) return false;
  const { active, support } = side;
  const card = seasonCardsById.get(support.id);
  if (card.number === '015') {
    const creature = target === 'support' ? support : active;
    if (!creature) return false;
    const maxHp = seasonCardsById.get(creature.id).hp;
    if (creature.hp >= maxHp) return false;
    creature.hp = Math.min(maxHp, creature.hp + 150);
  } else if (card.number === '004') {
    active.energy = Math.min(10, active.energy + 2);
  } else {
    side.bonus = card.variant ? 90 : 60;
  }
  support.energy -= skill.cost;
  support.acted = true;
  duel.message = skill.ability;
  return true;
}

function advanceTrialEnergy(duel) {
  if (duel.result || duel.phase !== 'replacement') return false;
  const side = duel[duel.turn];
  for (const creature of [side.active, side.support]) {
    if (creature) creature.energy = Math.min(10, creature.energy + 1);
  }
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

function trialActiveAttacks(active) {
  const basic = trialBasicAttack(active);
  if (!basic) return [];
  const card = seasonCardsById.get(active.id);
  const special = card.skills[1];
  if (card.number === '006') return [basic, { ...special, damage: 350, supportTargetDamage: 250 }];
  if (card.number === '007') return [basic, { ...special, damage: 225, splashDamage: 125 }];
  if (['017', '020'].includes(card.number)) return [basic, { ...special, exhausts: true }];
  if (card.number === '008') return [basic, { ...special, locksActive: true }];
  if (card.number !== '001') return [basic];
  return [basic, { ...special,
    damage: special.damage ?? (active.hitLastTurn ? (card.variant ? 300 : 250) : 180),
    exhausts: card.variant === 'Contención'
  }];
}

function attackTrialDuel(duel, index = 0, aimAtSupport = false) {
  const active = duel[duel.turn].active;
  const skill = trialActiveAttacks(active)[index];
  if (duel.result || duel.phase !== 'actions' || !skill || active.acted || active.exhausted || active.energy < skill.cost) return false;
  const opponent = duel.turn === 'player' ? 'rival' : 'player';
  const target = duel[opponent];
  const bothOccupied = Boolean(target.active && target.support);
  if (aimAtSupport && (!bothOccupied || !skill.supportTargetDamage)) return false;
  const slot = target.active && !aimAtSupport ? 'active' : 'support';
  const creature = target[slot];
  const side = duel[duel.turn];
  const damage = (aimAtSupport ? skill.supportTargetDamage : skill.damage) + side.bonus;
  const splash = bothOccupied ? skill.splashDamage : 0;
  side.bonus = 0;
  active.energy -= skill.cost;
  active.acted = true;
  if (skill.exhausts) active.exhausted = 2;
  duel.message = skill.ability + (creature ? ` · ${damage} de daño` : ' · Ataque directo');
  if (splash) duel.message += ` · ${splash} al Apoyo`;
  const hits = [[slot, damage]];
  if (splash) hits.push(['support', splash]);
  let lostLives = creature ? 0 : 1;
  for (const [hitSlot, amount] of hits) {
    const hit = target[hitSlot];
    if (!hit) continue;
    hit.hitLastTurn = amount > 0;
    hit.hp = Math.max(0, hit.hp - amount);
    if (hit.hp > 0) {
      if (skill.locksActive && hitSlot === 'active') {
        hit.movementLocked = true;
        duel.message += ' · Relevo e intercambio bloqueados';
      }
      continue;
    }
    target.discarded.push(hit.id);
    target[hitSlot] = null;
    if (hitSlot === 'support') target.supportLost = true;
    lostLives += 1;
  }
  target.lives = Math.max(0, target.lives - lostLives);
  if (!target.lives) duel.result = duel.turn;
  return true;
}

function endTrialTurn(duel) {
  if (duel.result || duel.phase !== 'actions') return false;
  const side = duel[duel.turn];
  side.bonus = 0;
  for (const creature of side.hand) creature.hitLastTurn = false;
  for (const creature of [side.active, side.support]) {
    if (!creature) continue;
    creature.hitLastTurn = false;
    creature.movementLocked = false;
    if (creature.exhausted) creature.exhausted -= 1;
  }
  duel.turn = duel.turn === 'player' ? 'rival' : 'player';
  duel.round += 1;
  beginTrialTurn(duel);
  return true;
}

function playTrialRival(duel) {
  if (duel.result || duel.turn !== 'rival') return;
  resolveTrialDraw(duel, true);
  if (trialHybridMove(duel) === 'promote') moveTrialHybrid(duel);
  const index = duel.rival.hand.findIndex((_, position) => !duel.rival.active && canPlaceTrialCreature(duel, 'active', position));
  if (index >= 0) placeTrialCreature(duel, 'active', index);
  const supportIndex = duel.rival.hand.findIndex((_, position) => !duel.rival.support && canPlaceTrialCreature(duel, 'support', position));
  if (supportIndex >= 0) placeTrialCreature(duel, 'support', supportIndex);
  advanceTrialEnergy(duel);
  if (!useTrialSupport(duel)) useTrialSupport(duel, 'support');
  if (!attackTrialDuel(duel, 1)) attackTrialDuel(duel);
  endTrialTurn(duel);
}
