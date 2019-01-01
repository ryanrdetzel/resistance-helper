
import { GOOD, SPY_ROGUE, SPY, GOOD_ROGUE } from './Roles';

export default {
  label: 'Rogue',
  id: 'game-rogue',
  minPlayers: 5,
  cards: [
    GOOD_ROGUE,
    SPY_ROGUE,
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
