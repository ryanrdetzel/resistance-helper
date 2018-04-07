
import { GOOD, GOOD_REVERSER, SPY, SPY_REVERSER } from './Roles'

export default {
  label: "Reverser",
  cards: [
    GOOD_REVERSER,
    SPY_REVERSER,
    GOOD, // 3 players  2:1
    GOOD,
    SPY,  // 5 players  3:2
    GOOD,
    SPY,  // 7 players  4:3
    GOOD,
    GOOD,
    SPY   // 10 players  6:4
  ]
};
