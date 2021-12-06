const { spawn } = require('child_process')
const cdp = require('chrome-remote-interface')
const test = require('brittle')
const deepkill = require('deepkill')
const { port } = require('./port.json')

let cmd = 'npm'
if (process.platform === 'win32') cmd = 'npm.cmd'

const child = spawn(cmd, ['start'])

test('can see page and read dom', async ({ plan, ok, is, teardown }) => {
  plan(2)
  teardown(async () => { await deepkill(child.pid) })

  const targets = await (async function wait (start) {
    if (Date.now() - start > 30000) throw new Error('timeout')
    const targets = await cdp.List({ port }).catch(() => [])
    if (!targets.length) return new Promise((r) => setImmediate(() => r(wait(start))))
    return targets
  })(Date.now())

  const target = targets.find(({ url }) => /index\.html/.test(url))

  ok(target)

  const client = await cdp({ target })
  await client.Page.enable()
  await client.DOM.enable()
  const { root: { nodeId } } = await client.DOM.getDocument()
  const node = await client.DOM.querySelector({ nodeId, selector: '#hello-world' })
  const { node: { localName } } = await client.DOM.describeNode({ nodeId: node.nodeId })

  is(localName, 'h1')
})
