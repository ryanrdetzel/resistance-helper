import Auth from './auth/TwitterAuth';
import Game from './games/Game';
import Voting from './voting/RankedChoiceVoting';
import Role, { OBSERVER } from './games/Roles';

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDhSSM3kQmouCbLmrg1GK-qSMZKuLFAW1k",
  authDomain: "test-60f3a.firebaseapp.com",
  databaseURL: "https://test-60f3a.firebaseio.com",
  projectId: "test-60f3a",
  storageBucket: "test-60f3a.appspot.com",
  messagingSenderId: "997935352484"
};
firebase.initializeApp(config);

var MIN_PLAYERS = 2;

var players = [];
var selectedGameTypePrimary = '';
var selectedGameTypeSecondary = '';

const listRef = firebase.database().ref("presense");
const stateRef = firebase.database().ref("state");
const ballotsRef = firebase.database().ref('ballots');


const auth = new Auth({
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
    renderGameStartButton();
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
      // logged in after the game
      self = { ...user, card: OBSERVER };
    }

    // Check these are valid.

    const role = Role(self);

    $('#game_type').text(state.game.label);
    $('.playerCount').html( Object.keys(state.players).length );

    $('#first_player').text(state.first.name);
    $('#team')
      .text(self.card)
      .removeClass('resistance').removeClass('spy').removeClass('observer');

    if (role.isSpy) {
      $('#team').addClass('spy');
    }
    else if (role.isSpy === false ) {
      $('#team').addClass('resistance');
    }
    else {
      $('#team').addClass('observer');
    }
    const visible = role.getVisible(state.players);
    $('#visible_list').empty();
    visible.forEach(p => {
      const otherRole = Role(p);
      $('#visible_list').append(`<li>${p.name} (${otherRole.mask || p.card})</li>`);
    });
    if (!visible.length) {
      $('#visible_list').text('(none)')
    }

    const invisible = role.getInvisibleCards(state.players);
    $('#invisible_list').empty();
    invisible.forEach(card => {
      $('#invisible_list').append(`<li>${card}</li>`);
    });
    if (!invisible.length) {
      $('#invisible_list').text('(none)')
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

  const playerList = snap.val();
  players = Object.keys(playerList).map(uid => playerList[uid]);

  const playerNames = players.map(p => p.name).sort();

  playerNames.forEach(name => {
    $('#playerList').append(`<li>${name}</li>`);
  });

  $('.peopleCount').html(playerCount);
  renderGameStartButton();
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

let ballots = [];
ballotsRef.on('value', snapshot => {
  const userBallots = snapshot.val() || {};
  ballots = Object.keys(userBallots).map(uid => userBallots[uid] );
  renderGameStartButton();
});

function renderGameStartButton () {
  const hasPlayers = players.length >= MIN_PLAYERS;
  const hasBallot = ballots.length > 0;
  $('#start').prop("disabled", !(hasPlayers && hasBallot));
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

function onGameType (type) {
  const gameState = Game(type, players);
  stateRef.set(gameState);
  $('#start').prop("disabled", true);
}
