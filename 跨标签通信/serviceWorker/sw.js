self.addEventListener("message", async (event) => {
  const clients = await self.clients.matchAll();
  clients.forEach(function (client) {
    client.postMessage(event.data);
  });
});
