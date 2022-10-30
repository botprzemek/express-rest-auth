const { MailtrapClient } = require("mailtrap"),
      TOKEN = "378ec96efd5698dcf143c3d8b3c3f54d",
      ENDPOINT = "https://send.api.mailtrap.io/",
      client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN }),
      sender = {
        email: "info@botprzemek.pl",
        name: "DEV botprzemek.pl",
      },
      recipients = [
        { email: "p.szymanski.19d@gmail.com" },
      ];

client
  .send({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    text: "Congrats for sending test email with Mailtrap!",
    category: "Integration Test",
  }).then(console.log, console.error);