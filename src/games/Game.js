
import NormalGame from './NormalGame';
import DefectorGame from './DefectorGame';
import ReverserGame from './ReverserGame';

export default function Game (type, presence) {

  const game = factory(type);
  const players = deal(game.cards, presence);

  /* Who goes first? */
  const firstIndex = Math.floor( Math.random() * presence.length);
  const first = presence[firstIndex];

  return {
    game:  {
      type,
      label: game.label
    },
    players,
    first
  }
}

function factory(type) {
  switch (type) {
    case 'game-reverser':
      return ReverserGame;
    case 'game-defector':
      return DefectorGame;
    default:
      return NormalGame;
  }
}

function deal (cards, presence) {

  const presenceList = Object.keys(presence).map(id => presence[id]);

  const used = cards.slice(0, presenceList.length);
  const shuffled = shuffle(used);

  let players = {};
  presenceList.forEach( (player, i) => {
    players[player.uid] = {
      ...player,
      card: shuffled[i]
    };
  });
  return players;
}

function shuffle (deck) {
  const shuffled = [];
  const input = deck.slice();
  while (input.length) {
    const i = Math.floor( Math.random() * input.length );
    shuffled.push(input.splice(i, 1)[0]);
  }
  return shuffled;
}
