const mqtt = require('mqtt');
const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'mqttIoTHHS/';
const { app } = require('@azure/functions');
const client = mqtt.connect(brokerUrl);

const ids = {
    0: "all",
    1: "alarmLicht",
    2: "alarmLicht2",
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
            targetTopic = topic + ids[payload.id]
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
            targetTopic = topic + ids[payload.id];
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

        return { status: 200 }
    }
});