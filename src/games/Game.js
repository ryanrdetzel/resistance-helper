
import AssassinGame from './AssassinGame';
import AssassinPlusGame from './AssassinPlusGame';
import BlindGame from './BlindGame';
import CustomGame from './CustomGame';
import DefectorGame from './DefectorGame';
import HunterGame from './HunterGame';
import HunterPlusGame from './HunterPlusGame';
import InquisitorGame from './InquisitorGame';
import MacbethGame from './MacbethGame';
import NormalGame from './NormalGame';
import PretenderGame from './PretenderGame';
import ReverserGame from './ReverserGame';
import SecretChief from './SecretChief';
import TrapperGame from './TrapperGame';

export const GAMES = [
  NormalGame,
  ReverserGame,
  AssassinGame,
  AssassinPlusGame,
  TrapperGame,
  InquisitorGame,
  DefectorGame,
  HunterGame,
  HunterPlusGame,
  MacbethGame,
  SecretChief
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
  const playerListShuffled = shuffle(playerList);
  const first = playerListShuffled[0];

  return {
    game: game,
    cards: game.cards.slice(0, playerList.length),
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

function shuffle (objs) {
  var shuffled = objs.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const x = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = x;
  }
  return shuffled;
}
