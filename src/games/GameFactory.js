
import NormalGame from './NormalGame';
import DefectorGame from './DefectorGame';
import ReverserGame from './ReverserGame';

export default class GameFactory {
  static gameType(type) {
    switch (type) {
      case 'game-reverser':
        return ReverserGame;
      case 'game-defector':
        return DefectorGame;
      default:
        return NormalGame;
    }
  }
}


