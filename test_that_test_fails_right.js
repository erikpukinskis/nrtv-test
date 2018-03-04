var runTest = require("./")(require)
var sinon = require("sinon")

runTest(
  "the bone is alone",
  function(expect, done) {
    expect(true)
    done()
  }
)

runTest.only("nothing works")

runTest(
  "the impossible is possible",
  function(expect, done) {
    expect(undefined).to.not.be.undefined
    done()
  }
)

runTest(
  "nothing works",
  function(expect, done) {
    done()
  }
)

runTest.only()

runTest(
  "has sinon-chai expectations",
  ["chai"],
  function(expect, done, chai) {
    var me = {
      stop: function() {},
    }

    sinon.spy(me, "stop")

    function anticipateFailure() {
      me.stop.should.have.been.called
    }

    expect(anticipateFailure).to.throw(chai.AssertionError)

    done()
  }
)


runTest(
  "can delay the timeout",
  function(expect, done) {
    done.failAfter(3000)

    var me = {
      stop: function() {},
    }

    sinon.spy(me, "stop")

    function anticipateFailure() {
      expect(me.stop).to.have.been.called
    }

    expect(anticipateFailure).to.throw(Error)

    done()
  }
)

runTest(
  "run test with dependencies",
  function(expect, done) {

    runTest.define(
      "rabbit",
      function() {
        return "Bugs"
      }
    )

    runTest(require)(
      "rabbit is Bugs",
      ["rabbit", "chai"],
      function(expect, innerDone, rabbit, chai) {
        expect(rabbit).to.equal("Bugs")
        chai.expect(true).not.to.be.false
        innerDone()
        done()
      }
    )
  }
)


runTest(
  "fail fail fail",
  function(expect, done) {
    console.log("\n\nHello human,\n\nIf you see \"fail fail fail\" below, do not be alarmed. We're just testing\nthat errors work. If you see it above, be alarmed.\n\nLove, computer\n\n")

    throw new Error("What am I doing? I don't know what I'm doing. I'm doing the best that I can. I know that's all I can ask of myself. Is that good enough? Is my work doing any good? Is anybody paying attention? Is it hopeless to try and change things? The African guy is a sign, right? Because if he isn't than nothing in this world makes any sense to me; I'm fucked. Maybe I should quit. Don't quit. Maybe I should just fucking quit. Don't fucking quit. Just, I don't know what the fuck I'm supposed to do anymore. Fucker. Fuck. Shit.")
  }
)
