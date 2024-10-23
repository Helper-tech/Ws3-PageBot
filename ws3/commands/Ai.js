const axios = require("axios");
const name = "ai";

module.exports = {
  name,
  description: "Interact with ChatGPT-4o",
  async run({ api, event, send, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return send(`Please enter your question! 

Example: ${api.prefix + name} what is love?`);
    }

    send("Please wait... 🔎");

    try {
      const response = await axios.get(`https://joshweb.click/gpt4`, {
        params: {
          prompt: prompt,
          uid: event.sender.id
        }
      });

      const { gpt4 } = response.data;

      if (!gpt4) throw new Error("No response from the GPT-4o API.");

      send(`${gpt4}

♥️LoveU`);
    } catch (err) {
      send(`Error: ${err.message || err}`);
    }
  }
}
