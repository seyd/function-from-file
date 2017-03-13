/*!
 * function-from-file
 * Copyright(c) 2017 Johnny Seyd <johnnyseyd@gmail.com>
 * MIT Licensed
 */

var getFunction = require("../");
var fs = require("fs");

const FIXTURES_FOLDER = './spec/fixtures/';


describe("When importing function", function() {

	describe("from file which does not exists,", function() {

		it("[SYNC] call throws error `no such file or directory`", function() {
			var fn = () => { return getFunction(FIXTURES_FOLDER + 'file-does-not-exist.js', 'functionName'); };
			expect(fn).toThrowError(/no such file or directory/);
		});

		it("[ASYNC] call throws error `no such file or directory`", function(done) {
			getFunction(FIXTURES_FOLDER + 'file-does-not-exist.js', 'functionName', (err, result) => {
				expect(err).not.toBeFalsy();
				expect(err.message).toContain('no such file or directory');
				expect(result).not.toBeDefined();
				done();
			});
		});

	});

	describe("from file which is not valid js file, because", function() {

		it("it is not javascript [SYNC]", function() {
			var fn = () => { return getFunction(FIXTURES_FOLDER + 'text-file.txt', 'functionName'); };
			expect(fn).toThrowError(/Error parsing source code/);
		});

		it("it is not javascript [ASYNC]", function(done) {
			getFunction(FIXTURES_FOLDER + 'text-file.txt', 'functionName', (err, result) => {
				expect(err).not.toBeFalsy();
				expect(err.message).toContain('Error parsing source code');
				expect(result).not.toBeDefined();
				done();
			});
		});

		it("it contains some error(s) [SYNC]", function() {
			var fn = () => { return getFunction(FIXTURES_FOLDER + 'javascript-with-errors.js', 'functionName'); };
			expect(fn).toThrowError(/Error parsing source code/);
		});

		it("it contains some error(s) [ASYNC]", function(done) {
			getFunction(FIXTURES_FOLDER + 'javascript-with-errors.js', 'functionName', (err, result) => {
				expect(err).not.toBeFalsy();
				expect(err.message).toContain('Error parsing source code');
				expect(result).not.toBeDefined();
				done();
			});
		});

	});

	// i want to run this test two times (cached source and not cached rosurce)
	function testsForReuse() {

		describe("which", function() {

			it("does not exists [SYNC]", function() {
				var fn = () => { return getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'unknownFn'); };
				expect(fn).toThrowError(/not found in given source code/);
			});

			it("does not exists [ASYNC]", function(done) {
				getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'unknownFn', (err, result) => {
					expect(err).not.toBeFalsy();
					expect(err.message).toContain('not found in given source code');
					expect(result).not.toBeDefined();
					done();
				});
			});

			it("one of multiple functions does not exists [SYNC]", function() {
				var fn = () => { return getFunction(FIXTURES_FOLDER + 'sample-functions.js', ['fnA', 'unknownFn']); };
				expect(fn).toThrowError(/not found in given source code/);
			});

			it("one of multiple functions does not exists [ASYNC]", function(done) {
				getFunction(FIXTURES_FOLDER + 'sample-functions.js', ['fnA', 'unknownFn'], (err, result) => {
					expect(err).not.toBeFalsy();
					expect(err.message).toContain('not found in given source code');
					expect(result).not.toBeDefined();
					done();
				});
			});

			it("exists [SYNC]", function() {
				var fn = getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'fnA');
				expect(typeof fn).toBe('function');
				expect(fn()).toEqual('fnA result');
			});

			it("exists [ASYNC]", function(done) {
				getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'fnA', (err, result) => {
					expect(err).toBeFalsy();
					expect(typeof result).toBe('function');
					expect(result()).toEqual('fnA result');
					done();
				});
			});

			it("exists as inner function [SYNC]", function() {
				var fn = getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'innerFnB');
				expect(typeof fn).toBe('function');
				expect(fn()).toEqual('innerFnB result');
			});

			it("exists as inner function [ASYNC]", function(done) {
				getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'innerFnB', (err, result) => {
					expect(err).toBeFalsy();
					expect(typeof result).toBe('function');
					expect(result()).toEqual('innerFnB result');
					done();
				});
			});

			it("does not exists because is commented (as block) [SYNC]", function() {
				var fn = () => { return getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'commentedFnB'); };
				expect(fn).toThrowError(/not found in given source code/);
			});

			it("does not exists because is commented (as block) [ASYNC]", function(done) {
				getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'commentedFnB', (err, result) => {
					expect(err).not.toBeFalsy();
					expect(err.message).toContain('not found in given source code');
					expect(result).not.toBeDefined();
					done();
				});
			});

			it("does not exists because is commented (as line) [SYNC]", function() {
				var fn = () => { return getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'commentedFnC'); };
				expect(fn).toThrowError(/not found in given source code/);
			});

			it("does not exists because is commented (as line) [ASYNC]", function(done) {
				getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'commentedFnC', (err, result) => {
					expect(err).not.toBeFalsy();
					expect(err.message).toContain('not found in given source code');
					expect(result).not.toBeDefined();
					done();
				});
			});

			it("exists and get last one because duplicate [SYNC]", function() {
				var fn = getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'duplicateFnC');
				expect(typeof fn).toBe('function');
				expect(fn()).toEqual('duplicateFnC 2 result');
			});

			it("exists and get last one because duplicate [ASYNC]", function(done) {
				getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'duplicateFnC', (err, result) => {
					expect(err).toBeFalsy();
					expect(typeof result).toBe('function');
					expect(result()).toEqual('duplicateFnC 2 result');
					done();
				});
			});

			it("exists and return more functions [SYNC]", function() {
				var result = getFunction(FIXTURES_FOLDER + 'sample-functions.js', ['fnA', 'innerFnB']);
				expect(Array.isArray(result)).toBeTruthy();
				expect(typeof result.fnA).toBe('function');
				expect(result.fnA()).toEqual('fnA result');
				expect(typeof result.innerFnB).toBe('function');
				expect(result.innerFnB()).toEqual('innerFnB result');
			});

			it("exists and return more functions [ASYNC]", function(done) {
				getFunction(FIXTURES_FOLDER + 'sample-functions.js', ['fnA', 'innerFnB'], (err, result) => {
					expect(err).toBeFalsy();
					expect(typeof result.fnA).toBe('function');
					expect(result.fnA()).toEqual('fnA result');
					expect(typeof result.innerFnB).toBe('function');
					expect(result.innerFnB()).toEqual('innerFnB result');
					done();
				});
			});

			it("exists (with params) [SYNC]", function() {
				var result = getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'fnWithParams');
				expect(typeof result).toBe('function');
				expect(result(1, 2)).toEqual(3);
			});

			it("exists (with params) [ASYNC]", function(done) {
				getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'fnWithParams', (err, result) => {
					expect(err).toBeFalsy();
					var result = getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'fnWithParams');
					expect(typeof result).toBe('function');
					expect(result(1, 2)).toEqual(3);
					done();
				});
			});

			it("exists (with dependencies) [SYNC]", function() {
				var result = getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'fnWithDependecies');
				expect(typeof result).toBe('function');
				var fn = () => { return result(1, 2); };
				expect(fn).toThrowError(/not defined/);
				var c = 1,
					d = 2;

				function printMe(value) {
					return 'Result is ' + value;
				}
				eval('var fnWithDependecies = ' + result.toString());
				expect(fnWithDependecies()).toEqual('Result is 3');
			});

			it("exists (with dependencies) [ASYNC]", function(done) {
				getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'fnWithDependecies', (err, result) => {
					expect(err).toBeFalsy();
					expect(typeof result).toBe('function');
					var fn = () => { return result(1, 2); };
					// when dependencies are not defined
					expect(fn).toThrowError(/not defined/);
					// define dependencies (mocking)
					var c = 1,
						d = 2;

					function printMe(value) {
						return 'Result is ' + value;
					}
					eval('var fnWithDependecies = ' + result.toString());
					expect(fnWithDependecies()).toEqual('Result is 3');
					done();
				});
			});
		});
	}

	describe("[cached]", function() {

		// create cache
		beforeEach(function() {
			getFunction(FIXTURES_FOLDER + 'sample-functions.js', 'fnA');
		});

		testsForReuse();
	});

	describe("[uncached]", function() {

		// clear cache
		beforeEach(function() {
			getFunction.clearCache();
		});

		testsForReuse();
	});

	describe("manipulating cache", function() {

		const DYNAMIC_FILE = FIXTURES_FOLDER + 'dynamic-generated-file.js';

		beforeEach(function() {
			getFunction.clearCache();
			getFunction.enableCache();
		});

		afterEach(function() {
			getFunction.clearCache();
			getFunction.enableCache();
		});

		it("(when cache is ON) it is using cache [SYNC]", function() {
			getFunction.enableCache();
			fs.writeFileSync(DYNAMIC_FILE, 'function dynFn() { return 1; }');
			var fn1 = getFunction(DYNAMIC_FILE, 'dynFn');
			var firstResult = fn1();
			fs.writeFileSync(DYNAMIC_FILE, 'function dynFn() { return 2; }');
			var fn2 = getFunction(DYNAMIC_FILE, 'dynFn');
			var secondResult = fn2();
			// still have fn1 (cached result)
			expect(firstResult).toEqual(secondResult);
			fs.unlinkSync(DYNAMIC_FILE);
		});

		it("(when cache is ON) it is using cache [ASYNC]", function(done) {
			getFunction.enableCache();
			fs.writeFileSync(DYNAMIC_FILE, 'function dynFn() { return 1; }');
			var fn1 = getFunction(DYNAMIC_FILE, 'dynFn', (err, fn1) => {
				expect(err).toBeFalsy();
				var firstResult = fn1();
				fs.writeFileSync(DYNAMIC_FILE, 'function dynFn() { return 2; }');
				var fn2 = getFunction(DYNAMIC_FILE, 'dynFn', (err, fn2) => {
					expect(err).toBeFalsy();
					var secondResult = fn2();
					// still have fn1 (cached result)
					expect(firstResult).toEqual(secondResult);
					fs.unlinkSync(DYNAMIC_FILE);
					done();
				});
			});
		});

		it("(when cache is OFF) it is not using cache [SYNC]", function() {
			getFunction.disableCache();
			fs.writeFileSync(DYNAMIC_FILE, 'function dynFn() { return 1; }');
			var fn1 = getFunction(DYNAMIC_FILE, 'dynFn');
			var firstResult = fn1();
			fs.writeFileSync(DYNAMIC_FILE, 'function dynFn() { return 2; }');
			var fn2 = getFunction(DYNAMIC_FILE, 'dynFn');
			var secondResult = fn2();
			expect(firstResult).not.toEqual(secondResult);
			fs.unlinkSync(DYNAMIC_FILE);
		});

		it("(when cache is OFF) it is not using cache [ASYNC]", function(done) {
			getFunction.disableCache();
			fs.writeFileSync(DYNAMIC_FILE, 'function dynFn() { return 1; }');
			var fn1 = getFunction(DYNAMIC_FILE, 'dynFn', (err, fn1) => {
				expect(err).toBeFalsy();
				var firstResult = fn1();
				fs.writeFileSync(DYNAMIC_FILE, 'function dynFn() { return 2; }');
				var fn2 = getFunction(DYNAMIC_FILE, 'dynFn', (err, fn2) => {
					expect(err).toBeFalsy();
					var secondResult = fn2();
					expect(firstResult).not.toEqual(secondResult);
					fs.unlinkSync(DYNAMIC_FILE);
					done();
				});
			});
		});

		it("(when cache is CLEARED) it is not using cache [SYNC]", function() {
			fs.writeFileSync(DYNAMIC_FILE, 'function dynFn() { return 1; }');
			var fn1 = getFunction(DYNAMIC_FILE, 'dynFn');
			var firstResult = fn1();
			// clear cache here
			getFunction.clearCache();
			fs.writeFileSync(DYNAMIC_FILE, 'function dynFn() { return 2; }');
			var fn2 = getFunction(DYNAMIC_FILE, 'dynFn');
			var secondResult = fn2();
			expect(firstResult).not.toEqual(secondResult);
			fs.unlinkSync(DYNAMIC_FILE);
		});

		it("(when cache is CLEARED) it is not using cache [ASYNC]", function(done) {
			fs.writeFileSync(DYNAMIC_FILE, 'function dynFn() { return 1; }');
			var fn1 = getFunction(DYNAMIC_FILE, 'dynFn', (err, fn1) => {
				expect(err).toBeFalsy();
				var firstResult = fn1();
				// clear cache here
				getFunction.clearCache();
				fs.writeFileSync(DYNAMIC_FILE, 'function dynFn() { return 2; }');
				var fn2 = getFunction(DYNAMIC_FILE, 'dynFn', (err, fn2) => {
					expect(err).toBeFalsy();
					var secondResult = fn2();
					expect(firstResult).not.toEqual(secondResult);
					fs.unlinkSync(DYNAMIC_FILE);
					done();
				});
			});
		});
	});

});