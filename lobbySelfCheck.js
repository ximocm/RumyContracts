const LobbyCore = require('./lobby.js');

function run() {
    const checks = [];

    let state = LobbyCore.createInitialState({ minPlayersToStart: 2, defaultMaxPlayers: 2 });

    const created = LobbyCore.createTable(state, { name: 'SelfCheck Table' });
    checks.push(created.ok);
    state = created.state;
    checks.push(state.tables.length === 1);
    checks.push(state.selectedTableId === 'T1');

    const cannotStartWithoutPlayers = LobbyCore.startSelectedTable(state);
    checks.push(!cannotStartWithoutPlayers.ok && cannotStartWithoutPlayers.code === 'NOT_ENOUGH_PLAYERS');

    const joinHuman = LobbyCore.addPlayerToSelected(state, 'Human');
    checks.push(joinHuman.ok);
    state = joinHuman.state;

    const joinBot = LobbyCore.addPlayerToSelected(state, 'Computer');
    checks.push(joinBot.ok);
    state = joinBot.state;
    checks.push(LobbyCore.getSelectedTable(state).players.length === 2);

    const joinOverflow = LobbyCore.addPlayerToSelected(state, 'Third');
    checks.push(!joinOverflow.ok && joinOverflow.code === 'TABLE_FULL');

    const started = LobbyCore.startSelectedTable(state);
    checks.push(started.ok);
    state = started.state;
    checks.push(LobbyCore.getSelectedTable(state).status === 'playing');

    const result = {
        ok: checks.every(Boolean),
        checksPassed: checks.filter(Boolean).length,
        checksTotal: checks.length,
        selectedTable: LobbyCore.getSelectedTable(state)
    };

    console.log(JSON.stringify(result));
    process.exit(result.ok ? 0 : 1);
}

run();
