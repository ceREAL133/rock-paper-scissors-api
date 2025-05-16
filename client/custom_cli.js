const { io } = require('socket.io-client');
const readline = require('readline');

let canMakeMove = true;
let canRequestRematch = false;

const username = process.argv[2] || 'Anonymous';
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log(`Connected as ${username}`);
    socket.emit('join', { username });
});

socket.on('match_created', ({ opponent }) => {
    console.log(`Match created vs ${opponent}`);
});

socket.on('player_status', (status) => {
    console.log(`Opponent status: ${JSON.stringify(status)}`);
});

socket.on('match_result', (data) => {
    console.log(`Result:`, data);

    canMakeMove = false;
    canRequestRematch = true;

    console.log('Type "rematch" to play again');
});

socket.on('score_result', ({ score }) => {
    console.log(`Your current score: ${score}`);
});

socket.on('rematch_requested', ({ from }) => {
    console.log(`Player ${from} wants a rematch. Type "rematch" to accept.`);
});

socket.on('validation_error', (data) => {
    console.warn(`Error:`, data.message);
});

socket.on('opponent_disconnected', (data) => {
    console.log(`Opponent disconnected: ${data.message}`);
    console.log('You can type "rematch" to start a new game or wait for a new opponent.');
    canMakeMove = false;
    canRequestRematch = true;
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', (line) => {
    const move = line.trim().toLowerCase();

    if (move === 'score') {
        socket.emit('get_score');
        return;
    }

    if (['rock', 'paper', 'scissors', 'rematch'].includes(move)) {
        socket.emit(move === 'rematch' ? 'rematch' : 'make_move', { move });
        return;
    }

    console.log('Invalid input. Type rock, paper, or scissors. Or type score/rematch.');
});