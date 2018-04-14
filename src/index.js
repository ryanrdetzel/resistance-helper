import Auth from './auth/TwitterAuth';
import GameSetup, { GAMES } from './games/Game';
import Voting from './voting/RankedChoiceVoting';
import Role, { OBSERVER, CARD_GROUPS } from './games/Roles';
import CustomGame from "./games/CustomGame";

import $ from 'jquery';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const DEBUG = ( document.location.search === '?debug' );

// Production
let config = {
  apiKey: 'AIzaSyALThai8CYhmSG91fsN499Kl-Mf1vP-_pY',
  authDomain: 'resistance-1ec7a.firebaseapp.com',
  databaseURL: 'https://resistance-1ec7a.firebaseio.com',
  projectId: 'resistance-1ec7a',
  storageBucket: 'resistance-1ec7a.appspot.com',
  messagingSenderId: '383282710233'
};

if( DEBUG ) {
  config = {
    apiKey: 'AIzaSyDhSSM3kQmouCbLmrg1GK-qSMZKuLFAW1k',
    authDomain: 'test-60f3a.firebaseapp.com',
    databaseURL: 'https://test-60f3a.firebaseio.com',
    projectId: 'test-60f3a',
    storageBucket: 'test-60f3a.appspot.com',
    messagingSenderId: '997935352484'
  };
}

firebase.initializeApp(config);

const appState = {
  players: {},
  selectedGameTypePrimary: '',
  selectedGameTypeSecondary: '',
};

const listRef = firebase.database().ref("presense");
const stateRef = firebase.database().ref("state");
const ballotsRef = firebase.database().ref('ballots');


let ui;

$(function () {
  ui = {
    lobby : $('#lobby'),
    join: $('#join'),
    newGame: $('#newGame'),
    start: $('#start'),
    start_custom: $('#start_custom'),
    game_list: $('#game_list'),
    game_custom: $('#game_custom'),
    game: $('#game'),
    game_type: $('#game_type'),
    results: $('#results'),
    first_player: $('#first_player'),
    team: $('#team'),
    playerCount: $('.playerCount'),
    peopleCount: $('.peopleCount'),
    visible_list: $('#visible_list'),
    cards_available: $('#cards_available'),
    cards_chosen: $('#cards_chosen'),
    start_custom_count: $('#start_custom_count'),
    playerList: $('#playerList'),
  };

  ui.newGame.click(function () {
    stateRef.remove();
    renderGameStartButton();
  });

  ui.start.click(function () {
    startGame();
  });

  ui.join.click(function () {
    auth.signIn();
  });

  ui.start_custom.click(e => {
    e.preventDefault();

    const custom = {
      ...CustomGame,
      cards: chosenCards
    };
    const gameState = GameSetup(custom, appState.players);
    stateRef.set(gameState);
  });

  const auth = new Auth({
    firebase,
    onAuth(user){
      if (user) {
        const userRef = firebase.database().ref('presense/' + user.uid);
        userRef.update(user);
        userRef.onDisconnect().remove();
        ui.lobby.hide();
      }
      else {
        ui.lobby.show();
      }
    },
    onError() {
      // console.error("Auth ERROR: " , error.message);
    }
  });

  renderCustomOptions();
});


stateRef.on('value', function (snap) {
  const state = snap.val();
  const user = firebase.auth().currentUser;

  ui.game.hide();
  ui.results.hide();

  if (!user) {
    return;
  }

  if (state && user) {

    $('#results').show();

    const myuid = user.uid;

    let self = state.players[myuid];

    if (!self) {
      // logged in after the game
      self = {...user, card: OBSERVER};
    }

    // Check these are valid.

    const role = new Role(self);

    ui.game_type.text(state.game.label);
    ui.playerCount.html(Object.keys(state.players).length);

    ui.first_player.text(appState.first.name);
    ui.team
      .text(self.card)
      .removeClass('resistance').removeClass('spy').removeClass('observer');

    if (role.isSpy) {
      ui.team.addClass('spy');
    }
    else if (role.isSpy === false) {
      ui.team.addClass('resistance');
    }
    else {
      ui.team.addClass('observer');
    }
    const visible = role.getVisibleRoles(appState.players);
    ui.visible_list.empty();
    visible.forEach(r => {
      const $el = $(`<li>${r.mask ? r.mask : r.player.card} (${r.player.name})</li>`);
      let isSpy = r.isSpy;
      if (r.mask) {
        isSpy = Role.fromCard(r.mask).isSpy;
      }
      $el.addClass(isSpy ? 'spy-player' : 'resistance-player');
      ui.visible_list.append($el);
    });
    if (!visible.length) {
      ui.visible_list.text('(none)');
    }

    const invisible = role.getInvisibleRoles(appState.players);
    const $invisible = $('#invisible_list').empty();
    invisible.forEach(r => {
      const $el = $(`<li>${r.player.card}</li>`);
      $el.addClass(r.isSpy ? 'spy-player' : 'resistance-player');
      $invisible.append($el);
    });
    if (!invisible.length) {
      $invisible.text('(none)');
    }

  } else {
    // There is no game state.

    ui.game.show();

    ui.game_custom.hide();
    ui.game_list.show();


    renderGamesList();

    ui.start_custom.hide();
    ui.start.show().prop("disabled", appState.players.length >= 5);
  }
});

