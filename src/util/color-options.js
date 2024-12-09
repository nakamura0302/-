export const colorOptions = [
	{ color: 'pistachio', label: 'Pistachio', value: '#7CB342', id: 0 },
	{ color: 'basil', label: 'Basil', value: '#0B8043', id: 1 },
	{ color: 'avocado', label: 'Avocado', value: '#C0CA33', id: 2 },
	{ color: 'citron', label: 'Citron', value: '#E4C441', id: 3 },
	{ color: 'banana', label: 'Banana', value: '#F6BF26', id: 4 },
	{ color: 'sage', label: 'Sage', value: '#33B679', id: 5 },
	{ color: 'peacock', label: 'Peacock', value: '#039BE5', id: 6 },
	{ color: 'cobalt', label: 'Cobalt', value: '#4285F4', id: 7 },
	{ color: 'blueberry', label: 'Blueberry', value: '#3F51B5', id: 8 },
	{ color: 'lavender', label: 'Lavender', value: '#7986CB', id: 9 },
	{ color: 'wisteria', label: 'Wisteria', value: '#B39DDB', id: 10 },
	{ color: 'graphite', label: 'Graphite', value: '#616161', id: 11 },
	{ color: 'birch', label: 'Birch', value: '#A79B8E', id: 12 },
	{ color: 'radicchio', label: 'Radicchio', value: '#AD1457', id: 13 },
	{ color: 'cherry blossom', label: 'Cherry Blossom', value: '#D81B60', id: 14 },
	{ color: 'grape', label: 'Grape', value: '#8E24AA', id: 15 },
	{ color: 'amethyst', label: 'Amethyst', value: '#9E69AF', id: 16 },
	{ color: 'cocoa', label: 'Cocoa', value: '#795548', id: 17 },
	{ color: 'flamingo', label: 'Flamingo', value: '#E67C73', id: 18 },
	{ color: 'tomato', label: 'Tomato', value: '#D50000', id: 19 },
	{ color: 'tangerine', label: 'Tangerine', value: '#F4511E', id: 20 },
	{ color: 'pumpkin', label: 'Pumpkin', value: '#EF6C00', id: 21 },
	{ color: 'mango', label: 'Mango', value: '#F09300', id: 22 },
	{ color: 'eucalyptus', label: 'Eucalyptus', value: '#009688', id: 23 },
];

export const colors = {
	darkgray: '#9c9c9c',
    gray: '#f5f5f5',
    lightgray: '#e3e3e3',
    black: 'black',
    blue: '#137ff2',
    white: 'white',
}

export const getColorOption = (color = 'black') => {
	const colorOption = colorOptions.find(option => option.color === color);
	return colorOption || colorOptions[1];
}

export const getRandomColorOption = () => {
	const randomIndex = Math.ceil(Math.random() * colorOptions.length) - 1;
	return colorOptions[randomIndex];
}
