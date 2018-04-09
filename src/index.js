import Auth from './auth/TwitterAuth';
import GameSetup, { GAMES } from './games/Game';
import Voting from './voting/RankedChoiceVoting';
import Role, { CARD_GROUPS } from './games/Roles';
import CustomGame from "./games/CustomGame";

const DEBUG = ( document.location.search.length );


// Production
let config = {
  apiKey: "AIzaSyALThai8CYhmSG91fsN499Kl-Mf1vP-_pY",
  authDomain: "resistance-1ec7a.firebaseapp.com",
  databaseURL: "https://resistance-1ec7a.firebaseio.com",
  projectId: "resistance-1ec7a",
  storageBucket: "resistance-1ec7a.appspot.com",
  messagingSenderId: "383282710233"
};

if( DEBUG ) {
  config = {
    apiKey: "AIzaSyDhSSM3kQmouCbLmrg1GK-qSMZKuLFAW1k",
    authDomain: "test-60f3a.firebaseapp.com",
    databaseURL: "https://test-60f3a.firebaseio.com",
    projectId: "test-60f3a",
    storageBucket: "test-60f3a.appspot.com",
    messagingSenderId: "997935352484"
  };
}


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


  $('#start_custom').click(e => {
    e.preventDefault();

    const custom = {
      ...CustomGame,
      cards: chosenCards
    };
    const gameState = GameSetup(custom, players);
    stateRef.set(gameState);
  });

  renderCustomOptions();
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

    const role = new Role(self);

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
    const visible = role.getVisibleRoles(state.players);
    const $visible = $('#visible_list').empty();
    visible.forEach(r=> {
      const $el = $(`<li>${r.mask ? r.mask  + "?" : r.player.card} (${r.player.name})</li>`);
      if(! r.mask ) {
        $el.addClass(r.isSpy ? 'spy-player' : 'resistance-player');
      }
      $visible.append($el);
    });
    if (!visible.length) {
      $visible.text('(none)')
    }

    const invisible = role.getInvisibleRoles(state.players);
    const $invisible = $('#invisible_list').empty();
    invisible.forEach(r => {
      const $el = $(`<li>${r.player.card}</li>`);
      $el.addClass(r.isSpy ? 'spy-player' : 'resistance-player');
      $invisible.append($el);
    });
    if (!invisible.length) {
      $invisible.text('(none)')
    }

  } else {
    // There is no game state.

    $('#game').show();

    $('#game_custom').hide();
    $('#game_list').show();

    $('#start').show();
    $('#start_custom').hide();

    renderGamesList();

    if (players.length >= MIN_PLAYERS) {
      $('#start').prop("disabled", false);
    } else {
      $('#start').prop("disabled", true);
    }
  }
});

function renderGamesList () {

  if( $('#game_custom').is(":visible") )
    return;

  const $gameList = $('#game_list').empty();
  GAMES.forEach(game => {
    const str = `<button class="pure-button button-large game-option" id="${game.id}">${game.label}</button>`;
    const $el = $(str);
    if( game.minPlayers > players.length ) {
      $el.prop("disabled", true)
        .append(` [${players.length}/${game.minPlayers}]`);
    }
    $gameList.append($el);
  });

  $('#game-custom').click( e => {
    e.preventDefault();
    $('#game_custom').show();
    $('#game_list').hide();
    $('#start').hide();
    $('#start_custom').show();
    renderCustomOptions();
  });

  $('.game-option').click(event => {
    selectGameType(event.target.id);
  });

  $gameList.show();


  renderSelections();
}



function renderRolePill (role){
  const $el = $(`<button>${role.card}</button>`);
  $el.addClass('custom-card');
  $el.addClass(role.isSpy ? 'spy-player' : 'resistance-player');
  return $el;
}

const chosenCards = [];
function renderCustomOptions (){
  const $available = $('#cards_available').empty();
  CARD_GROUPS.forEach(group => {
    $(`<div class='cards-section'>${group.label}</div>`).appendTo($available);

    const $ul = $("<ul />").appendTo($available);
    $available.append().append($ul);
    group.cards.map(card => Role.fromCard(card)).forEach(role => {
      const $el = renderRolePill(role);
      $el.addClass('custom-card');
      $ul.append($el);
    });
  });

  const $chosen = $('#cards_chosen').empty();
  chosenCards.map(card => Role.fromCard(card)).forEach( role => {
    const $el = $(`<button>${role.card}</button>`);
    $el.addClass('custom-card');
    $el.addClass(role.isSpy ? 'spy-player' : 'resistance-player');
    $chosen.append($el);
  });

  $available.find('.custom-card').click(e => {
    e.preventDefault();
    const card = $(e.target).text();
    chosenCards.push(card);
    renderCustomOptions();
  });

  $chosen.find('.custom-card').click(e => {
    e.preventDefault();
    const card = $(e.target).text();
    const i = chosenCards.indexOf(card);
    chosenCards.splice(i, 1);
    renderCustomOptions();
  });

  $('#start_custom').prop('disabled', chosenCards.length !== players.length);
  $('#start_custom_count').text( `${chosenCards.length} / ${players.length}`);
}


listRef.on("value", function (snap) {
  const playerCount = snap.numChildren();

  $('#playerList').empty();

  const playerList = snap.val();
  players = Object.keys(playerList).map(uid => playerList[uid]);

  const playerNames = players.map(p => p.name).sort();

  playerNames.forEach(name => {
    const str = `<li>${name}</li>`;
    $('#playerList').append(str);
  });

  $('.peopleCount').html(playerCount);
  renderGamesList();
  renderGameStartButton();
  renderCustomOptions();
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

  renderSelections();

  if (user && user.uid) {
    const ballotRef = firebase.database().ref(`ballots/${user.uid}`);
    ballotRef.update({
      primary: selectedGameTypePrimary,
      secondary: selectedGameTypeSecondary
    });
    ballotRef.onDisconnect().remove();
  }
}

function renderSelections(){
  $('.game-option').removeClass('button-secondary').removeClass('button-success');
  if (selectedGameTypePrimary !== "") $('#' + selectedGameTypePrimary).addClass('button-success');
  if (selectedGameTypeSecondary !== "") $('#' + selectedGameTypeSecondary).addClass('button-secondary');
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

  if (type == 'game-custom'){
    $('#game-custom').click();
    return;
  }
  const gameState = GameSetup(type, players);
  stateRef.set(gameState);
  $('#start').prop("disabled", true);
}
