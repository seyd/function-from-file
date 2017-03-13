/*!
 * function-from-file
 * Copyright(c) 2017 Johnny Seyd <johnnyseyd@gmail.com>
 * MIT Licensed
 */

'use strict';


/**
 * Expose `getFunctionsFromURL()` as e.g. `getFunction` (recomended).
 * @example
 *  var getFunction = require("function-from-file");
 */

exports = module.exports = getFunctionsFromURL;
exports.clearCache = clearCache;
exports.enableCache = enableCache;
exports.disableCache = disableCache;


/**
 * Module dependencies.
 */

var fs = require("fs");
var functionExtractor = require("function-extractor");


// ---------------------------------------------------------------------------------------
// --- Main functions --------------------------------------------------------------------
// ---------------------------------------------------------------------------------------


/**
 * Get (extract) one or more functions from given file (sync or async).
 * @param {String} sourceURL Path to the source javascript file.
 * @param {String|String[]} fnNames Function name (if single function) or array of function names.
 * @param {ResultCallback} [cb] Executes callback(err, result) when finished (same as in sync return).
 * @return {Function|Object|undefined} 
 *      If fnNames is string (single function name) it returns function.
 *      If fnNames is array of function names, it returns object where keys are those function names.
 *      If _cb param is provided (async mode) then result is returned in callback.
 */
function getFunctionsFromURL(sourceURL, fnNames, cb) {
	// if already cached source
	if (enabledCaching && cachedSources[sourceURL]) {
		let cache = cachedSources[sourceURL];
		try {
			var fns = getFunctions(cache.source, cache.functions, fnNames, sourceURL);
		} catch (err) {
			// async
			if (typeof cb == "function")
				return cb(err);
			// sync
			else
				throw err;
		}
		// async
		if (typeof cb == "function")
			cb(null, fns);
		// sync
		else
			return fns;
	}
	// if async
	else if (typeof cb == "function") {
		fs.readFile(sourceURL, 'UTF8', (err, source) => {
			if (err) {
				cb(err);
				return;
			}
			try {
				var functions = parseFunctions(source, sourceURL);
			} catch (err) {
				cb(err);
				return;
			}
			// save to cache
			if (enabledCaching)
				cachedSources[sourceURL] = { source: source, functions: functions };

			// call callback
			try {
				var fns = getFunctions(source, functions, fnNames, sourceURL);
			} catch (err) {
				cb(err);
				return;
			}
			cb(err, fns);
		});

	}
	// if sync
	else {
		let source = fs.readFileSync(sourceURL, 'UTF8');
		let functions = parseFunctions(source, sourceURL);
		// save to cache
		if (enabledCaching)
			cachedSources[sourceURL] = { source: source, functions: functions };
		return getFunctions(source, functions, fnNames, sourceURL);
	}
}


// cached files by path - each file is read just once
var cachedSources = {};


/**
 * Clear cached files and parsed functions.
 */
function clearCache() {
	cachedSources = {};
}

// flag if caching is enabled
var enabledCaching = true;

/**
 * Enable caching of files and parsed functions.
 */
function enableCache() {
	enabledCaching = true;
}

/**
 * Disable caching of files and parsed functions.
 */
function disableCache() {
	enabledCaching = false;
}


// ---------------------------------------------------------------------------------------
// --- Helper functions ------------------------------------------------------------------
// ---------------------------------------------------------------------------------------


/**
 * Parse source code with `functionExtractor` and handle parse errors.
 * @param {String} sourceCode Javascript source code (some functions are awaited).
 * @param {String} sourceURL Path to the source javascript file (only for error message).
 * @return {Object[]} Array of objects - information about each contained function.
 */
function parseFunctions(sourceCode, sourceURL) {
	try {
		var fns = functionExtractor.parse(sourceCode);
	} catch (e) {
		throw new Error('Error parsing source code `' + sourceURL + '`. ' + e.message)
	}
	return fns;
}


/**
 * Get one or more functions by given function names.
 * @param {String} sourceCode Javascript source code (some functions are awaited).
 * @param {Object[]} functions Array of objects - information about each contained function.
 * @param {String|String[]} fnNames Function name (if single function) or array of function names.
 * @param {String} sourceURL Path to the source javascript file (only for error message).
 * @return {Function|Object} 
 *      If fnNames is string (single function name) it returns function.
 *      If fnNames is array of function names, it returns object where keys are those function names.
 */
function getFunctions(sourceCode, functions, fnNames, sourceURL) {
	// if only one function name
	if (typeof fnNames == 'string')
		return getFunction(sourceCode, functions, fnNames, sourceURL);

	// else if array of function names
	let fns = [];
	fnNames.forEach((fnName) => {
		fns[fnName] = getFunction(sourceCode, functions, fnName, sourceURL);
	});
	return fns;
}


/**
 * Get parsed function by given function name.
 * @param {String} sourceCode Javascript source code (some functions are awaited).
 * @param {Object[]} functions Array of objects - information about each contained function.
 * @param {String} fnName Single function name.
 * @param {String} sourceURL Path to the source javascript file (only for error message).
 * @return {Function} Parsed function.
 */
function getFunction(sourceCode, functions, fnName, sourceURL) {
	// find function by name
	var fn = functions.filter((fn) => { return fn.name == fnName; });
	// if not found
	if (fn.length == 0)
		throw new Error('Function `' + fnName + '` not found in given source code `' + sourceURL + '`.');
	// get last (if found more), because last one overwrites definition of previous
	fn = fn[fn.length - 1];
	// function params
	var paramNames = fn.params.filter((param) => { return param.type == "Identifier"; }).map((param) => { return param.name });
	// get function source code
	var functionCode = sourceCode.slice(fn.blockStart, fn.end);
	var newFn;
	// create function with name via eval (`new Function` constructor does not support function name)
	eval('newFn = function ' + fnName + '(' + paramNames.join(',') + ') ' + functionCode);
	return newFn;
}