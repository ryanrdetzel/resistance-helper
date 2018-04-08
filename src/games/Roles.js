
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

export default function (player) {
  return new Role(player);
}

export class Role {
  constructor(player) {
    this.player = player;

    switch (player.card) {
      case GOOD:
      case GOOD_DEFECTOR:
      case GOOD_REVERSER:
      case GOOD_COMMANDER:
      case GOOD_HUNTER:
      case GOOD_DUMMY:
      case GOOD_COORDINATOR:
        this.isSpy = false;
        this.canSee = [];
        break;

      case GOOD_PRETENDER:
        this.isSpy = false;
        this.canSee = [];
        this.mask = SPY_DEEP_AGENT;
        break;

      case GOOD_CHIEF:
        this.isSpy = false;
        this.canSee = [GOOD_CHIEF, GOOD_COORDINATOR];
        break;

      case SPY:
      case SPY_ASSASSIN:
      case SPY_CHIEF:
      case SPY_HUNTER:
        this.isSpy = true;
        this.canSee = [SPY, SPY_DEFECTOR, SPY_ASSASSIN, SPY_CHIEF, SPY_HUNTER, GOOD_PRETENDER, SPY_DEEP_AGENT];
        break;

      case SPY_DEEP_AGENT:
        this.isSpy = true;
        this.mask = SPY_DEEP_AGENT;
        this.canSee = [];
        break;

      case SPY_REVERSER:
        this.isSpy = true;
        this.canSee = [SPY];
        break;

      case SPY_DEFECTOR:
        this.isSpy = true;
        this.canSee = [];
        break;

      case OBSERVER:
        this.isSpy = null;
        this.canSee = [];
        break;

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
    return invisible.sort(sortInvisible);
  }
}

function sortVisible (a, b) {
  const acard = a.mask || a.player.card;
  const bcard = b.mask || b.player.card;
  return acard.localeCompare(bcard);
}

function sortInvisible (a, b) {
  console.log(a, b);
  if (a.isSpy === b.isSpy){
    return a.player.card.localeCompare(b.player.card);
  }
  else if (a.isSpy){
    return -1;
  } else {
    return 1;
  }
}
