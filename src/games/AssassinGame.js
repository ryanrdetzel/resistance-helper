
import { GOOD, COMMANDER, SPY, ASSASSIN} from './Roles';

export default {
  label: 'Assassin',
  id: 'game-assassin',
  minPlayers: 5,
  cards: [
    COMMANDER,
    ASSASSIN,
    GOOD,
    GOOD,
    SPY,
    GOOD,
    SPY,
    GOOD,
    GOOD,
    SPY
  ]
};
