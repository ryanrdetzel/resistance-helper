
import {GOOD, GOOD_CHIEF, GOOD_HUNTER, GOOD_COORDINATOR, GOOD_PRETENDER, DEEP_AGENT, SPY_CHIEF, SPY_HUNTER} from './Roles';

export default {
  label: 'Hunter+',
  id: 'game-hunter-plus',
  minPlayers: 5,
  cards: [
    GOOD_CHIEF,
    SPY_CHIEF,
    GOOD_HUNTER,
    SPY_HUNTER,
    GOOD_COORDINATOR,
    GOOD,
    DEEP_AGENT,
    GOOD_CHIEF,
    GOOD_PRETENDER,
    SPY_CHIEF
  ]
};
