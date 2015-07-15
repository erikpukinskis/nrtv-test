var test = require("./test")

test(
  "the bone is alone",
  function(expect, done) {
    expect(true)
    done()
  }
)

test.only("nothing works")

test(
  "the impossible is possible",
  function(expect, done) {
    expect(undefined).to.not.be.undefined
    done()
  }
)

test(
  "nothing works",
  function(expect, done) {
    done()
  }
)

test.only("fail fail fail")

test(
  "fail fail fail",
  function(expect, done) {
    throw new Error("What am I doing? I don't know what I'm doing. I'm doing the best that I can. I know that's all I can ask of myself. Is that good enough? Is my work doing any good? Is anybody paying attention? Is it hopeless to try and change things? The African guy is a sign, right? Because if he isn't than nothing in this world makes any sense to me; I'm fucked. Maybe I should quit. Don't quit. Maybe I should just fucking quit. Don't fucking quit. Just, I don't know what the fuck I'm supposed to do anymore. Fucker. Fuck. Shit.")
  }
)