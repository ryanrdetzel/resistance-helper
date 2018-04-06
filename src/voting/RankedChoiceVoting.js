
class RankedChoiceVoting {
  static results ({ ballots, tiebreak = false}) {
    const half = ballots.length / 2;
    const rounds = [];
    let candidates = getCandidates(ballots);
    let majority = false;
    let results;
    do {
      results = tallyRound(ballots, candidates);
      rounds.push( zip(results, 'name', 'count'));
      majority = results[0].count > half;
      if (!majority) {
        candidates = nextCandidates(results);
      }
    }
    while (! majority && candidates.length > 1);

    const topScore = results[0].count;
    const winners = results.filter(r =>  r.count === topScore);

    if( tiebreak ){
      while ( winners.length > 1){
        winners.splice( Math.floor(Math.random() * winners.length), 1);
      }
    }

    return {
      rounds,
      winners: winners.map(w => w.name)
    };
  }
}

function nextCandidates (results) {
  const last = results[ results.length -1 ];
  const lowScore =  last.count;
  return results
    .filter(r => r.count > lowScore)
    .map(r => r.name);
}

function tallyRound (ballots, entries) {
  const tally = {};
  entries.forEach(e => {
    tally[e] = {
      count: 0,
      name: e
    };
  });

  ballots.forEach(b => {
    let i = 0, name;
    while (i < b.length) {
      name = b[i];
      if (tally[name] !== undefined) {
        tally[name].count++;
        break;
      }
      i++;
    }
  });

  return sortKeys(tally, (a,b) => {
    return b.count - a.count;
  });
}

function getCandidates (ballots) {
  const candidates = {};
  ballots.forEach( b => {
    b.forEach(name => {
      candidates[name] = true;
    });
  });
  return Object.keys(candidates).sort();
}


function zip (arr, key, valKey){
  const obj = {};
  arr.forEach(o =>{
    obj[ o[key] ] = o[valKey]
  });
  return obj;
}

function sortKeys (obj, sortFn){
  return Object.keys(obj).sort((a,b) => {
    return sortFn(obj[a], obj[b]);
  }).map(key => {
    return obj[key];
  });
}

export default RankedChoiceVoting;
