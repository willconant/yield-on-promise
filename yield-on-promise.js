/*
Copyright (c) 2013 Will Conant, http://willconant.com/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

'use strict';

var Fiber = require('fibers');
var Q = require('q');

module.exports = yieldOnPromise;

function yieldOnPromise(promiseOrValue) {
	var currentFiber = Fiber.current;
	
	Q.when(promiseOrValue, function(value) {
		currentFiber.run(value);
	}, function(reason) {
		currentFiber.throwInto(reason);
	});
	
	return Fiber.yield();
}

yieldOnPromise.frun = function(functionToRun) {
	var deferred = Q.defer();
	
	Fiber(function() {
		try {
			deferred.resolve(functionToRun());
		} catch (err) {
			deferred.reject(err);
		}
	}).run();
	
	return deferred.promise;
};
