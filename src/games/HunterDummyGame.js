
import { GOOD, GOOD_CHIEF, GOOD_HUNTER, GOOD_DUMMY, SPY, SPY_CHIEF, SPY_HUNTER } from './Roles'

export default {
  label: "Hunter (Dummy)",
  id: "hunter-dummy",
  minPlayers: 5,
  cards: [
    GOOD_CHIEF,
    SPY_CHIEF,
    GOOD_HUNTER,
    SPY_HUNTER,
    GOOD_DUMMY,
    GOOD,
    SPY,
    GOOD_CHIEF,
    GOOD,
    SPY_CHIEF
  ]
};
