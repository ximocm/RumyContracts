// Minimal local lobby/table state (single-browser foundation, no networking).

(function (globalScope) {
    function createInitialState(config = {}) {
        return {
            tables: [],
            selectedTableId: null,
            nextTableId: 1,
            limits: {
                minPlayersToStart: config.minPlayersToStart || 2,
                defaultMaxPlayers: config.defaultMaxPlayers || 4
            }
        };
    }

    function cloneState(state) {
        return {
            tables: state.tables.map(t => ({
                id: t.id,
                name: t.name,
                status: t.status,
                maxPlayers: t.maxPlayers,
                players: t.players.slice()
            })),
            selectedTableId: state.selectedTableId,
            nextTableId: state.nextTableId,
            limits: { ...state.limits }
        };
    }

    function getSelectedTable(state) {
        return state.tables.find(t => t.id === state.selectedTableId) || null;
    }

    function createTable(state, payload = {}) {
        const next = cloneState(state);
        const tableId = `T${next.nextTableId}`;
        const requestedMax = payload.maxPlayers || next.limits.defaultMaxPlayers;
        const maxPlayers = Math.max(2, Math.min(4, requestedMax));
        const table = {
            id: tableId,
            name: payload.name || `Table ${next.nextTableId}`,
            status: 'waiting',
            maxPlayers,
            players: []
        };
        next.tables.push(table);
        next.selectedTableId = tableId;
        next.nextTableId += 1;
        return { ok: true, state: next, table };
    }

    function selectTable(state, tableId) {
        const next = cloneState(state);
        const found = next.tables.find(t => t.id === tableId);
        if (!found) {
            return { ok: false, code: 'TABLE_NOT_FOUND', error: 'Table does not exist' };
        }
        next.selectedTableId = tableId;
        return { ok: true, state: next, table: found };
    }

    function addPlayerToSelected(state, playerName) {
        const next = cloneState(state);
        const table = getSelectedTable(next);
        if (!table) return { ok: false, code: 'NO_TABLE_SELECTED', error: 'No table selected' };
        if (table.status !== 'waiting') return { ok: false, code: 'TABLE_ALREADY_STARTED', error: 'Table already started' };
        if (!playerName || typeof playerName !== 'string') return { ok: false, code: 'INVALID_PLAYER_NAME', error: 'Player name is invalid' };
        if (table.players.includes(playerName)) return { ok: false, code: 'DUPLICATE_PLAYER', error: 'Player already joined table' };
        if (table.players.length >= table.maxPlayers) return { ok: false, code: 'TABLE_FULL', error: 'Table is full' };

        table.players.push(playerName);
        return { ok: true, state: next, table };
    }

    function startSelectedTable(state) {
        const next = cloneState(state);
        const table = getSelectedTable(next);
        if (!table) return { ok: false, code: 'NO_TABLE_SELECTED', error: 'No table selected' };
        if (table.status !== 'waiting') return { ok: false, code: 'TABLE_ALREADY_STARTED', error: 'Table already started' };
        if (table.players.length < next.limits.minPlayersToStart) {
            return { ok: false, code: 'NOT_ENOUGH_PLAYERS', error: 'Not enough players to start table' };
        }

        table.status = 'playing';
        return { ok: true, state: next, table };
    }

    const api = {
        createInitialState,
        cloneState,
        getSelectedTable,
        createTable,
        selectTable,
        addPlayerToSelected,
        startSelectedTable
    };

    globalScope.LobbyCore = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
