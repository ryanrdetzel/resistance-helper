
export const GOOD = 'Good';
export const SPY = 'Spy';

export const GOOD_DEFECTOR = 'Good Defector';
export const SPY_DEFECTOR = 'Spy Defector';

export const GOOD_REVERSER = 'Good Reverser';
export const SPY_REVERSER = 'Spy Reverser';

export const GOOD_COMMANDER = 'Commander';
export const SPY_ASSASSIN = 'Assassin';

export const GOOD_CHIEF = 'Good Chief';
export const GOOD_HUNTER = 'Good Hunter';
export const GOOD_DUMMY = 'Good Dummy';
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
        this.canSee = [];
        break;

      case SPY_REVERSER:
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

  getVisible(players) {
    const playerList = Object.keys(players).map(uid => players[uid]);
    return playerList.filter(p =>
      (p.uid !== this.player.uid) && (this.canSee.indexOf(p.card) !== -1)
    );
  }
  getInvisibleCards(players) {
    const playerList = Object.keys(players).map(uid => players[uid]);
    const invisiblePlayers = playerList.filter(p => (p.uid !== this.player.uid) && (this.canSee.indexOf(p.card) === -1));
    return invisiblePlayers.map(p => p.card).sort();

  }
}


