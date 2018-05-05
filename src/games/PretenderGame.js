
import { SPY, GOOD, DEEP_AGENT, GOOD_PRETENDER } from './Roles';

export default {
  label: 'Pretender',
  id: 'game-pretender',
  minPlayers: 5,
  cards: [
    GOOD_PRETENDER,
    DEEP_AGENT,
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
