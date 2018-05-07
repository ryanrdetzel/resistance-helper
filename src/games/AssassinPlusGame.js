
import { GOOD, COMMANDER, SPY, ASSASSIN, FALSE_COMMANDER, BODYGUARD, DEEP_COVER } from './Roles';

export default {
  label: 'Assassin+',
  id: 'game-assassin-plus',
  minPlayers: 5,
  cards: [
    COMMANDER,
    ASSASSIN,
    GOOD,
    GOOD,
    SPY,
    BODYGUARD,
    FALSE_COMMANDER,
    GOOD,
    GOOD,
    DEEP_COVER
  ]
};
