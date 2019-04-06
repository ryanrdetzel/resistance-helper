
import AssassinGame from './games/Assassin';
import AssassinPlusGame from './games/AssassinPlus';
import AssassinWitness from './games/AssassinWitness';
import BlindGame from './games/Blind';
import DefectorGame from './games/Defector';
import HunterGame from './games/Hunter';
import HunterPlusGame from './games/HunterPlus';
import InquisitorGame from './games/Inquisitor';
import MacbethGame from './games/Macbeth';
import NormalGame from './games/Normal';
import PlotGame from './games/Plot';
import PretenderGame from './games/Pretender';
import ReverserGame from './games/Reverser';
import RogueGame from './games/Rogue';
import SergeantGame from './games/Sergeant';
import SecretChief from './games/SecretChief';
import TrapperGame from './games/Trapper';

export const GAMES = [
  NormalGame,
  ReverserGame,
  AssassinGame,
  AssassinPlusGame,
  AssassinWitness,
  TrapperGame,
  InquisitorGame,
  DefectorGame,
  PretenderGame,
  HunterGame,
  HunterPlusGame,
  BlindGame,
  RogueGame,
  SergeantGame,
  PlotGame,
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
  const firstIndex = Math.floor( Math.random() * playerList.length);
  const first = playerList[firstIndex];

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

function shuffle (deck) {
  const shuffled = deck.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const x = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = x;
  }
  return shuffled;
}
