
// Base Module
export const GOOD = 'Resistance';
export const SPY = 'Spy';

// Defector Module
export const GOOD_DEFECTOR = 'Resist. Defector';
export const SPY_DEFECTOR = 'Spy Defector';

// Reverser Module
export const GOOD_REVERSER = 'Resist. Reverser';
export const SPY_REVERSER = 'Spy Reverser';

// Assassin Module
export const ASSASSIN        = 'Assassin';        // hunts COMMANDER
export const COMMANDER       = 'Commander';       // knows all spies
export const FALSE_COMMANDER = 'False Comdr.'; // looks like COMMANDER
export const BODYGUARD       = 'Body Guard';      // knows COMMANDER
export const DEEP_COVER      = 'Deep Cover';      // normal spy, and invisible to COMMANDER

// Hunter Module
export const GOOD_CHIEF = 'Resist. Chief';
export const SPY_CHIEF = 'Spy Chief';
export const GOOD_HUNTER = 'Resist. Hunter';
export const SPY_HUNTER = 'Spy Hunter';
export const GOOD_DUMMY = 'Dummy Chief';  // can pretend to be chief
export const GOOD_COORDINATOR = 'Coordinator'; // known to good chief

// Misc Mechanics
export const DEEP_AGENT = 'Deep Agent'; // doesn't know other spies, but seen by them
export const GOOD_PRETENDER = 'Pretender';  // appears as fake deep agent
export const BLIND_SPY = 'Blind Spy';   // doesn't know other spies, visa v

// Rogue Module
export const GOOD_ROGUE = 'Rest. Rogue';
export const SPY_ROGUE = 'Spy Rogue';    // not visible to spies or commander

// Late player
export const OBSERVER = 'Observer';


// layout of custom view
export const CARD_GROUPS = [
  [GOOD, SPY],

  [COMMANDER, BODYGUARD, ASSASSIN, FALSE_COMMANDER, DEEP_COVER, BLIND_SPY],

  [GOOD_PRETENDER, DEEP_AGENT],

  [GOOD_REVERSER, SPY_REVERSER],

  [GOOD_DEFECTOR, SPY_DEFECTOR],

  [GOOD_CHIEF, GOOD_HUNTER, GOOD_COORDINATOR, GOOD_DUMMY, SPY_CHIEF, SPY_HUNTER]
];

export default class Role {


  static fromCard (card) {
    return new Role({ card });
  }

  constructor(player = {}) {
    this.card = player.card;
    this.isSpy = false;
    this.asVisibleCard = () => {};

    switch (player.card) {
      case GOOD:
      case GOOD_DEFECTOR:
      case GOOD_REVERSER:
      case GOOD_HUNTER:
      case GOOD_DUMMY:
      case GOOD_COORDINATOR:
      case GOOD_PRETENDER:
      case GOOD_ROGUE:
        break;

      case GOOD_CHIEF:
        this.asVisibleCard = card => {
          switch (card) {
            case GOOD_CHIEF:
            case GOOD_COORDINATOR:
              return card;
            default:
              return;
          }
        };
        break;


      case COMMANDER:
        this.asVisibleCard = card => {
          switch (card) {
            case SPY:
            case ASSASSIN:
            case SPY_CHIEF:
            case SPY_HUNTER:
            case DEEP_AGENT:
            case SPY_REVERSER:
            case SPY_DEFECTOR:
            case FALSE_COMMANDER:
            case BLIND_SPY:
              return SPY;
            case DEEP_COVER:
            case SPY_ROGUE:
            default:
              return;
          }
        };
        break;

      case BODYGUARD:
        this.asVisibleCard = card => {
          switch (card) {
            case COMMANDER:
            case FALSE_COMMANDER:
              return COMMANDER;
            default:
              return;
          }
        };
        break;

      // blind spy visibility
      case SPY_DEFECTOR:
      case BLIND_SPY:
      case SPY_ROGUE:
      case DEEP_AGENT:
        this.isSpy = true;
        break;

      // normal spy visibility
      case SPY:
      case SPY_CHIEF:
      case SPY_HUNTER:
      case ASSASSIN:
      case FALSE_COMMANDER:
      case SPY_REVERSER:
      case DEEP_COVER:
        this.isSpy = true;
        this.asVisibleCard = card => {
          switch (card) {
            case SPY:
            case SPY_CHIEF:
            case SPY_DEFECTOR:
            case DEEP_AGENT:
              return card;

            case GOOD_PRETENDER:
              return DEEP_AGENT;

            case ASSASSIN:
            case DEEP_COVER:
            case SPY_HUNTER:
            case FALSE_COMMANDER:
              return SPY;

            case BLIND_SPY:
            case SPY_ROGUE:
            case SPY_REVERSER:
            default:
              return;
          }
        };
        break;

      case OBSERVER:
        this.isSpy = null;
        this.asVisibleCard = card => {
          return card;
        };
        break;

      default:
        throw new Error(`UNKNOWN ROLE: ${this.card}`);
    }
  }

  isPossibleImposter(cards) {
    switch (this.card) {
      case COMMANDER:
        return (cards.indexOf(FALSE_COMMANDER) >= 0);
      case FALSE_COMMANDER:
        return true;

      case DEEP_AGENT:
        return (cards.indexOf(GOOD_PRETENDER) >= 0);
      case GOOD_PRETENDER:
        return true;

      default:
        return false;
    }
  }

  static getVisibleRoles(uid, gameState) {
    const { players } = gameState;

    const card = players[uid] ? players[uid].card : OBSERVER;
    const viewer = Role.fromCard(card);
    const playerList = Object.keys(players).map(uid => players[uid]);

    const visible = playerList.map(player => {
      const visibleCard = viewer.asVisibleCard(player.card, gameState.game.cards);
      const role = Role.fromCard(visibleCard || player.card);
      return {
        ...player,
        visible: !! visibleCard,
        role
      };
    });

    return visible.filter(player =>
      (player.uid !== uid)
    ).sort(sortByTeamType);
  }

}

export function sortByTeamType (a, b) {
  if (a.isSpy === b.isSpy){
    return a.card.localeCompare(b.card);
  }
  else if (a.isSpy){
    return -1;
  } else {
    return 1;
  }
}
