'use strict';

var chai = require('chai');
var expect = chai.expect;
var Q = require('q');
var Fiber = require('fibers');

var yop = require('../yield-on-promise');

describe('yop', function() {
	it('should yield fiber until promise is resolved', function(done) {		
		Fiber(function() {
			var result = yop( addLater(1, 2) );
			try {
				expect(result).to.equal(3);
				done();
			} catch (err) {
				done(err);
			}
		}).run();
		
		function addLater(a, b) {
			var deferred = Q.defer();
			process.nextTick(function() {
				deferred.resolve(a + b);
			});
			return deferred.promise;
		}
	});
	
	it('should throw reasons from rejected promises into fiber', function(done) {
		Fiber(function() {
			try {
				yop( throwErrorLater() );
			} catch (err) {
				try {
					expect(err.message).to.equal('promise rejected');
					done();
				} catch (expectErr) {
					done(expectErr);
				}
				return;
			}
			done(new Error('yop should have thrown reason from rejected promise'));
		}).run();
		
		function throwErrorLater() {
			var deferred = Q.defer();
			process.nextTick(function() {
				deferred.reject(new Error('promise rejected'));
			});
			return deferred.promise;
		}
	});
	
	it('should work just fine with passed a value instead of a promise', function(done) {		
		Fiber(function() {
			var result = yop( 1 + 2 );
			try {
				expect(result).to.equal(3);
				done();
			} catch (err) {
				done(err);
			}
		}).run();
	});
});

