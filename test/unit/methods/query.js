const test = require('tap').test
const sinon = require('sinon')
const server = require('../../server')
const queryMethod = require('../../../lib/methods/query')()
var ARROW
var CONNECTOR

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      ARROW = inst
      CONNECTOR = ARROW.getConnector('appc.redis')

      t.ok(ARROW, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### Query ###', function (t) {
  // Data
  var sandbox = sinon.sandbox.create()
  const Model = ARROW.getModel('testModel')

  // Stubs & spies
  const getDelegateMethodStub = sandbox.stub(CONNECTOR,
    'getDelegateMethod').callsFake(function (Model, method) {
    return function (Model, options, cbSpy) {
      setImmediate(function () {
        cbSpy()
      })
    }
  })
  function cb (errParameter, instance) { }
  const cbSpy = sandbox.spy(cb)

  // Execution
  queryMethod.bind(CONNECTOR, Model, {}, cbSpy)()

  setImmediate(function () {
    t.ok(cbSpy.calledOnce)
    t.ok(getDelegateMethodStub.calledOnce)
    sandbox.restore()
    t.end()
  })
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
