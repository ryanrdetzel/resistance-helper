
import NormalGame from './NormalGame';
import DefectorGame from './DefectorGame';
import ReverserGame from './ReverserGame';
import AssassinGame from './AssassinGame';
import InquisitorGame from './InquisitorGame';
import TrapperGame from './TrapperGame';
import HunterGame from './HunterGame';
import HunterDummyGame from './HunterDummyGame';
import HunterCoordinatorGame from './HunterCoordinatorGame';
import HunterDeepAgentGame from './HunterDeepAgentGame';
import HunterPretenderGame from './HunterPretenderGame';
import HunterBlameGame from './HunterBlameGame';
import CustomGame from './CustomGame';


export const GAMES = [
  NormalGame, DefectorGame, ReverserGame, AssassinGame, InquisitorGame, TrapperGame,
  HunterGame, HunterDummyGame, HunterCoordinatorGame, HunterDeepAgentGame, HunterPretenderGame, HunterBlameGame,
  CustomGame
];

const gamesById = {};
GAMES.forEach(game => gamesById[game.id]= game);

export default function GameSetup (type, presence) {

  let game;
  if (typeof type === "string") {
    game = gamesById[type];
  }
  else {
    // allow passing in game object
    game = type;
    type = game.id;
  }


  if (!(game && game.cards)){
    throw new Error(`Unknown Game: ${type}`)
  }

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
