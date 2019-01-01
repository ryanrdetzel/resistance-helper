
import { GOOD, GOOD_DEFECTOR, SPY, SPY_DEFECTOR } from '../Roles';

export default {
  label: "Defector",
  id: "game-defector",
  minPlayers: 5,
  cards: [
    GOOD_DEFECTOR,
    SPY_DEFECTOR,
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
