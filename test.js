var chai = require("chai")
var library = require("nrtv-library")(require)

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
        message += "\n... or maybe it just took too long? We waited "+(max_test_run/1000)+" seconds for tests to finish. Do done.failAfter(10000) or something if you want to wait longer."
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

  setTimer()

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

test.using = function(description, dependencies, runTest) {

  var argumentsAccepted = runTest.length

  var dependenciesProvided = dependencies.length

  if (argumentsAccepted != dependenciesProvided+2) {
    throw new Error("Your test function "+runTest+" should take "+(dependenciesProvided+2)+" arguments: expect, done, and one argument for each of the "+dependenciesProvided+" dependencies provided ("+dependencies+")")
  }

  library.using(dependencies, function() {

    var deps = Array.prototype.slice.call(arguments)

    test(description, function(expect, done) {

      var args = [expect, done].concat(deps)

      runTest.apply(null, args)
    })
  })
}

module.exports = test
