
import { GOOD, GOOD_CHIEF, GOOD_HUNTER, GOOD_COORDINATOR, SPY, SPY_CHIEF, SPY_HUNTER } from './Roles'

export default {
  label: "Hunter (Coordinator)",
  id: 'game-hunter-coordinator',
  minPlayers: 5,
  cards: [
    GOOD_CHIEF,
    SPY_CHIEF,
    GOOD_HUNTER,
    SPY_HUNTER,
    GOOD_COORDINATOR,
    GOOD,
    SPY,
    GOOD_CHIEF,
    GOOD,
    SPY_CHIEF
  ]
};
