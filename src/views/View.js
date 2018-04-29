import $ from 'jquery';
import Role, {CARD_GROUPS, OBSERVER, sortByTeamType} from '../games/Roles';
import {GAMES} from '../games/Game';

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
    $newGame: $('#newGame'),
    $ready_btn: $('#ready_btn'),
    $start_custom: $('#start_custom'),
    $game_list: $('#game_list'),
    $game: $('#game'),
    $game_type: $('#game_type'),
    $custom_chooser: $('#custom_chooser'),
    $results: $('#results'),
    $first_player: $('#first_player'),
    $team: $('#team'),
    $playerCount: $('.playerCount'),
    $peopleCount: $('.peopleCount'),
    $visible_list: $('#visible_list'),
    $cards_available: $('#cards_available'),
    $cards_chosen: $('#cards_chosen'),
    $start_custom_count: $('#start_custom_count'),
    $playerList: $('#playerList'),
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
    app.setUserReady
  });

  ui.$join.click(app.signIn);

  ui.$start_custom.click(e => {
    e.preventDefault();
    app.startCustomGame();
  });
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
  $el.addClass(role.isSpy ? 'spy-player' : 'resistance-player');
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
    $visible_list.text('(none)');
  }

  $results.show();
}

function renderLobby(app) {
  const { currentPlayer, gameState, ui } = app;
  const { $lobby, $game} = ui;

  $lobby.hide();
  $game.hide();

  if (gameState) {
    return;
  }

  if (!currentPlayer){
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
      $el.prop('disabled', true).append(`*${game.minPlayers}`);
    }

    if( $el.text().length > 18 ){
      $el.addClass('smaller');
    }

    if( game.id === selected.primary )
      $el.addClass('button-success');

    if( game.id === selected.secondary )
      $el.addClass('button-secondary');

    $el.prop('disabled', selected.isReady);

    $game_list.append($el);
  });

  $('#game-custom').click(e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    app.setCustomGame();
  });

  const $game_option = $('.game-option');
  $game_option.click(event => {
    handleGameTypeSelect(app, event.target.id);
  });

  $game_list.show();
}

function handleGameTypeSelect(app, button_id){
  // If it's primary, ignore
  // if it's secondary, make primary
  // If it's not, make it secondary
  const { selected } = app;
  let { primary, secondary } = selected;

  if (button_id === primary || button_id === secondary ){
    // Swap
    [ primary, secondary ] = [ secondary, primary ];
  } else {
    if (!primary)
      primary = button_id;
    else
      secondary = button_id;
  }
  app.setSelectedGames(primary, secondary);
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
    group.cards.map(card => Role.fromCard(card)).forEach(role => {
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
  $ready_btn.prop('disabled', currentPlayer.isReady);

  if (!currentPlayer.isReady) {
    $ready_btn.text('Ready');
  }
  else {
    $ready_btn.text(`${readyCount} / ${presenceCount} ready...`);

  }
}

function renderPlayerList (app) {
  const { presence, presenceCount, ui} = app;
  const {$playerList, $peopleCount} = ui;
  const presenceList = Object.keys(presence).map(uid => presence[uid]);

  $playerList.empty();
  presenceList.forEach(person => {
    const str = `<li>${person.name} ${person.isReady ? '✔' : ''}</li>`;
    $playerList.append(str);
  });

  $peopleCount.text(presenceCount);
}


function renderRoleVisibility (app){
  const $vis = $('#visibility').empty();

  if (! app.gameState)
    return;

  const roles = sortedUniqueRoles(app.gameState.game.cards);

  roles.forEach(perspective => {
    const $row = $('<div class="matrix-row" />');

    roles.forEach(actualRole => {
      const viewableCard = perspective.asVisibleCard(actualRole.card);
      const visibleRole = Role.fromCard(viewableCard||actualRole.card);

      if (!viewableCard) {
        return;
      }

      const $el = $('<div class="matrix-cell matrix-role"></div>');

      if (viewableCard === actualRole.card) {
        $el.text( actualRole.card )
      }
      else {
        $el.text(`(${actualRole.card})`);
      }

      $el.addClass(visibleRole.isSpy ? 'spy-player' : 'resistance-player');

      if (visibleRole.isSpy && !actualRole.isSpy){
        $el.addClass('resistence-imposter');
      }
      if (!visibleRole.isSpy && actualRole.isSpy){
        $el.addClass('spy-imposter');
      }

      $row.append($el);
    });

    if ($row.children().length === 0) {
      $row.append(`<div class="matrix-cell matrix-role">-</div>`);
    }
    $row.prepend(`<div class="matrix-cell matrix-label">${perspective.card}</div>`);
    $row.appendTo($vis);

  });
}

function sortedUniqueRoles (cards){
  const seen = {};
  const unique = cards.filter(card => {
    if (seen[card] )
      return false;
    return seen[card] = true;
  });

  return unique.map(c => Role.fromCard(c)).sort(sortByTeamType)
}