import $ from 'jquery';
import Role, {CARD_GROUPS, OBSERVER, sortByTeamType} from '../cards/Roles';
import {GAMES} from '../cards/Game';
import { getCookie } from '../auth/util'

export function render(app) {
  renderLobby(app);
  renderGameState(app);
  renderCustomOptions(app);
  renderPlayerList(app);
  renderGameStartButton(app);
  renderRoleVisibility(app);
}

export function initDom(app) {
  const ui = app.ui = {
    $lobby: $('#lobby'),
    $join: $('#join'),
    $guest_join: $('#guest_join'),
    $guest_username: $('#guest_username'),
    $newGame: $('#newGame'),
    $ready_btn: $('#ready_btn'),
    $start_custom: $('#start_custom'),
    $game_list: $('#game_list'),
    $game: $('#game'),
    $game_type: $('#game_type'),
    $custom_chooser: $('#custom_chooser'),
    $results: $('#results'),
    $reset_votes: $('#reset_votes'),
    $first_player: $('#first_player'),
    $team: $('#team'),
    $playerCount: $('.playerCount'),
    $peopleCount: $('.peopleCount'),
    $visible_list: $('#visible_list'),
    $cards_available: $('#cards_available'),
    $cards_chosen: $('#cards_chosen'),
    $start_custom_count: $('#start_custom_count'),
    $playerList: $('.playerList'),
  };


  ui.$newGame.click(e => {
    e.preventDefault();
    app.resetGame();
  });

  ui.$ready_btn.click( e => {
    if (e.ctrlKey || e.shiftKey || e.metaKey) {
      app.forceStart();
      return;
    }
    app.toggleUserReady();
  });

  ui.$ready_btn.bind('touchstart',  e => {
    e.preventDefault();
    if (e.touches.length > 1) {
      app.forceStart();
      return;
    }
    app.toggleUserReady();
  });

  ui.$join.click(app.signIn);
  ui.$guest_join.click( e =>  {
    var username = ui.$guest_username.val();
    if (username.length == 0) {
      return;
    }
    app.signInGuest(username);
  });

  ui.$start_custom.click(e => {
    e.preventDefault();
    app.startCustomGame();
  });

  ui.$reset_votes.click(e => {
    e.preventDefault();
    app.resetVotes();
  });

  $('#sensitive_msg').bind('touchstart mousedown', onSensitivePeek);
  $(document).bind('touchend mouseup', onSensitiveHide);
}

function onSensitivePeek (e) {
  e.preventDefault();
  $('.sensitive').css('display', 'block');
}
function onSensitiveHide () {
  $('.sensitive').css('display', 'none');
}

function renderGameState(app) {
  const {currentPlayer, gameState, ui} = app;
  const { $game_type, $playerCount, $first_player,
    $results, $team, $visible_list} = ui;

  if (!currentPlayer || !gameState) {
    $results.hide();
    return;
  }

  const { players, game } = gameState;

  let self = players[currentPlayer.uid];

  if (!self) {
    // logged in after the game
    self = {...currentPlayer, card: OBSERVER};
  }

  // render visible other players
  const role = new Role(self);

  $game_type.text(gameState.game.label);
  $playerCount.html(Object.keys(players).length);

  $first_player.text(gameState.first.name);
  $team
    .text(self.card)
    .removeClass('resistance').removeClass('spy').removeClass('observer');

  if (role.isSpy) {
    $team.addClass('spy');
  }
  else if (role.isSpy === false) {
    $team.addClass('resistance');
  }
  else {
    $team.addClass('observer');
  }

  const visibleRoles = Role.getVisibleRoles(currentPlayer.uid, gameState);

  $visible_list.empty();

  const $own_role = $('#own_role').empty();
  const $el = $(`<li><b>${role.card}</b></li>`);

  if (role.isSpy) {
    $el.addClass('spy-player');
  }
  else if (role.isSpy === false){
    $el.addClass('resistance-player');
  }
  $own_role.append($el);

  visibleRoles.forEach(player => {
    const role = player.role;
    let $el;
    if (player.visible){
      $el = $(`<li><b>${player.name}</b> &mdash; ${role.card}</li>`);
      if (role.isPossibleImposter(game.cards)) {
        $el.addClass('possible-imposter-player');
        $el.append('?');
      }
      else if( role.isSpy ){
        $el.addClass('spy-player');

      } else {
        $el.addClass('resistance-player');
      }
      $visible_list.append($el);
    }
  });

  if (! $visible_list.children().length) {
    $visible_list.text('-');
  }

  $results.show();
}

function renderLobby(app) {
  const { currentPlayer, gameState, ui } = app;
  const { $lobby, $game, $guest_username } = ui;

  $lobby.hide();
  $game.hide();

  if (gameState) {
    return;
  }

  if (!currentPlayer){
    let cookiedUserName = getCookie("username");
    if (cookiedUserName !== undefined) {
        $guest_username.val(cookiedUserName);
    }
    $lobby.show();
    return;
  }

  renderGamesList(app);

  $game.show();
}

