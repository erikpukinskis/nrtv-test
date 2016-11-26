RunTest lets you define tests along with their dependencies.

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


# Why

This makes it possible to hot reload modules when they change and re-run just the individual tests that depend on them.

I haven't written that test runner yet, but I wanted to set this standard so that the tests don't have to be rewritten when we have a global autonomous test runner up.

And in general, we try always to write code that describes its prerequisites in software.