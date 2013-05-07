## What is Yield-on-promise? ##

Yield-on-promise (yop for short) is a tiny module that lets you pause a fiber until a promise is
resolved or rejected. Here's a complete example:

    var Fiber = require('fibers');
    var Q = require('q');
    var yop = require('yield-on-promise');
    
    Fiber(function() {
        var result = yop( addLater(1, 2) );
        console.log(result); // outputs 3
    }).run();
    
    function addLater(a, b) {
        var deferred = Q.defer();
        process.nextTick(function() {
            deferred.resolve(a + b);
        });
        return deferred.promise;
    }

In the example, `addLater()` returns a promise that is resolved with the sum of its arguments
on the next turn of the event loop. The function that is run in the fiber is able to pause execution
until the promise is resolved by passing the promise to `yop()`.

## Why does this exist? ##

Fibers are the most powerful way to manage asynchronous complexity in node, but they are so foreign
to the "node way" of doing things that very few npm modules rely on them.

Promises are the next best thing, and publishing an npm module that produces promises by default is
a reasonable alternative to node's traditional callback-last style that won't alienate users.

Yield-on-promise is a tiny shim between fibers and promises that allows users of fibers to take
full advantage of modules that produce and consume promises.

## Can help modules that consume promises interact with fibers? ##

Yup. Yield-on-promise comes with a utility function for running a function in a fiber and promising
the results:

    var yop = require('yield-on-promise');
    
    var promise = yop.frun(function() {
        // frun() runs its argument in a fiber and returns a promise
    });

    promise.then(function(result) {
        // the eventual result of that function resolves the promise
    });

## What about exceptions? ##

Yield-on-promise does what you would expect when promises are rejected:

    Fiber(function() {
        try {
            yop( throwErrorLater() );
        } catch (err) {
            // the rejected promise will be caught here
        }
    }).run();
    
    function throwErrorLater() {
        var deferred = Q.defer();
        process.nextTick(function() {
            deferred.reject(new Error('this is a silly function'));
        });
        return deferred.promise;
    }
    
Things work correctly the other way around, too:

    var promise = yop.frun(function() {
        throw new Error('this always happens to me');
    });
    
    promise.then(function(result) {
        // this never happens
    }, function(err) {
        // instead, this onRejected promise handler runs with  the thrown error
    });

## License ##

This module is released under The MIT License. See `yield-on-promise.js` for the whole thing.

## Copyright ##

2013 Will Conant, http://willconant.com/
