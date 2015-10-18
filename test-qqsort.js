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
            t.deepEqual(a1, [1])
            t.done()
        })
    },

    'should return the array': function(t) {
        var a1 = [1]
        qqsort(a1, function(err, a2) {
            t.equal(a1, a2)
            t.done()
        })
    },

    'should sort 2 identical': function(t) {
        var a = [1,1]
        qqsort(a, function(err) {
            t.deepEqual(a, [1,1])
            t.done()
        })
    },

    'should sort 3 identical': function(t) {
        var a = [1,1,1]
        qqsort(a, function(err) {
            t.deepEqual(a, [1,1,1])
            t.done()
        })
    },

    'should sort array 2 sorted': function(t) {
        var a1 = [1, 2]
        qqsort(a1, function(err) {
            t.deepEqual(a1, [1, 2])
            t.done()
        })
    },

    'should sort array 3 ordered': function(t) {
        var a1 = [1, 2, 3]
        qqsort(a1, function(err) {
            t.deepEqual(a1, [1,2,3])
            t.done()
        })
    },

    'should sort array 2': function(t) {
        var a1 = [2, 1]
        qqsort(a1, function(err) {
            t.deepEqual(a1, [1, 2])
            t.done()
        })
    },

    'should sort array 3': function(t) {
        var a1 = [2, 1, 3]
        qqsort(a1, function(err) {
            t.deepEqual(a1, [1,2,3])
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
