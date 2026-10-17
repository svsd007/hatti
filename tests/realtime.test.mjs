import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

test("realtime bursts and reconnects refresh once, cleanup removes listeners and late callbacks", async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  const previousWindow = globalThis.window;
  globalThis.window = new EventTarget();
  try {
    const { subscribeCatalog } = await server.ssrLoadModule("/src/catalog/realtime.ts");
    const events = [];
    let status;
    let removed = 0;
    let refreshed = 0;
    const channel = {
      on(_event, filter, callback) { events.push({ filter, callback }); return channel; },
      subscribe(callback) { status = callback; return channel; },
    };
    const client = { channel() { return channel; }, async removeChannel(value) { assert.equal(value, channel); removed++; } };
    const stop = subscribeCatalog(() => refreshed++, true, client);
    assert.deepEqual(events.map(event => event.filter.table), ["products", "Businesses"]);
    assert.equal(events[0].filter.event, "*");
    status("SUBSCRIBED");
    for (const eventType of ["INSERT", "UPDATE", "DELETE"]) events[0].callback({ eventType });
    await new Promise(resolve => setTimeout(resolve, 250));
    assert.equal(refreshed, 1);
    globalThis.window.dispatchEvent(new Event("focus"));
    globalThis.window.dispatchEvent(new Event("online"));
    await new Promise(resolve => setTimeout(resolve, 250));
    assert.equal(refreshed, 2);
    events[0].callback({ eventType: "UPDATE" });
    stop();
    status("SUBSCRIBED");
    globalThis.window.dispatchEvent(new Event("focus"));
    await new Promise(resolve => setTimeout(resolve, 250));
    assert.equal(refreshed, 2);
    assert.equal(removed, 1);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    await server.close();
  }
});
