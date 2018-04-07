
import { GOOD, SPY } from './Roles'

export default {
  label: "Normal",
  cards: [
    GOOD,
    SPY,
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
