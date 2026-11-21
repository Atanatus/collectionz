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
  return { id, hp: seasonCardsById.get(id).hp, energy: 0, acted: false, replaced: false, exhausted: 0, movementLocked: false, guard: 0, hitLastTurn: false };
}

function startTrialDuel(opening) {
  function createSide(side) {
    return { active: createTrialActive(side.activeId), deck: [...side.deck], hand: [], support: null, supportLost: false, placed: { active: false, support: false }, bonus: 0, attackTax: 0, discarded: [], lives: 3, germinationUsed: false };
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
    if (name === 'hand') return value.map(({ id, hp, energy, exhausted, movementLocked, guard, hitLastTurn }) =>
      [id, hp, energy, exhausted, movementLocked, guard, hitLastTurn]).sort((left, right) =>
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

function canUseTrialReturn(duel) {
  const side = duel[duel.turn];
  const support = side.support;
  return !duel.result && duel.phase === 'actions' && support?.id === 'accretion-021-base' &&
    !support.acted && !support.exhausted && side.hand.length < 6 && side.discarded.length > 0;
}

function useTrialReturn(duel, index) {
  const side = duel[duel.turn];
  if (!canUseTrialReturn(duel) || !Number.isInteger(index) || index < 0 || index >= side.discarded.length) return false;

  side.support.acted = true;
  side.lives -= 1;
  duel.message = 'Hebra de retorno';
  if (side.lives === 0) {
    duel.result = duel.turn === 'player' ? 'rival' : 'player';
    return true;
  }
  const [id] = side.discarded.splice(index, 1);
  side.hand.push(createTrialActive(id));
  return true;
}

function trialDefenseSkill(side, slot) {
  const creature = side[slot];
  if (!creature) return null;
  const card = seasonCardsById.get(creature.id);
  if (slot === 'active' && card.number === '014') return { ...card.skills[1], reduction: 150, protectsSupport: true };
  if (slot === 'active' && card.number === '023') return { ...card.skills[1], healing: 125 };
  if (slot === 'active' && card.number === '003') return { ...card.skills[1], reduction: 150 };
  if (slot === 'support' && card.number === '010') return { ...card.skills[0], reduction: 125 };
  return null;
}

function canUseTrialDefense(duel, slot) {
  const side = duel[duel.turn];
  const skill = trialDefenseSkill(side, slot);
  const creature = side[slot];
  if (skill?.protectsSupport && (!side.support?.exhausted || side.support.guard)) return false;
  return Boolean(!duel.result && duel.phase === 'actions' && skill &&
    !creature.acted && !creature.exhausted && creature.energy >= skill.cost &&
    (skill.healing ? creature.hp < seasonCardsById.get(creature.id).hp : skill.protectsSupport || !creature.guard));
}

function useTrialDefense(duel, slot) {
  if (!canUseTrialDefense(duel, slot)) return false;
  const side = duel[duel.turn];
  const creature = side[slot];
  const skill = trialDefenseSkill(side, slot);
  creature.energy -= skill.cost;
  creature.acted = true;
  if (skill.healing) {
    creature.hp = Math.min(seasonCardsById.get(creature.id).hp, creature.hp + skill.healing);
  } else {
    const target = skill.protectsSupport ? side.support : creature;
    target.guard = skill.reduction;
  }
  duel.message = skill.ability;
  return true;
}

function trialSupportSkill(side) {
  const support = side.support;
  const active = side.active;
  if (!support) return null;
  const card = seasonCardsById.get(support.id);
  const skill = card.skills.find(entry => !entry.slot || entry.slot === 'Apoyo');
  const species = card.number;
  if (!['004', '005', '012', '015', '018', '019', '024'].includes(species)) return null;
  const enabled = !support.acted && !support.exhausted && support.energy >= skill.cost && (
    species === '018' ? side.lives < 3 && !side.germinationUsed :
    species === '024' ? active && active.hp * 2 <= seasonCardsById.get(active.id).hp :
    species === '005' ? true :
    species === '004' ? active && active.energy < 10 :
    species === '012' ? active && (active.exhausted || active.movementLocked) :
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
  } else if (card.number === '018') {
    side.lives += 1;
    side.germinationUsed = true;
  } else if (card.number === '024') {
    active.hp = Math.min(seasonCardsById.get(active.id).hp, active.hp + 250);
    support.exhausted = 2;
  } else if (card.number === '012') {
    if (target === 'exhaustion' && active.exhausted) active.exhausted = 0;
    else if (target === 'movement' && active.movementLocked) active.movementLocked = false;
    else return false;
    support.exhausted = 2;
  } else if (card.number === '005') {
    const opponent = duel.turn === 'player' ? duel.rival : duel.player;
    opponent.attackTax = 1;
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

function trialActiveAttacks(side) {
  return trialActiveAttackOptions(side.active).map(attack => ({ ...attack, cost: attack.cost + side.attackTax }));
}

function trialActiveAttackOptions(active) {
  const basic = trialBasicAttack(active);
  if (!basic) return [];
  const card = seasonCardsById.get(active.id);
  const special = card.skills[1];
  if (card.number === '006') return [basic, { ...special, damage: 350, supportTargetDamage: 250 }];
  if (card.number === '007') return [basic, { ...special, damage: 225, splashDamage: 125 }];
  if (['017', '020'].includes(card.number)) return [basic, { ...special, exhausts: true }];
  if (card.number === '008') return [basic, { ...special, locksActive: true }];
  if (card.number === '016') return [basic, { ...special, ignoresReduction: 100 }];
  if (card.number !== '001') return [basic];
  return [basic, { ...special,
    damage: special.damage ?? (active.hitLastTurn ? (card.variant ? 300 : 250) : 180),
    exhausts: card.variant === 'Contención'
  }];
}

function attackTrialDuel(duel, index = 0, aimAtSupport = false) {
  const active = duel[duel.turn].active;
  const skill = trialActiveAttacks(duel[duel.turn])[index];
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
  side.attackTax = 0;
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
    const blocked = Math.min(amount, Math.max(0, hit.guard - (skill.ignoresReduction ?? 0)));
    if (blocked > 0) {
      hit.guard = 0;
      duel.message += ` · ${blocked} bloqueados en ${hitSlot === 'active' ? 'Activa' : 'Apoyo'}`;
    }
    const applied = amount - blocked;
    hit.hitLastTurn ||= applied > 0;
    hit.hp = Math.max(0, hit.hp - applied);
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
  side.attackTax = 0;
  for (const creature of side.hand) creature.hitLastTurn = false;
  for (const creature of [side.active, side.support]) {
    if (!creature) continue;
    creature.hitLastTurn = false;
    creature.movementLocked = false;
    if (creature.exhausted) creature.exhausted -= 1;
  }
  duel.turn = duel.turn === 'player' ? 'rival' : 'player';
  const next = duel[duel.turn];
  for (const creature of [next.active, next.support, ...next.hand]) {
    if (creature) creature.guard = 0;
  }
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
  if (duel.rival.support && seasonCardsById.get(duel.rival.support.id).number === '012') {
    useTrialSupport(duel, 'exhaustion');
  } else if (!useTrialSupport(duel)) {
    useTrialSupport(duel, 'support');
  }
  useTrialDefense(duel, 'support');
  if (!attackTrialDuel(duel, 1) && !useTrialDefense(duel, 'active')) attackTrialDuel(duel);
  endTrialTurn(duel);
}