function renderGamesList () {

  if( ui.game_custom.is(":visible") )
    return;

  ui.game_list.empty();
  GAMES.forEach(game => {
    const str = `<button class="pure-button button-large game-option" id="${game.id}">${game.label}</button>`;
    const $el = $(str);
    if( game.minPlayers > appState.players.length ) {
      $el.prop("disabled", true)
        .append(` [${appState.players.length}/${game.minPlayers}]`);
    }
    ui.game_list.append($el);
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

  ui.game_list.show();

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
  ui.cards_available.empty();
  CARD_GROUPS.forEach(group => {
    const $ul = $("<ul />").appendTo(ui.cards_available);
    ui.cards_available.append($ul);
    group.cards.map(card => Role.fromCard(card)).forEach(role => {
      const $el = renderRolePill(role);
      $el.addClass('custom-card');
      $ul.append($el);
    });
  });

  ui.cards_chosen.empty();
  chosenCards.map(card => Role.fromCard(card)).forEach( role => {
    const $el = $(`<button>${role.card}</button>`);
    $el.addClass('custom-card');
    $el.addClass(role.isSpy ? 'spy-player' : 'resistance-player');
    ui.cards_chosen.append($el);
  });

  ui.cards_available.find('.custom-card').click(e => {
    e.preventDefault();
    const card = $(e.target).text();
    chosenCards.push(card);
    renderCustomOptions();
  });

  ui.cards_chosen.find('.custom-card').click(e => {
    e.preventDefault();
    const card = $(e.target).text();
    const i = chosenCards.indexOf(card);
    chosenCards.splice(i, 1);
    renderCustomOptions();
  });

  ui.start_custom.prop('disabled', chosenCards.length !== appState.players.length);
  ui.start_custom_count.text( `${chosenCards.length} / ${appState.players.length}`);
}


listRef.on("value", function (snap) {
  const playerCount = snap.numChildren();

  ui.playerList.empty();

  const playerList = snap.val();
  appState.players = Object.keys(playerList).map(uid => playerList[uid]);

  const playerNames = appState.players.map(p => p.name).sort();

  playerNames.forEach(name => {
    const str = `<li>${name}</li>`;
    ui.playerList.append(str);
  });

  ui.peopleCount.text(playerCount);

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
  if (button_id === appState.selectedGameTypePrimary){
    // Swap
    tmp = appState.selectedGameTypeSecondary;
    appState.selectedGameTypeSecondary = appState.selectedGameTypePrimary;
    appState.selectedGameTypeSecondary = tmp;
  }else if (button_id === appState.selectedGameTypeSecondary){
    // Swap
    tmp = appState.selectedGameTypePrimary;
    appState.selectedGameTypePrimary = appState.selectedGameTypeSecondary;
    appState.selectedGameTypeSecondary = tmp;
  }else{
    if (appState.selectedGameTypePrimary === "")  appState.selectedGameTypePrimary = button_id;
    else  appState.selectedGameTypeSecondary = button_id;
  }

  renderSelections();

  if (user && user.uid) {
    const ballotRef = firebase.database().ref(`ballots/${user.uid}`);
    ballotRef.update({
      primary: appState.selectedGameTypePrimary,
      secondary: appState.selectedGameTypeSecondary
    });
    ballotRef.onDisconnect().remove();
  }
}

function renderSelections(){
  $('.game-option').removeClass('button-secondary').removeClass('button-success');
  if (appState.selectedGameTypePrimary !== "") $('#' + appState.selectedGameTypePrimary).addClass('button-success');
  if (appState.selectedGameTypeSecondary !== "") $('#' + appState.selectedGameTypeSecondary).addClass('button-secondary');
}

let ballots = [];
ballotsRef.on('value', snapshot => {
  const userBallots = snapshot.val() || {};
  ballots = Object.keys(userBallots).map(uid => userBallots[uid] );
  renderGameStartButton();
});

function renderGameStartButton () {
  const hasPlayers = appState.players.length >= 2;
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

  if (type === 'game-custom'){
    ui.game_custom.click();
    return;
  }

  const gameState = GameSetup(type, appState.players);
  stateRef.set(gameState);
  ui.start.prop("disabled", true);
}
