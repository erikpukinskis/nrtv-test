**run-test** lets you define tests in the same file where you define their dependencies:

```javascript
var runTest = require("run-test")(require)

runTest(
  "a button tells us who's good",
  ["web-site", "browser-bridge", "web-element", "browser-task"],
  function(expect, done, WebSite, BrowserBridge, element, browserTask) {
    var site = new WebSite()
    var bridge = new BrowserBridge()

    var sayWhosGood = bridge.defineFunction(
      function sayWhosGood() {
        document.write("Prince")
      }
    )

    var button = element("button", "Who's good?", {onclick: sayWhosGood.evalable()})

    site.addRoute("get", "/", bridge.sendPage(button))

    site.live()

    var browser = browserTask(
      site.url(), function() {
      browser.pressButton(checkWho)
    })

    function checkWho() {
      browser.assertText("body", /Prince/, browser.done, done)
    }
  }
)
```

## One test at a time

```javascript
runTest.only("currying")

runTest("currying", function(expect, done) {
  expect("curry").to.contain("cur")
  done()
})

runTest("salading", function(expect, done) {
  throw new Error("This test will never run")
})
```

You have to do this at the top of the file, because runTest is eager: it will just start running tests as soon as you define them.

## Why

This makes it possible to hot reload modules when they change and re-run just the individual tests that depend on them.

I haven't written that test runner yet, but I wanted to set this standard so that the tests don't have to be rewritten when we have a global autonomous test runner up.

And in general, we try always to write code that describes its prerequisites in software.

## Random thoughts on testing

Wondering whether you should write a test? Ask yourself, if this stopped working, and none of our collaborators noticed, would it matter? If so, write the test.
