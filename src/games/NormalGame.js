
import { shuffle }  from './util';

class NormalGame {
  static setup (playerList){

    const ROLES = [
      'good',
      'spy',
      'good', // 3 players  2:1
      'good',
      'spy',  // 5 players  3:2
      'good',
      'spy',  // 7 players  4:3
      'good',
      'good',
      'spy'   // 10 players  6:4
    ];

    const deck = ROLES.slice(0, playerList.length);

    const shuffled = shuffle(deck);

    let players = {};
    playerList.forEach( (player, i) => {
      const role = shuffled[i];
      const state = {
        ...player,
        isSpy: false,
        role
      };
      if (role.match('spy') || role.match('spy2')) {
        state.isSpy = true;
      }
      players[player.uid] = state;
    });

    return {
      deck,
      players
    }
  }

  static filterVisible (uid, players){
    const self = players[uid];

    if (!self.isSpy){
      return []
    }

    return Object.keys(players)
      .filter(id =>  id !== uid)
      .map(id => players[id])
      .filter(p => p.isSpy);
  }
}

NormalGame.LABEL = "Normal";

export default NormalGame;
