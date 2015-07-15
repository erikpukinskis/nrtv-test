if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(["chai"], function(chai) {

  var only

  function test(setup, description, test) {
    if (!test) {
      test = description
      description = setup
      setup = undefined
    }

    function done(before, after) {

      clearTimeout(timer)
      console.log(before||"  ✓  ", description, after||"")
    }

    if (only && description != only) {
      setup && setup(function() {})
      return done("  ○  ", "(skipped)")
    }

    var expect = chai.expect

    var timer = setTimeout(
      function() {
        var message = "Got stuck in test \""+description+"\":\n"+runTest
        if (setup) {
          message += "\n... or or setup:\n"+setup
        }
        throw new Error(message)
      },
      1000
    )

    var runTest = test.bind(null, chai.expect)

    var runAndDone = runTest.bind(null, done)

    try {
      if (setup) {
        setup(runAndDone)
      } else {
        runAndDone()
      }
    } catch (e) {
      done(" ⚡⚡⚡ ", " ⚡⚡⚡")
      throw(e)
    }
  }

  test.only = function(description) {
    only = description
  }

  return test
})
