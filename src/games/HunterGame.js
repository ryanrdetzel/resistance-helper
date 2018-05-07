
import { GOOD, GOOD_CHIEF, GOOD_HUNTER, SPY, SPY_CHIEF, SPY_HUNTER, GOOD_COORDINATOR, GOOD_DUMMY } from './Roles';

export default {
  label: 'Hunter',
  id: 'game-hunter',
  minPlayers: 5,
  cards: [
    GOOD_CHIEF,
    SPY_CHIEF,
    GOOD_HUNTER,
    SPY_HUNTER,
    GOOD,
    GOOD,
    SPY,
    GOOD_CHIEF,
    GOOD,
    SPY_CHIEF
  ]
};
