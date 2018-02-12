const _ = require('lodash');

const DELIMITTER = ':';
const WILDCARD = '*';

const connections = [
	{
		sparkId: '1',
		room: 'ORG123:admin'
	},
	{
		sparkId: '2',
		room: 'ORG123:guest'
	}
];

const rooms = {};

function splitApart(room) {
	return (room && room.split(DELIMITTER)) || [];
}

function add(sparkId, room) {
	const pieces = splitApart(room);

	if (pieces.length) _.update(rooms, pieces, value => {
		value = value || [];
		value.push(sparkId);
		return value;
	});
}

function match(target, matched = []) {
	if (target.indexOf('*') === -1) return;

	const pieces = splitApart(target);

	const piecesLength = pieces.length;

	pieces.forEach((piece, i) => {
		const onLast = (i + 1) == piecesLength;
		
		if (piece !== '*') {
			if (i + 1)
		}
		else {

		}
	});

}

connections.forEach(connection => {
	const {
		sparkId,
		room
	} = connection;

	add(sparkId, room);
})

// console.log(JSON.stringify(rooms));
console.log(rooms);

console.log(match('ORG123:*'));