function renderGamesList (app) {
  const { custom, selected, presenceCount, ui } = app;
  const { $game_list } = ui;

  $game_list.empty();

  if( custom.isCustom ) {
    return;
  }

  GAMES.forEach(game => {

    const str = `<button class='pure-button button-large game-option' id='${game.id}'>${game.label}</button>`;
    const $el = $(str);

    if( game.minPlayers > presenceCount ) {
      $el.css('font-style', 'italic');
    }

    if( $el.text().length > 18 ){
      $el.addClass('smaller');
    }

    const gameVote = selected[game.id] || 0;
    if( gameVote === 1 )
      $el.addClass('button-vote-up');

    if( gameVote === -1 )
      $el.addClass('button-vote-down');

    $el.prop('disabled', selected.isReady);

    $game_list.append($el);
  });

  $('#game-custom').click(e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    app.setCustomGame();
  });

  $('<br/>').insertBefore('#game-custom');

  const $game_option = $('.game-option');
  $game_option.click(event => {
    cycleGameTypeVote(app, event.target.id);
    event.preventDefault();
  });

  $game_list.show();
}

function cycleGameTypeVote (app, button_id) {
  const { selected } = app;

  const oldVote = selected[button_id] || 0;
  let newVote;
  switch (oldVote){
    case 1:
      newVote = -1;
      break;
    case 0:
      newVote = 1;
      break;
    default:
      newVote = 0;
  }
  app.setGameVote(button_id, newVote);
}

function renderCustomOptions(app) {
  const { custom, presenceCount, ui } = app;
  const { isCustom, cards } = custom;
  const { $cards_available, $cards_chosen, $start_custom,
    $custom_chooser, $start_custom_count } = ui;

  if (!isCustom) {
    $custom_chooser.hide();
    $start_custom.hide();
    return;
  }

  $cards_available.empty();
  CARD_GROUPS.forEach(group => {
    const $ul = $('<ul />').appendTo($cards_available);
    $cards_available.append($ul);
    group.map(card => Role.fromCard(card)).forEach(role => {
      const $el = renderRolePill(role);
      $el.addClass('pure-button');
      $el.addClass('custom-card');
      $ul.append($el);
    });
  });

  $cards_chosen.empty();
  cards.map(card => Role.fromCard(card)).forEach(role => {
    const $el = $(`<button>${role.card}</button>`);
    $el.addClass('custom-card');
    $el.addClass(role.isSpy ? 'spy-player' : 'resistance-player');
    $cards_chosen.append($el);
  });

  $cards_available.find('.custom-card').click(e => {
    e.preventDefault();
    const card = $(e.target).text();
    app.addCustomCard(card);
  });

  $cards_chosen.find('.custom-card').click(e => {
    e.preventDefault();
    const card = $(e.target).text();
    app.removeCustomCard(card);
  });

  $custom_chooser.show();
  $start_custom.show().prop('disabled', cards.length !== presenceCount);
  $start_custom_count.text(`${cards.length} / ${presenceCount}`);
}

function renderRolePill(role) {
  const $el = $(`<button>${role.card}</button>`);
  $el.addClass('custom-card');
  $el.addClass(role.isSpy ? 'spy-player' : 'resistance-player');
  return $el;
}

function renderGameStartButton (app) {
  const { custom, currentPlayer, readyCount, presenceCount, ui } = app;
  const { $ready_btn } = ui;

  if( custom.isCustom || ! currentPlayer){
    $ready_btn.hide();
    return;
  }

  $ready_btn.show();
  // $ready_btn.prop('disabled', currentPlayer.isReady);

  if (!currentPlayer.isReady) {
    $ready_btn
      .addClass('ready-initial')
      .text('Click when Ready');
  }
  else {
    $ready_btn
      .removeClass('ready-initial')
      .text(`Waiting for others... (${readyCount}/${presenceCount})`);

  }
}

function renderPlayerList (app) {
  const { presence, presenceCount, ui} = app;
  const {$playerList, $peopleCount} = ui;
  const presenceList = Object.keys(presence).map(uid => presence[uid]);

  $playerList.empty();

  const players = app.gameState ? Object.values(app.gameState.players) : presenceList;
  players.forEach(person => {
    const str = `<li>${person.name}${person.isReady ? '✓' : ''}</li>`;
    $playerList.append(str);
  });

  $peopleCount.text(players.length);
}


function renderRoleVisibility (app){
  const $vis = $('#visibility').empty();
  const { gameState } = app;
  if (! gameState)
    return;

  const roles = sortedRoles(gameState.cards);

  roles.forEach( (perspective, i) => {
    const $row = $('<div class="matrix-row" />');

    roles.forEach( (actualRole, j) => {

      // don't need to see self
      if ( i === j) {
        return;
      }

      const viewableCard = perspective.asVisibleCard(actualRole.card);
      const visibleRole = Role.fromCard(viewableCard||actualRole.card);

      if (!viewableCard) {
        return;
      }


      const $el = $('<div class="matrix-cell matrix-role"></div>');

      if (viewableCard === actualRole.card) {
        $el.text( actualRole.card );
      }
      else {
        $el.text(`(${actualRole.card})`);
      }

      $el.addClass(visibleRole.isSpy ? 'spy-player' : 'resistance-player');

      if (visibleRole.isPossibleImposter(gameState.cards)) {
        $el.addClass('possible-imposter-player');
        $el.text(`(${actualRole.card})`);
        if (actualRole.isSpy) {
          $el.addClass('spy-imposter');
        }
        else {
          $el.addClass('resistence-imposter');
        }
      }

      $row.append($el);
    });

    if ($row.children().length === 0) {
      $row.append('<div class="matrix-cell matrix-role"> &ndash; </div>');
    }
    const $el = $(`<div class="matrix-cell matrix-label">${perspective.card}</div>`);
    $el.addClass(perspective.isSpy? 'spy-imposter' : 'resistence-imposter');
    $row.prepend($el);
    $row.appendTo($vis);

  });
}

function sortedRoles (cards){
  return cards.map(c => Role.fromCard(c)).sort(sortByTeamType);
}
