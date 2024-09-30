1.	Maak een azure function die een mqtt publish doet. De javacript code en het te gebruiken package zijn gelijk aan al eerder gemaakte code. Run en test deze function lokaal. Kijk in het mqtt dashboard of de publish is aangekomen.

```js
const mqtt = require('mqtt');
const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'mqttIoTHHS';
const client = mqtt.connect(brokerUrl);

var globalPayload = JSON.stringify({
    "enable": true,
    "blinkDelayMs": 500,
    "rgbValue": {
        "red": 255,
        "green": 0,
        "blue": 0
    }
}, null, 2);

function sendMessage(topic, payload) {
    // publish message
    client.publish(topic, payload, (error) => {
        if (error) {
            console.error('Failed to publish message:', error);
        } else {
            console.log('Message published successfully');
        }
    });
}

app.http('mqttPublish', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'mqtt',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        if (globalPayload === null)
            return { status: 500, body: "500 | methodName or payload are empty" }

        context.log(`global payload: ${globalPayload}`);

        sendMessage(topic, globalPayload);
    }
});
```

![alt text](image.png)

2. Maak nu REST api om het alarmlicht aan te sturen. De function ontvangt JSON met gegeven in welke kleur en frequentie het alarmlicht moet knipperen. Een Rest Api verwacht voor deze call een id, zodat hij weet welke resource hij moet aansturen. Alleen id =1 is geldig, geef anders een foutmelding richting de client dat de resource niet bestaat.

```js
const mqtt = require('mqtt');
const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'mqttIoTHHS/';
const { app } = require('@azure/functions');
const client = mqtt.connect(brokerUrl);

const ids = {
    1: "alarmLicht",
}

var globalPayload = null;
var targetTopic = null;

function sendMessage(topic, payload) {
    // publish message
    client.publish(topic, payload, (error) => {
        if (error) {
            console.error('Failed to publish message:', error);
        } else {
            console.log('Message published successfully');
        }
    });
}

app.http('mqttPublish', {
    methods: ['GET'], // not completely sure this is the correct method for this, but I guess we are requesting data
    authLevel: 'anonymous',
    route: 'mqtt',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        if (globalPayload === null)
            return { status: 400, body: "400 | payload is empty" }

        context.log(`global payload: ${globalPayload}`);

        try {
            sendMessage(targetTopic, globalPayload);
            return { status: 200, body: "200 | OK" }
        }
        catch {
            context.log(`global payload: ${globalPayload}`);
            return { status: 500, body: "500 | Failure sending message" }
        }
    }
});

app.http('createJSON', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'mqtt',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        let payload = await request.json();
        context.log(`Payload: ${JSON.stringify(payload, null, 2)}`);
        if (payload === null)
            return { status: 400, body: "400 | payload could not be created" }

        // check if id exists
        if (ids.hasOwnProperty(payload.id)) {
            targetTopic = topic + ids[1]
        }
        else {
            targetTopic = null;
            return { status: 400, body: "400 | Resource does not exist" }
        }

        // remove id from json payload. Client has no need for it
        delete payload.id;

        // payload primed
        globalPayload = JSON.stringify(payload, null, 2);

        context.log(`global payload: ${JSON.stringify(globalPayload, null, 2)}`);

        return { status: 200, body: "200 | OK" }
    }
});

app.http('modifyJSON', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'mqtt',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        let payload = await request.json();
        context.log(`Payload: ${JSON.stringify(payload, null, 2)}`);
        if (payload === null)
            return { status: 400, body: "400 | payload could not be created" }

        if (ids.hasOwnProperty(payload.id)) {
            targetTopic = topic + ids[1];
        }
        else {
            targetTopic = null;
            return { status: 400, body: "400 | Resource does not exist" }
        }

        delete payload.id;

        globalPayload = JSON.stringify(payload, null, 2);

        context.log(`global payload: ${JSON.stringify(globalPayload, null, 2)}`);

        return { status: 200, body: "200 | OK" }
    }
});

app.http('deleteJSON', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'mqtt',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        // reset topic and payload back to nothing
        targetTopic = null;
        globalPayload = null;

        // idk how it could happen, but to be safe
        if (globalPayload !== null)
            return { status: 500, body: "500 | payload could not be deleted" }
        else if (targetTopic !== null)
            return { status: 500, body: "500 | topic could not be deleted" }

        return { status: 200, body : "200 | OK" }
    }
});
```

![POST](image-1.png)

![GET](image-2.png)

![PUT](image-3.png)

![GET2](image-4.png)

![DELETE](image-5.png)

![GET3](image-6.png)

![id = 2 does not work](image-7.png)

3. Zorg nu dat er een hardcode lijst is met geldige id’s en welk topic bij dit id hoort. Nu kan je bijvoorbeeld 2 of meer verschillende alarmlampen aansturen via deze Rest Api. 

```js
const ids = {
    0: "all",
    1: "alarmLicht",
    2: "alarmLicht2"
}
```

![1](image-8.png)

![2](image-9.png)

![alt text](image-10.png)

4. Deploy nu deze function en test deze weer. Let op de package.json
