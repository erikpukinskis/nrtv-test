var chai = require("chai")
chai.use(require("sinon-chai"))

var only
var max_test_run = 2000

function test(setup, description, test) {
  if (!test) {
    test = description
    description = setup
    setup = undefined
  }

  if (only && description != only) {
    setup && setup(function() {})

    console.log(" (?) "+description+" (skipped)")

    return
  }

  var timer

  function setTimer() {
    timer = setTimeout(
      function() {
        var message = "Got stuck in test \""+description+"\":\n"+runTest
        if (setup) {
          message += "\n... or or setup:\n"+setup
        }
        message += "\n... or maybe it just took too long? We only wait 2 seconds for tests to finish."
        throw new Error(message)
      },
      max_test_run
    )
  }


  function done() {
    clearTimeout(timer)
    console.log("  ✓  "+description)
  }

  done.failAfter = function(timeout) {
    clearTimeout(timer)
    max_test_run = timeout
    setTimer()
  }

  var runTest = test.bind(null, chai.expect)

  var runAndDone = runTest.bind(null, done)

  try {
    if (setup) {
      setup(runAndDone)
    } else {
      runAndDone()
    }
  } catch (e) {
    console.log(" ⚡⚡⚡ "+description+" ⚡⚡⚡")
    throw(e)
  }
}

test.only = function(description) {
  only = description
}

module.exports = test
