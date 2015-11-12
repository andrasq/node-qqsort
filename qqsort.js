/**
 * quicker quicksort
 * non-blocking, efficient
 *
 * 2015-10-18 - AR.
 */

'use strict'

var nextTick = global.setImmediate || process.nextTick

module.exports = function qqsort( array, compar, callback ) {
    if (!callback && typeof compar === 'function') { callback = compar ; compar = null }
    if (!compar) compar = function(a,b) { return (a < b) ? -1 : (a > b) ? 1 : 0 }

    // without a callback, run the built-in sort
    if (!callback) return array.sort(compar)

    sortit(array, 0, array.length - 1, compar, function(err) {
        callback(err, array)
    })
}


// sort the sub-array
function sortit( array, first, last, compar, callback ) {
    // terminate recursion when no longer partitionable
    if (last - first <= 0) return callback()

    // special-case 2-element arrays
    if (last - first === 1) {
        try { if (compar(array[first], array[last]) > 0) swap(array, first, last) } catch (err) { return callback(err) }
        return callback()
    }

    partition(array, first, last, compar, function(err, p, q) {
        if (err) return callback(err)
        sortit(array, first, p, compar, function(err) {
            if (err) return callback(err)
            sortit(array, q, last, compar, callback)
        })
    })
}

// partition the array s.t. the l.h.s. is all < pivot and r.h.s. all > pivot
// return the first and last location of the pivot(s)
var callCount = 0
function partition( array, first, last, compar, callback ) {
    var i = first, j = last, p = first + Math.floor(Math.random() * (last - first + 1))
    var t, pivot = array[p]

    callCount += 1

    try {
        do {
            // advance to the next item on the l.h.s. larger than the pivot
            while (compar(array[i], pivot) < 0) i++
            // back up to the previous item on the r.h.s. smaller than the pivot
            while (compar(array[j], pivot) > 0) j--
            // swap out-of-order items, also swap (to advance past) duplicate pivots
            if (i < j) swap(array, i++, j--)
            else break
        } while (true)
    }
    catch (err) { return callback(err) }

    // now that the pivot value(s) are all in the middle, move i,j to the edgemost pivots
    // TODO: backing off the pivot values is less efficient than computing them directly
    try {
        while (i > first && compar(array[i], pivot) >= 0) i--;
        while (j < last && compar(array[j], pivot) <= 0) j++;
    }
    catch (err) { return callback(err) }

    // chop up the callback stack, else stack size will be exceeded
    if (callCount % 100 == 0 || first - last > 10000) nextTick(function(){ callback(null, i, j) })
    else callback(null, i, j)
}

function swap( array, i, j ) {
    var t = array[i]
    array[i] = array[j]
    array[j] = t
}
