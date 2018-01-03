module.exports = (script) =>
  ` <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Commit Stats</title>
      <script src="https://gw.alipayobjects.com/os/antv/assets/g2/3.0.4-beta.2/g2.min.js"></script>
    </head>
    <body>
      <div id="author"></div>
      <div id="year"></div>
      <div id="month"></div>
      <div id="day"></div>
      <div id="week"></div>
      <script>
        ${script}
      </script>
    </body>
    </html>
  `
