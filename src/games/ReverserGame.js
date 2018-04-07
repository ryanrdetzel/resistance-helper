
import { GOOD, GOOD_REVERSER, SPY, SPY_REVERSER } from './Roles'

export default {
  label: "Reverser",
  id: 'game-reverser',
  minPlayers: 5,
  cards: [
    GOOD_REVERSER,
    SPY_REVERSER,
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
