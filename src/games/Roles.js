
export const GOOD = 'Resistance';
export const SPY = 'Spy';

export const GOOD_DEFECTOR = 'Resist. Defector';
export const SPY_DEFECTOR = 'Spy Defector';

export const GOOD_REVERSER = 'Resist. Reverser';
export const SPY_REVERSER = 'Spy Reverser';

export const GOOD_COMMANDER = 'Commander';
export const SPY_ASSASSIN = 'Assassin';

export const GOOD_CHIEF = 'Resist. Chief';
export const GOOD_HUNTER = 'Resist. Hunter';
export const GOOD_DUMMY = 'Resist. Dummy';
export const GOOD_COORDINATOR = 'Coordinator';
export const GOOD_PRETENDER = 'Pretender';
export const SPY_CHIEF = 'Spy Chief';
export const SPY_HUNTER = 'Spy Hunter';
export const SPY_DEEP_AGENT = 'Deep Agent';

export const OBSERVER = 'Observer';

export const ALL_CARDS = [
  GOOD,
  GOOD_DEFECTOR,
  GOOD_REVERSER,
  GOOD_COMMANDER,
  GOOD_CHIEF,
  GOOD_HUNTER,
  GOOD_DUMMY,
  GOOD_COORDINATOR,
  GOOD_PRETENDER,
  SPY,
  SPY_DEFECTOR,
  SPY_REVERSER,
  SPY_ASSASSIN,
  SPY_CHIEF,
  SPY_HUNTER,
  SPY_DEEP_AGENT
];

export const CARD_GROUPS = [
  {
    label: "Base",
    cards: [GOOD, SPY]
  },
  {
    label: "Reverser",
    cards: [GOOD_REVERSER, SPY_REVERSER]
  },
  {
    label: "Defector",
    cards: [GOOD_DEFECTOR, SPY_DEFECTOR]
  },
  {
    label: "Assassin",
    cards: [GOOD_COMMANDER, SPY_ASSASSIN]
  },
  {
    label: "Hunter",
    cards: [GOOD_CHIEF, GOOD_HUNTER, GOOD_COORDINATOR, GOOD_DUMMY, SPY_CHIEF, SPY_HUNTER]
  },
  {
    label: "Deep Agent",
    cards: [GOOD_PRETENDER, SPY_DEEP_AGENT]
  }
];

export default class Role {
  constructor(player = {}) {
    this.player = player;
    const r = Role.fromCard(player.card);
    this.card = player.card;
    this.isSpy = r.isSpy;
    this.canSee = r.canSee;
    this.mask = r.mask;
  }

  static fromCard (card) {
    switch (card) {
      case GOOD:
      case GOOD_DEFECTOR:
      case GOOD_REVERSER:
      case GOOD_HUNTER:
      case GOOD_DUMMY:
      case GOOD_COORDINATOR:
        return {
          card: card,
          isSpy: false,
          canSee: []
        };
      case GOOD_COMMANDER:
        return {
          card: card,
          isSpy: false,
          canSee: [ SPY, SPY_ASSASSIN ] // todo implement custom visibility based only on allegiance
        };
      case GOOD_PRETENDER:
        return {
          card: card,
          isSpy: false,
          canSee: [],
          mask: SPY_DEEP_AGENT
        };
      case GOOD_CHIEF:
        return {
          card: card,
          isSpy: false,
          canSee: [GOOD_CHIEF, GOOD_COORDINATOR]
        };
      case SPY:
      case SPY_CHIEF:
      case SPY_HUNTER:
        return {
          card: card,
          isSpy: true,
          canSee: [SPY, SPY_DEFECTOR, SPY_ASSASSIN, SPY_CHIEF, SPY_HUNTER, GOOD_PRETENDER, SPY_DEEP_AGENT]
        };
      case SPY_ASSASSIN:
        return {
          card: card,
          mask: SPY,
          isSpy: true,
          canSee: [SPY, SPY_DEFECTOR, SPY_ASSASSIN, SPY_CHIEF, SPY_HUNTER, GOOD_PRETENDER, SPY_DEEP_AGENT]
        };
      case SPY_DEEP_AGENT:
        return {
          card: card,
          isSpy: true,
          canSee: [],
          mask: SPY_DEEP_AGENT,
        };
      case SPY_REVERSER:
        return {
          card: card,
          isSpy: true,
          canSee: [SPY]
        };
      case SPY_DEFECTOR:
        return {
          card: card,
          isSpy: true,
          canSee: []
        };
      case OBSERVER:
        return {
          card: card,
          isSpy: null,
          canSee: ALL_CARDS
        };
      default:
        throw new Error(`UNKNOWN ROLE: ${player.card}`);
    }
  }

  getVisibleRoles(players) {
    const playerList = Object.keys(players).map(uid => new Role(players[uid]));
    const visible = playerList.filter(r =>
      (r.player.uid !== this.player.uid) && (this.canSee.indexOf(r.player.card) !== -1)
    );
    return visible.sort(sortVisible);
  }
  getInvisibleRoles(players) {
    const playerList = Object.keys(players).map(uid => new Role(players[uid]));
    const invisible = playerList.filter(r => (r.player.uid !== this.player.uid) && (this.canSee.indexOf(r.player.card) === -1))
    return invisible.sort(sortByTeamType);
  }

  static getAllRoles () {
    return ALL_CARDS.map(card => Role.fromCard(card));
  }
}

function sortVisible (a, b) {
  const acard = a.mask || a.card;
  const bcard = b.mask || b.card;
  return acard.localeCompare(bcard);
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
