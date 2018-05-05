import {GAMES} from '../games/Game';

class PlusMinusVoting {
  static results({ballots, tiebreak = false}) {
    const scores = {};
    let maxScore = 0;

    GAMES.forEach(game => scores[game.id] = 0);

    Object.keys(ballots).map(uid => ballots[uid]).forEach(b => {
      Object.keys(b).forEach(gameType => {
        const vote = b[gameType];
        if (scores[gameType] === undefined) {
          scores[gameType] = 0;
        }
        const gameTotal = scores[gameType] += vote;

        if(gameTotal > maxScore)
          maxScore = gameTotal;
      });
    });

    const winners = Object.keys(scores).filter(gameType => scores[gameType] === maxScore);

    if( tiebreak ){
      while ( winners.length > 1){
        winners.splice( Math.floor(Math.random() * winners.length), 1);
      }
    }

    return {
      scores: scores,
      winners
    };
  }
}

export default PlusMinusVoting;
