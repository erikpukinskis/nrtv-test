var chai = require("chai")
var fs = require("fs")

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
    newTest.failAfter = test.failAfter

    return newTest
  }

  if (only && description != only) {

    console.log(" (?) "+description+" (skipped)")

    return
  }

  var timer
  var dying = false

  function setTimer() {
    timer = setTimeout(
      function() {
        if (dying) { return }
        else { dying = true }

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
    var stack = e.stack.split("\n")
    console.log()
    console.log(lightningize(description))
    console.log()
    dumpSource(stack)
    console.log()
    console.log(lightningize(stack[0]))
    console.log()
    console.log(stack.slice(1).join("\n"))
    process.exit()
  }
}

function dumpSource(stack) {
  try {
    var parts = stack[1].match(/(\/[^:]*):([0-9]*):/)
    var path = parts[1]
    var lineNumber = parseInt(parts[2])

    var lines = fs.readFileSync(path, "utf8").split("\n")

    var sample = lines.slice(lineNumber-3, lineNumber+2)

    for(var i=0; i<sample.length; i++) {
      var line = sample[i]
      if (typeof line == "undefined") {
        return
      }
      var number = lineNumber-2 + i
      var separator = i==2 ? " >" : "| "

      var paddedNumber = ("      " + number).slice(-4)

      console.log(paddedNumber+separator+line)
    }
  } catch(e) {}
}

test.only = function(description) {
  only = description
}

test.failAfter = function(timeout) {
  max_test_run = timeout
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

function lightningize(message) {
  return " ⚡⚡⚡ "+message+" ⚡⚡⚡"
}

test.using = using.bind(test, require("nrtv-library")(require))

module.exports = test
