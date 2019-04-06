
import { GOOD, GOOD_WITNESS, SPY, ASSASSIN} from '../Roles';

export default {
  label: 'Witness',
  id: 'game-witness',
  minPlayers: 5,
  cards: [
    GOOD_WITNESS,
    ASSASSIN,
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
