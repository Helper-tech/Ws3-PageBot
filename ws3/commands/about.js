module.exports = {
  description: "What is AxelBot?",
  async run({ api, send, admin }){
    await send({
      attachment: {
        type: "image",
        payload: {
          url: "https://i.imgur.com/gw1V46p.jpeg",
          is_reusable: true
        }
      }
    });
    setTimeout(async () => await send({
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: `🤖 About AxelBot:
Axel is your friendly, helpful personal assistant.

💭 Why I named AxelBot as a name of the page bot because this is dedicated to my Dump brain🧠

❓ Contact us admins if you experienced/encountered any issue regarding to the bot and I will try to fix it. Thankyou for using me as a personal assistant!`,
          buttons: [
            {
              type: "web_url",
              url: "https://www.facebook.com/profile.php?id=61567212159759",
              title: "Like/Follow our Page"
                },
            {
              type: "web_url",
              url: "https://www.facebook.com/profile.php?id=100094202834302",
              title: "Contact Admin 1"
                },
            {
              type: "web_url",
              url: "https://www.facebook.com/profile.php?id=61551754653557",
              title: "Contact Admin 2"
                }
             ]
        }
      }
    }), 2*1000);
  }
}
