/**
 * Copyright (C) 2015-2016 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict'

var qqsort = require('./')

var setImmediate = global.setImmediate || process.nextTick

module.exports = {
    'should parse package': function(t) {
        require("./package.json")
        t.done()
    },

    'should export qqsort': function(t) {
        var idx = require("./" + require("./package").main)
        t.equal(idx, qqsort)
        t.done()
    },

    'should sort without arguments': function(t) {
        t.ok(Array.isArray(qqsort()))
        t.deepEqual(qqsort(), [])
        t.done()
    },

    'should sort without a comparator': function(t) {
        qqsort([2,3,1], function(err, ret) {
            t.deepEqual(ret, [1,2,3])
            t.done()
        })
    },

    'should sort array 1': function(t) {
        var a1 = [1]
        qqsort(a1, function(err) {
            t.ifError(err)
            t.deepEqual(a1, [1])
            t.done()
        })
    },

    'should return the array': function(t) {
        var a1 = [1]
        qqsort(a1, function(err, a2) {
            t.ifError(err)
            t.equal(a1, a2)
            t.done()
        })
    },

    'should sort 2 identical': function(t) {
        var a = [1,1]
        qqsort(a, function(err) {
            t.ifError(err)
            t.deepEqual(a, [1,1])
            t.done()
        })
    },

    'should sort 3 identical': function(t) {
        var a = [1,1,1]
        qqsort(a, function(err) {
            t.ifError(err)
            t.deepEqual(a, [1,1,1])
            t.done()
        })
    },

    'should sort 5 idential with sloppy compar': function(t) {
        var a = [{a:1}, {a:1}, {a:1}, {a:1}, {a:1}]
        var compar = function(a,b) { return -1 }
        qqsort(a, compar, function(err) {
            t.done()
        })
    },

    'should sort array 2 sorted': function(t) {
        var a1 = [1, 2]
        qqsort(a1, function(err) {
            t.ifError(err)
            t.deepEqual(a1, [1, 2])
            t.done()
        })
    },

    'should sort array 3 ordered': function(t) {
        var a1 = [1, 2, 3]
        qqsort(a1, function(err) {
            t.ifError(err)
            t.deepEqual(a1, [1,2,3])
            t.done()
        })
    },

    'should sort array 2': function(t) {
        var a1 = [2, 1]
        qqsort(a1, function(err) {
            t.ifError(err)
            t.deepEqual(a1, [1, 2])
            t.done()
        })
    },

    'should sort array 3': function(t) {
        var a1 = [2, 1, 3]
        qqsort(a1, function(err) {
            t.ifError(err)
            t.deepEqual(a1, [1,2,3])
            t.done()
        })
    },

    'should use the passed-in comparator': function(t) {
        var a1 = [1, 2, 3]
        qqsort(a1, function(a,b) { return (a < b) ? 1 : (a > b) ? -1 : 0 }, function(err) {
            t.ifError(err)
            t.deepEqual(a1, [3,2,1])
            t.done()
        })
    },

    'should sort 10 items': function(t) {
        var a1 = [ 10, 9, 8, 8, 6, 5, 4, 3, 2, 2 ]
        qqsort(a1, function(err) {
            t.ifError(err)
            t.deepEqual(a1, [2,2,3,4,5,6,8,8,9,10])
            t.done()
        })
    },

    'should sort numeric strings lexically': function(t) {
        var a1 = ['1', '110', '1000', '100', '10']
        qqsort(a1, function(err) {
            t.deepEqual(a1, ['1', '10', '100', '1000', '110'])
            t.done()
        })
    },

    'should return errors thrown by the comparator': function(t) {
        qqsort([2,1], function(a,b){ throw new Error("die") }, function(err, ret) {
            t.equal(err.message, "die")
            t.done()
        })
    },

    'should return errors thrown by the comparator on mid-length arrays': function(t) {
        var ncalls = 0
        var arr = [2,1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]
        qqsort(arr, function(a,b){ throw new Error("die") }, function(err, ret) {
            t.equal(err.message, "die")
            t.done()
        })
    },

    'should return errors thrown by the comparator on longer arrays': function(t) {
        var arr = [2,1,3];
        for (var i=4; i<60; i++) arr.push(i);
        // time first error so it occurs during partitioning
        qqsort(arr, function(a,b){ throw new Error("die") }, function(err, ret) {
            t.equal(err.message, "die")
            var ncalls = 0
            // time second error so it occurs when sorting the first partition
            qqsort(arr, function(a,b){ if (ncalls++ >= 65) throw new Error("die") }, function(err, ret) {
                t.done()
            })
        })
    },

    'should sort 100k sorted values': function(t) {
        var a1 = []
        for (var i=0; i<100000; i++) a1.push(i)
        //for (var i=0; i<100000; i++) a1.push(1)
        //for (var i=0; i<100000; i++) a1.push(100000-i)
        var compar = function(a,b) { return a < b ? -1 : a > b ? 1 : 0 }
        qqsort(a1.slice(), compar, function(err, ret) {
            t.ifError(err)
            t.deepEqual(a1.sort(compar), ret)
            t.done()
        })
    },

    '100k should not block event loop for over 40 ms': function(t) {
        var a1 = []
        for (var i=0; i<100000; i++) { var v = {} ; v['a'] = Math.random() * 10000 >>> 0 ; a1.push(v) }
        var compar = function(a,b) { return (a['a'] < b['a']) ? -1 : (a['a'] > b['a']) ? 1 : 0 }
        var lastTick = Date.now(), maxTick = 0
        var heartbeatDone = false
        setTimeout(function heartbeatTimer() {
            var now = Date.now()
            if (now - lastTick > maxTick) maxTick = now - lastTick
            lastTick = now
            if (!heartbeatDone) setTimeout(heartbeatTimer, 2)
        }, 2)
        qqsort(a1, compar, function(err) {
            t.ifError()
            heartbeatDone = true
            // blocked: 100k 5ms, 200k 10ms, 500k 25ms, 1m 60-120ms, 10m 400-530ms
            maxTick = Math.max(Date.now() - lastTick, maxTick)
            console.log("sort 100k event loop blocked %d ms", maxTick)
            // node v4 and v5 blocked 8ms, v6.2 14ms, v6.9 21ms, so test for 40
            if (!process.env.NODE_COVERAGE) {
                t.ok(maxTick < 40, "event loop blocked " + maxTick + " ms")
            }
            for (var i=1; i<a1.length; i++) t.ok(a1[i-1] <= a1[i], "" + a1[i-1] + " v. " + a1[i])
            t.done()
        })
    },

    'fuzz test: should sort 1000 arrays sized 100-400': function(t) {
        var nloops = 1000
        function runSort() {
            var a1 = [], a2, nitems = 100 + Math.random() * 300
            for (var i=0; i<nitems; i++) a1.push(Math.random() * 1000 >>> 0)            // random values
            if (Math.random() < 0.5) for (var i=0; i<nitems; i++) a1[i] = "" + a1[i]    // sometimes strings
            // use an explicit comparator, else node sorts [2, 11] into alpha order [11, 2]
            a2 = a1.slice(0).sort(function(a,b) { return (a < b) ? -1 : (a > b) ? 1 : 0 })
            var t1 = Date.now()
            qqsort(a1, function(err) {
                t.ifError(err)
                t.deepEqual(a1, a2)
                //console.log("AR: sorted %d in %d ms", nitems, Date.now() - t1)
                // .32 sec to sort 100k numbers, .34 for 100k strings
                nloops -= 1
                if (nloops > 0) setImmediate(runSort)
                else t.done()
            })
        }
        runSort()
    },

    'fuzz test: should sort 20 arrays each sized 0-400': function(t) {
        var nitems = 0
        function sortN() {
            if (nitems >= 200) return t.done()
            var nloops = 20
            function runSort() {
                var a1 = [], a2
                for (var i=0; i<nitems; i++) a1.push(Math.random() * 1000 >>> 0)                // random values
                a2 = a1.slice(0).sort(function(a,b) { return (a < b) ? -1 : (a > b) ? 1 : 0 })  // control
                qqsort(a1, function(err) {
                    t.ifError(err)
                    t.deepEqual(a1, a2)
                    if (--nloops > 0) return setImmediate(runSort)
                    nitems += 1
                    setImmediate(sortN)
                })
            }
            runSort()
        }
        sortN(0)
    },

    'edge cases': {
        'should sort degenerate long arrays with partial sort compar': function(t) {
            var arr = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            qqsort(arr, function(a,b){ return a < b ? -1 : 1 }, function(err, ret) {
                t.ifError(err)
                t.deepEqual(ret, arr)
                qqsort(arr, function(a,b) { return a <= b ? -1 : 1 }, function(err, ret) {
                    t.ifError(err)
                    t.deepEqual(ret, arr)
                    t.done()
                })
            })
        },

        'should work without node setImmediate': function(t) {
            t.unrequire('./')
            var setImmediate = global.setImmediate
            delete global.setImmediate
            var qqsort = require('./')
            var arr = []
            for (var i=0; i<1000; i++) arr[i] = 1000 - 1 - i
            qqsort(arr, function(err, sorted) {
                global.setImmediate = setImmediate
                t.deepEqual(sorted, arr.reverse())
                t.done()
            })
        },

        'sort should succeed each time': function(t) {
            // test the random pivot selection, try to ensure that
            var arr = []
            for (var i=0; i<10; i++) arr.push(3)
            arr.push(2)
            for (var i=0; i<10; i++) arr.push(1)
            var ndone = 0
            for (var i=0; i<1000; i++) qqsort(arr, function(err, sorted) {
                t.deepEqual(sorted, arr.sort())
                if (++ndone === 1000) return t.done()
            })
        },
    },
}
