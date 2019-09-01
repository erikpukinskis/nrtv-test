var chai = require("chai")

chai.should();

var fs = require("fs")

chai.use(require("sinon-chai"))
var only
var max_test_run = 2000
var dying = false

console.outdent = console.log
console.log = function() {
  var args = Array.prototype.slice.call(arguments)

  var padded = args.map(toString).join(" ").split("\n").map(pad).join("\n")

  console.outdent(padded)

  function toString(x) {
    return x.toString()
  }

  function pad(line) {
    return "  ⋮  "+line
  }
}

var runningCount = 0

function runTest() {
  for(var i=0; i<arguments.length; i++) {
    var arg = arguments[i]

    if (arg && arg.resolve) {
      var newRequire = arg

      var newLibrary = require("module-library")(newRequire)

      var newTest = runTest.bind(newLibrary)
      newTest.define = newLibrary.define.bind(newLibrary)
      newTest.only = runTest.only
      newTest.skip = runTest.skip
      newTest.failAfter = runTest.failAfter
      newTest.library = newLibrary

      return newTest
    } else if (typeof arg == "string") {
      var description = arg
    } else if (typeof arg == "function") {
      var testScript = arg
    } else if (Array.isArray(arg)) {
      var dependencies = arg
    } else {
      throw new Error("Passed "+arg+" to testScript, but we only know how to handle a description string, test function, and dependency name array")
    }
  }

  if (!testScript) {
    console.outdent(" ⚡⚡⚡ MISSING "+description+" test")
    return
  }

  if (dependencies) {
    if (!this.__isNrtvLibrary) {
      throw new Error("If you would like to run a test with dependencies, you need to pass require to the run-test singleton:\n\n        var runTest = require(\"run-test\")(require)\n\n        runTest(\n          \"things work\",\n          [\"lib1\", \"lib2\"],\n          function(expect, done, singleton1, singleton2) {\n            ... })\n")
    }

    return using(this, description, dependencies, testScript)
  }      

  if (only && description != only) {

    console.outdent(" (?) "+description+" (skipped)")

    return
  }

  var timer

  function setTimer() {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(
      function() {
        if (dying) { return }
        else { dying = true }

        console.log("\n⚡⚡⚡ STUCK in \""+description+"\" ⚡⚡⚡\n")

        message = "Maybe it just took too long? We waited "+(max_test_run/1000)+" seconds for tests to finish. Do done.failAfter(10000) or something if you want to wait longer."

        throw new Error(message)
      },
      max_test_run
    )
  }

  var checkingDone

  function done() {
    runningCount--
    clearTimeout(timer)
    console.outdent("  ✓  "+description)
    if (checkingDone) {
      clearTimeout(checkingDone)
    }
    checkingDone = setTimeout(function() {
      if (runningCount == 0) {
        console.log("\n\n===========\nAll is well\n===========\n\n")
      }
    },1)
  }

  done.ish = function(message) {
    console.outdent("  ...  ✓  "+message)
  }

  done.failAfter = function(timeout) {
    clearTimeout(timer)
    max_test_run = timeout
    setTimer()
  }

  setTimer()

  try {
    runningCount++
    testScript(chai.expect, done)
  } catch (e) {
    runningCount--
    var stack = e.stack.split("\n")
    console.outdent()
    console.outdent(lightningize("Error in test: "+description))
    console.outdent()
    dumpSource(stack)
    console.outdent()
    console.outdent(lightningize(stack[0]))
    console.outdent()
    console.outdent(stack.slice(1).join("\n"))
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

      console.outdent(paddedNumber+separator+line)
    }
  } catch(e) {}
}

runTest.only = function(description) {
  only = description
}

runTest.skip = function(description) {
  console.outdent(" (?) "+description+" (skipped)")
}

runTest.failAfter = function(timeout) {
  max_test_run = timeout
}

runTest.define = function() {
  throw new Error("You need to pass require to runTest if you want to use runTest.define: var runTest = require(\"run-test\")(require)")
}

function using(library, description, dependencies, testScript) {

  var argumentsAccepted = testScript.length

  var dependenciesProvided = dependencies.length

  if (argumentsAccepted != dependenciesProvided+2) {
    throw new Error("Your test function "+testScript+" should take "+(dependenciesProvided+2)+" arguments: expect, done, and one argument for each of the "+dependenciesProvided+" dependencies provided ("+dependencies+")")
  }

  library.using(dependencies, function() {

    var deps = Array.prototype.slice.call(arguments)

    runTest(description, function(expect, done) {

      var args = [expect, done].concat(deps)

      testScript.apply(null, args)
    })
  })
}

function lightningize(message) {
  return " ⚡⚡⚡ "+message+" ⚡⚡⚡"
}

module.exports = runTest
