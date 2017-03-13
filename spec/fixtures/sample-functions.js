function fnA() {

	function innerFnB() {
		return 'innerFnB result';
	}

	return 'fnA result';
}

/*
function commentedFnB() {	
	return 'commentedFnB';
}
*/

//function commentedFnC() { return 'commentedFnB'; }

function duplicateFnC() {
	return 'duplicateFnC 1 result';
}

function duplicateFnC() {
	return 'duplicateFnC 2 result';
}

function fnWithParams(a, b) {
	return a + b;
}


var c = 10,
	d = 20;

function printMe(value) {
	return 'Value is ' + value;
}

function fnWithDependecies() {
	return printMe(c + d);
}