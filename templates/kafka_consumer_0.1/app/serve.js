
// Welcome to the kafka_consumer 0.1 instatiation!


const Redactions = require('./lib/Redactions')
// require('./setup')()
const Application = require('./Application')
const manifest = require('./manifest')
const pino = require('pino')

const fs = require('fs');
const Kafka = require("node-rdkafka");
const config = readConfigFile(".env");
config["group.id"] = "node-group";


function readConfigFile(fileName) {
    const data = fs.readFileSync(fileName, 'utf8').toString().split("\n");
    return data.reduce((config, line) => {
        const [key, value] = line.split("=");
        if (key && value) {
            config[key] = value;
        }
        return config;
    }, {})
}

async function performApplication(event) {
  try {
    const app = new Application(
      event,
      manifest,
      {
        logger,
        // diagnostics: this.diagnostics,
      }
    )
    const result = await app.perform()
    return result
  } catch (err) {
    console.log(err)
    return 500
  }
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // redact: {paths: Redactions.paths}
})

const app_id = process.env.APP_ID || '-'
const consumer = new Kafka.KafkaConsumer(config, {"auto.offset.reset": "earliest" });
consumer.connect();
consumer.on("ready", () => {
    consumer.subscribe(["first_contact"]);
    consumer.consume();
    console.log("Ready to consume")
}).on("data", async (message) => {
    try {
        let data = JSON.parse(message.value)
        console.log("Message for you, sire!")
        console.log(`data: ${JSON.stringify(data, null, 2)}`)
        let status = 500
        try {
          performApplication(data)
        } catch (err) {
          console.log(err)
        }

    }catch (err) {
        console.log(err)
        console.log('could not process message.value')
    }
    console.log("Consumed message", message);
});