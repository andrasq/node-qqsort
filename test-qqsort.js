'use strict'

var qqsort = require('./qqsort')

module.exports = {
    'should parse package': function(t) {
        require("./package.json")
        t.done()
    },

    'should export qqsort': function(t) {
        var idx = require("./index")
        t.equal(idx, qqsort)
        t.done()
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

    'should not block event loop': function(t) {
        var a1 = []
        //for (var i=0; i<100000; i++) a1.push(100000-i)
        //for (var i=0; i<100000; i++) a1.push((Math.random() * 10000) >>> 0)
        //var compar = null
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
            // blocked: 100k 5ms, 200k 10ms, 500k 25ms, 1m 60-120ms
            t.ok(maxTick < 20, "event loop blocked " + maxTick + " ms")
            for (var i=1; i<a1.length; i++) t.ok(a1[i-1] <= a1[i], "" + a1[i-1] + " v. " + a1[i])
            t.done()
        })
    },

    'fuzz test: should sort 1000 arrays sized 100-400': function(t) {
        var nloops = 1000;
        function runSort() {
            var a1 = [], a2, nitems = 100 + Math.random() * 300
            for (var i=0; i<nitems; i++) a1.push(Math.random() * 1000 >>> 0)
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

}
