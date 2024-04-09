
const item = {
	name: 1,
	children: [
		{
			name: 2,
			children: [
				{
					name: 3,
					children: [
						{
							name: 4,
							children: []
						}
					]
				}
			]
		},
		{
			name: 5,
			children: [
				{
					name: 6,
					children: []
				}
			]
		}
	]
}

const string = "1";

const referee = string ? string.split('.') : [];
let object = item;
referee.forEach(r => {
	object = object.children[r];
});

console.log(object.name);
