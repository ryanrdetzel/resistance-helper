
import AssassinGame from './AssassinGame';
import CustomGame from './CustomGame';
import DefectorGame from './DefectorGame';
import HunterGame from './HunterGame';
import InquisitorGame from './InquisitorGame';
import NormalGame from './NormalGame';
import PretenderGame from './PretenderGame';
import ReverserGame from './ReverserGame';
import TrapperGame from './TrapperGame';

export const GAMES = [
  NormalGame,
  AssassinGame,
  ReverserGame,
  TrapperGame,
  InquisitorGame,
  DefectorGame,
  PretenderGame,
  HunterGame,
  CustomGame
];

const gamesById = {};
GAMES.forEach(game => gamesById[game.id]= game);

export default function GameSetup (type, presence) {
  let game;
  if (typeof type === 'string') {
    game = gamesById[type];
  }
  else {
    // allow passing in game object
    game = type;
    type = game.id;
  }

  if (!(game && game.cards)){
    throw new Error(`Unknown Game: ${type}`);
  }

  const players = deal(game.cards, presence);

  /* Who goes first? */
  const playerList = Object.keys(players).map(uid => players[uid]);
  const firstIndex = Math.floor( Math.random() * playerList.length);
  const first = playerList[firstIndex];

  return {
    game: game,
    players,
    first
  };
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
