const _ = require('lodash');

const DELIMITTER = ':';
const WILDCARD = '*';

const connections = [
	{
		sparkId: '1',
		room: 'ORG123:4:admin'
	},
	// {
	// 	sparkId: '2',
	// 	room: 'ORG123:1:guest'
	// }
];

const rooms = {};

function splitApart(room) {
	return (room && room.split(DELIMITTER)) || [];
}

function add(sparkId, room) {
	const pieces = splitApart(room);
	let cursor = rooms;

	console.log({pieces});

	const piecesLength = pieces.length;
	let lastPiece;

	pieces.forEach(piece => {
		lastPiece = piece;
		cursor = cursor[piece] = cursor[piece] || {};
	});

	cursor[lastPiece] = undefined;

	// if (pieces.length) _.set(rooms, pieces);
	// if (pieces.length) _.setWith(rooms, pieces, undefined, (nsValue, key, nsObject) => {
	// 	console.log({nsValue, key, nsObject});
	// 	return key;
	// });
}

function match(target, matched = []) {
	if (target.indexOf('*') === -1) return;

	const pieces = splitApart(target);

	const piecesProcessed = [];
	const cursor = rooms;

	pieces.forEach(piece => {

		processPiece(piece, cursor);
	})

}

function processPiece(piece, cursor) {
	if (piece === '*') {
		return cursor;
	}
	else {
		return cursor[piece];
	}
}

connections.forEach(connection => {
	const {
		sparkId,
		room
	} = connection;

	add(sparkId, room);
})

console.log(JSON.stringify(rooms));
// console.log(rooms);

// console.log(match('ORG123:*'));