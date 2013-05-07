'use strict';

var chai = require('chai');
var expect = chai.expect;
var Q = require('q');
var Fiber = require('fibers');

var frun = require('../yield-on-promise').frun;

describe('frun', function() {
	it('should execute argument in fiber and return promise that is resolved when function is done', function(done) {
		var promise = frun(function() {
			var f = Fiber.current;
			process.nextTick(function() { f.run(7) });
			return Fiber.yield();
		});
		
		promise.then(function(result) {
			try {
				expect(result).to.equal(7);
				done();
			} catch (err) {
				done(err);
			}
		});
	});
	
	it('should reject promise with errors thrown by argument function', function(done) {
		var promise = frun(function() {
			var f = Fiber.current;
			process.nextTick(function() {
				f.throwInto(new Error('thrown error'));
			});
			return Fiber.yield();
		});
		
		promise.then(function(result) {
			done(new Error('promise should not be resolved'));
		}, function(err) {
			try {
				expect(err.message).to.equal('thrown error');
				done();
			} catch (err) {
				done(err);
			}
		});
	});
});

