
import { GOOD, GOOD_DEFECTOR, SPY, SPY_DEFECTOR } from './Roles'

export default {
  label: "Defector",
  cards: [
    GOOD_DEFECTOR,
    SPY_DEFECTOR,
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
