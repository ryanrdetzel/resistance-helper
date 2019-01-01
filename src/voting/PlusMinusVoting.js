import {GAMES} from '../cards/Game';

class PlusMinusVoting {
  static results({ballots, tiebreak = false}) {
    const scores = {};

    GAMES.forEach(game => scores[game.id] = 0);

    Object.keys(ballots).map(uid => ballots[uid]).forEach(b => {
      Object.keys(b).forEach(gameType => {
        const vote = b[gameType];
        if (scores[gameType] === undefined) {
          scores[gameType] = 0;
        }
        scores[gameType] += vote;
      });
    });

    const values = Object.keys(scores).map(gameType => scores[gameType]);

    const maxScore = Math.max.apply(Math, values);
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
