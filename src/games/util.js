import { Role } from './Roles';


export function getVisible (uid, players) {
  const self = players[uid];
  if (self){
    return []
  }
  const canSee = Role(self.card).canSee;
  return Object.keys(players)
    .map(id => players[id])
    .filter(p => {
      return canSee.indexOf(p.card) !== -1
    });
}


