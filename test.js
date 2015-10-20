var chai = require("chai")

chai.use(require("sinon-chai"))
var only
var max_test_run = 2000

function test(description, runTest) {
  if (description.resolve) {
    var newRequire = description

    var newLibrary = require("nrtv-library")(newRequire)

    var newTest = test.bind(this)
    newTest.only = test.only
    newTest.using = using.bind(this, newLibrary)
    newTest.library = newLibrary

    return newTest
  }

  if (only && description != only) {

    console.log(" (?) "+description+" (skipped)")

    return
  }

  var timer

  function setTimer() {
    timer = setTimeout(
      function() {
        var message = "Got stuck in test \""+description+"\":\n"+runTest
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

  done.ish = function(message) {
    console.log("  ✓  "+message)
  }

  done.failAfter = function(timeout) {
    clearTimeout(timer)
    max_test_run = timeout
    setTimer()
  }

  setTimer()

  try {
    runTest(chai.expect, done)
  } catch (e) {
    console.log(lightningize(message))
    throw(e)
  }
}

function lightningize(message) {
  return " ⚡⚡⚡ "+message+" ⚡⚡⚡"
}

test.only = function(description) {
  only = description
}

function using(library, description, dependencies, runTest) {

  if (!Array.isArray(dependencies)) {
    throw new Error("test.using takes a test description and then an array of dependencies.")
  }

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

test.using = using.bind(test, require("nrtv-library")(require))

module.exports = test
