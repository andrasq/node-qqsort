/**
 * quicker quicksort
 * non-blocking, efficient
 *
 * Copyright (C) 2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 *
 * 2015-10-18 - AR.
 */

'use strict'

var nextTick = global.setImmediate || process.nextTick

module.exports = function qqsort( array, compar, callback ) {
    if (!callback && typeof compar === 'function') { callback = compar ; compar = null }
    if (!compar) compar = function(a,b) { return (a < b) ? -1 : (a > b) ? 1 : 0 }

    // without an array to sort, use an empty array to fail gracefully
    if (!Array.isArray(array)) array = []

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
    // special-case short arrays
    if (last - first <= 20) {
        var arr = copyout(array, first, last, new Array(last - first + 1))
        try { arr.sort(compar) } catch (err) { return callback(err) }
        copyin(array, first, last, arr)
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

function copyout( array, first, last, dst ) {
    for (var i=first; i<= last; i++) dst[i - first] = array[i]
    return dst
}

function copyin( array, first, last, src ) {
    for (var i=first; i<= last; i++) array[i] = src[i - first]
    return array
}

// partition the array s.t. the l.h.s. is all < pivot and r.h.s. all > pivot
// return the first and last location of the pivot(s)
var comparCount = 0
function partition( array, first, last, compar, callback ) {
    // TODO: pick a pivot faster than with random()
    var i = first, j = last, p = first + Math.floor(Math.random() * (last - first + 1))
    var t, pivot = array[p]

    comparCount += (last - first) / 2 + 1;

//
// TODO: see if can make work with sloppy compar() that only return -1 or 1 (never 0 equality)
// Currently breaks every now and then in 1000 sorts fuzz test on line 219.
//

    try {
        do {
            // advance to the next item on the l.h.s. larger than the pivot
            while (i <= j && compar(array[i], pivot) < 0) i++
            // back up to the previous item on the r.h.s. smaller than the pivot
            while (j >= i && compar(array[j], pivot) > 0) j--
            // swap out-of-order items, also swap (to advance past) duplicate pivots
            if (i < j) swap(array, i++, j--)
            else break
        } while (true)
    } catch (err) { return callback(err) }

    // to guarantee progress, ensure that each partition is smaller than the input range.
    // Tolerate a sloppy compar that always reports inequality -1 or 1, ie pivot != pivot
    if (i > last) { i = last - 1; j = last; }                                           // all items less than pivot, equality reported as -1
    else if (j < first) { i = first; j = first + 1; }                                   // all items greater than pivot, equality reported as 1
    else if (i === j) { if (i > first) i = i - 1; if (j < last) j = j + 1; }            // met on (a) pivot
    else { i--; j++; }                                                                  // else crossed because have two proper sub-ranges

    // chop up the callback stack, else stack size will be exceeded
    if (comparCount > 1000) { comparCount = 0; nextTick(function(){ callback(null, i, j) }) }
    else callback(null, i, j)
}

function swap( array, i, j ) {
    var t = array[i]
    array[i] = array[j]
    array[j] = t
}
