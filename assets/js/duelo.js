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
