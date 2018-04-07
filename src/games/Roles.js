
export const GOOD = 'Good';
export const SPY = 'Spy';

export const GOOD_DEFECTOR = 'Good Defector';
export const SPY_DEFECTOR = 'Spy Defector';

export const GOOD_REVERSER = 'Good Reverser';
export const SPY_REVERSER = 'Spy Reverser';

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
        this.isSpy = false;
        this.canSee = [];
        break;

      case SPY:
        this.isSpy = true;
        this.canSee = [SPY, SPY_DEFECTOR];
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
}


