
import { GOOD, GOOD_CHIEF, GOOD_HUNTER, SPY_DEEP_AGENT, SPY_CHIEF, SPY_HUNTER } from './Roles'

export default {
  label: "Hunter (Deep Agent)",
  minPlayers: 7,
  cards: [
    GOOD_CHIEF,
    SPY_CHIEF,
    GOOD_HUNTER,
    SPY_HUNTER,
    GOOD,
    GOOD,
    SPY_DEEP_AGENT,
    GOOD_CHIEF,
    GOOD,
    SPY_CHIEF
  ]
};
