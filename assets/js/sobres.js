'use strict';

const packPaths = ['Amigo de la Naturaleza', 'Cazador Furtivo'];
const trialExclusiveRate = 0.1;
const trialInventoryKey = 'accretion.temporada-1.prueba.v1';
const seasonCardsById = new Map(seasonOneCards.map(card => [card.id, card]));

function readTrialInventory() {
  const raw = localStorage.getItem(trialInventoryKey);
  const saved = raw === null ? { copies: {}, lastPack: [] } : JSON.parse(raw);
  const validCopy = ([id, count]) => seasonCardsById.has(id) && Number.isSafeInteger(count) && count > 0;
  if (!saved?.copies || Array.isArray(saved.copies) || typeof saved.copies !== 'object' ||
      !Object.entries(saved.copies).every(validCopy) ||
      !Array.isArray(saved.lastPack) ||
      ![0, 6].includes(saved.lastPack.length) ||
      new Set(saved.lastPack).size !== saved.lastPack.length ||
      !saved.lastPack.every(id => Object.hasOwn(saved.copies, id))) {
    throw new Error('Inventario de prueba inválido');
  }
  return saved;
}

function drawTrialPack(path, random = Math.random) {
  if (!packPaths.includes(path)) throw new Error('Camino desconocido');
  const base = seasonOneCards.filter(card => !card.exclusive);
  const exclusive = seasonOneCards.filter(card => card.exclusive && card.path === path);
  const take = pool => pool.splice(Math.floor(random() * pool.length), 1)[0].id;
  const ids = Array.from({ length: 5 }, () => take(base));
  ids.push(take(random() < trialExclusiveRate ? exclusive : base));
  return ids;
}

function openTrialPack(path) {
  const save = () => {
    const inventory = readTrialInventory();
    inventory.lastPack = drawTrialPack(path);
    for (const id of inventory.lastPack) {
      const count = (inventory.copies[id] ?? 0) + 1;
      if (!Number.isSafeInteger(count)) throw new Error('Límite de inventario');
      inventory.copies[id] = count;
    }
    localStorage.setItem(trialInventoryKey, JSON.stringify(inventory));
    return inventory;
  };
  return navigator.locks ? navigator.locks.request(trialInventoryKey, save) : Promise.resolve().then(save);
}
