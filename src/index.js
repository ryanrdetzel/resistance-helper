import GameAuth from './auth/TwitterAuth';
import GameFactory from './games/GameFactory';
import Voting from './voting/RankedChoiceVoting';

// Initialize Firebase
const config = {
  apiKey: "AIzaSyALThai8CYhmSG91fsN499Kl-Mf1vP-_pY",
  authDomain: "resistance-1ec7a.firebaseapp.com",
  databaseURL: "https://resistance-1ec7a.firebaseio.com",
  projectId: "resistance-1ec7a",
  storageBucket: "resistance-1ec7a.appspot.com",
  messagingSenderId: "383282710233"
};
firebase.initializeApp(config);

var MIN_PLAYERS = 2;

var players = [];
var selectedGameTypePrimary = '';
var selectedGameTypeSecondary = '';

var listRef = firebase.database().ref("presense");
var stateRef = firebase.database().ref("state");

const auth = new GameAuth({
  onAuth(user){
    if (user) {
      const userRef = firebase.database().ref("presense/" + user.uid);
      userRef.update(user);
      userRef.onDisconnect().remove();
      $('#lobby').hide();
    }
    else {
      $('#lobby').show();
    }
  },
  onError(error) {
    console.log("Auth ERROR: " , error.message);
  }
});

$(function () {
  $('#newGame').click(function () {
    stateRef.remove();
  });

  $('#start').click(function () {
    startGame();
  });

  $('#join').click(function () {
    auth.signIn();
  });

  $('.game-option').click(function(event) {
    selectGameType(event.target.id);
  });

  selectGameType('game-normal');
});


stateRef.on("value", function (snap) {
  const state = snap.val();
  const user = firebase.auth().currentUser;

  $('#game').hide();
  $('#results').hide();

  if (!user){
    return;
  }

  if (state && user) {

    $('#results').show();

    const myuid = user.uid;

    let self = state.players[myuid];

    if (! self){
      self = {
        ...user,
        role: 'observer'
      }
    }
    // Check these are valid.

    const game = GameFactory.gameType(state.type);
    const visible = game.filterVisible(myuid, state.players);

    $('#game_type').text(game.LABEL.toUpperCase());

    $('#first_player').text(state.first.name);
    $('#team').text(self.role.toUpperCase());
    $('#team').removeClass('resistance').removeClass('spy').removeClass('observer');

    if (self.isSpy) {
      $('#team').addClass('spy');
    }
    else if (self.isSpy === false ) {
      $('#team').addClass('resistance');
    }
    else {
      $('#team').addClass('observer');
    }

    if( visible.length ) {
      $('#visible_list').empty();
      visible.forEach(p => {
        $('#visible_list').append(`<li>${p.name} (${p.role.toUpperCase()})</li>`);
      });
    }
    else {
      $('#visible_list').text('(none)')
    }
  } else {
    // There is no game state.
    $('#game').show();

    if (players.length >= MIN_PLAYERS) {
      $('#start').prop("disabled", false);
    } else {
      $('#start').prop("disabled", true);
    }
  }
});

listRef.on("value", function (snap) {
  const playerCount = snap.numChildren();

  $('#playerList').empty();

  players = [];
  snap.forEach(child => {
    players.push(child.val());
    $('#playerList').append('<li>' + child.val().name + '</li>');
  });

  $('#playerCount').html(playerCount);

  if (playerCount >= MIN_PLAYERS) {
    $('#start').prop("disabled", false);
  } else {
    $('#start').prop("disabled", true);
  }

});

function selectGameType(button_id){
  // If it's primary, ignore
  // if it's secondary, make primary
  // If it's not, make it secondary

  const user = firebase.auth().currentUser;

  let tmp;
  if (button_id === selectedGameTypePrimary){
    // Swap
    tmp = selectedGameTypeSecondary;
    selectedGameTypeSecondary = selectedGameTypePrimary;
    selectedGameTypeSecondary = tmp;
  }else if (button_id === selectedGameTypeSecondary){
    // Swap
    tmp = selectedGameTypePrimary;
    selectedGameTypePrimary = selectedGameTypeSecondary;
    selectedGameTypeSecondary = tmp;
  }else{
    if (selectedGameTypePrimary === "")  selectedGameTypePrimary = button_id;
    else  selectedGameTypeSecondary = button_id;
  }

  $('.game-option').removeClass('button-secondary').removeClass('button-success');
  if (selectedGameTypePrimary !== "") $('#' + selectedGameTypePrimary).addClass('button-success');
  if (selectedGameTypeSecondary !== "") $('#' + selectedGameTypeSecondary).addClass('button-secondary');

  if (user && user.uid) {
    const ballotRef = firebase.database().ref(`ballots/${user.uid}`);
    ballotRef.update({
      primary: selectedGameTypePrimary,
      secondary: selectedGameTypeSecondary
    });
    ballotRef.onDisconnect().remove();
  }
}

function startGame () {
  resolveGameType();
}

function resolveGameType () {
  const ballotsRef = firebase.database().ref('ballots');
  ballotsRef.once('value', snapshot => {
    const userBallots = snapshot.val();
    const ballots = Object.keys(userBallots).map(user => {
      const b = userBallots[user];
      return [ b.primary, b.secondary ];
    });
    const results = Voting.results({ballots, tiebreak: true});
    onGameType(results.winners[0]);
  })
}

/*
  Choose the teams.
  Choose who goes first
*/
function onGameType( gameType ) {

  const game = GameFactory.gameType(gameType);

  /* Who goes first? */
  const firstIndex = Math.floor( Math.random() * players.length);
  const first = players[firstIndex];

  const setup = game.setup(players);
  stateRef.set({
    type: gameType,
    players: setup.players,
    deck: setup.deck,
    first
  });

  $('#start').prop("disabled", true);
}
