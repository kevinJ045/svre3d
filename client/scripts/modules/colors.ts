
export function mixColors(color1, color2, ratio) {
	var rgb1 = hexToArray(color1);
	var rgb2 = hexToArray(color2);

	var newR = cubicInt(ratio, rgb1[0], rgb2[0]);
	var newY = cubicInt(ratio, rgb1[1], rgb2[1]);
	var newB = cubicInt(ratio, rgb1[2], rgb2[2]);

	return arrayToHex([newR, newY, newB]);
}

function hexToArray(hex) {
	var hex = hex.replace("#", '');
	var r = parseInt(hex.substr(0, 2), 16);
	var g = parseInt(hex.substr(2, 2), 16);
	var b = parseInt(hex.substr(4, 2), 16);
	return [r, g, b];
}

function cubicInt(t, A, B) {
	var weight = t * t * (3 - 2 * t);
	return A + weight * (B - A);
}

function arrayToHex(rgbArray) {
	var rHex = Math.round(rgbArray[0]).toString(16);
	rHex = rHex.length == 1 ? "0" + rHex : rHex;
	var gHex = Math.round(rgbArray[1]).toString(16);
	gHex = gHex.length == 1 ? "0" + gHex : gHex;
	var bHex = Math.round(rgbArray[2]).toString(16);
	bHex = bHex.length == 1 ? "0" + bHex : bHex;
	return "#" + rHex + gHex + bHex;
}

