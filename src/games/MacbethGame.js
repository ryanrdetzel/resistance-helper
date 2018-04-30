
import { GOOD, SPY, COMMANDER, ASSASSIN, GOOD_DEFECTOR, SPY_DEFECTOR } from './Roles';

export default {
  label: 'Macbeth',
  id: 'game-macbeth',
  minPlayers: 5,
  cards: [
    COMMANDER,
    ASSASSIN,
    GOOD_DEFECTOR,
    GOOD,
    SPY_DEFECTOR,
    GOOD,
    SPY,
    GOOD,
    GOOD,
    SPY
  ]
};
