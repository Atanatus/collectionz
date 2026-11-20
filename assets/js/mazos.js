'use strict';

const trialDeckKey = 'accretion.temporada-1.mazo.v1';
const trialDeckSize = 12;
const trialSpeciesLimit = 2;

function validateTrialDeck(selection, ownedCopies) {
  const countsBySpecies = new Map();
  const activeSpecies = new Set();
  const errors = new Set();
  let total = 0;
  for (const [id, quantity] of Object.entries(selection)) {
    const card = seasonCardsById.get(id);
    if (!card || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > (ownedCopies[id] ?? 0)) {
      errors.add('Usa únicamente copias que tengas en el inventario.');
      continue;
    }
    if (quantity === 0) continue;
    total += quantity;
    const speciesCount = (countsBySpecies.get(card.speciesId) ?? 0) + quantity;
    countsBySpecies.set(card.speciesId, speciesCount);
    if (speciesCount > trialSpeciesLimit) errors.add('Máximo de dos cartas por especie, contando sus variantes.');
    if (card.role === 'Activa' || card.role === 'Híbrida') activeSpecies.add(card.speciesId);
  }
  if (total !== trialDeckSize) errors.add('El mazo debe tener exactamente doce cartas.');
  if (activeSpecies.size < 2) errors.add('Incluye al menos dos especies distintas aptas para Activa.');
  return { total, errors: [...errors] };
}

function readTrialDeck() {
  const saved = JSON.parse(localStorage.getItem(trialDeckKey) ?? '[]');
  if (!Array.isArray(saved) || saved.length > trialDeckSize || !saved.every(id => seasonCardsById.has(id))) {
    throw new Error('Mazo guardado inválido');
  }
  return Object.fromEntries(seasonOneCards.map(card => [card.id, saved.filter(id => id === card.id).length]));
}

function saveTrialDeck(selection) {
  const check = validateTrialDeck(selection, readTrialInventory().copies);
  if (check.errors.length) return check;
  const ids = Object.entries(selection).flatMap(([id, quantity]) => Array(quantity).fill(id));
  localStorage.setItem(trialDeckKey, JSON.stringify(ids));
  return check;
}
