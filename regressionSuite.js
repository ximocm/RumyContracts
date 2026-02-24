const { spawnSync } = require('node:child_process');

const suites = [
    'roundSelfCheck.js',
    'sortSelfCheck.js',
    'botSelfCheck.js',
    'lobbySelfCheck.js',
    'scoringSelfCheck.js'
];

function runSuite(file) {
    const result = spawnSync(process.execPath, [file], {
        encoding: 'utf8'
    });

    const stdout = (result.stdout || '').trim();
    const stderr = (result.stderr || '').trim();
    let parsed = null;

    try {
        parsed = stdout ? JSON.parse(stdout) : null;
    } catch (err) {
        parsed = null;
    }

    return {
        file,
        ok: result.status === 0,
        exitCode: result.status,
        output: parsed || stdout || null,
        stderr: stderr || null
    };
}

function run() {
    const results = suites.map(runSuite);
    const ok = results.every(r => r.ok);

    const summary = {
        ok,
        suitesTotal: results.length,
        suitesPassed: results.filter(r => r.ok).length,
        results
    };

    console.log(JSON.stringify(summary));
    process.exit(ok ? 0 : 1);
}

run();
