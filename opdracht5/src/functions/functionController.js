const mqtt = require('mqtt');
const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'mqttIoTHHS/';
const { app } = require('@azure/functions');
const mqttClient = mqtt.connect(brokerUrl);

require('dotenv').config({ path: './opdracht5_env.env' });

var Client = require('azure-iothub').Client;
var connectionString = process.env.IOTHUB_CONNECTION_STRING;
var targetDevice = null;


const ids = {
    0: "all",
    1: "alarmLicht",
    2: "alarmLicht2",
    3: "azure_first_device",
    4: "azure_deur"
}

var globalPayload = null;
var targetTopic = null;

var methodParams = {
    methodName: "toggleEffect",
    payload: null,
    responseTimeoutInSeconds: 15 // set response timeout as 15 seconds
};

async function azurePublish(context, request) {
    var returnMessage = "200 | OK";
    var result;
    if (globalPayload === null)
        return { status: 400, body: "400 | payload is empty" };

    methodParams.payload = JSON.parse(globalPayload);

    var client = Client.fromConnectionString(connectionString);

    // why does this not work :(
    try {
        result = await client.invokeDeviceMethod(targetDevice, methodParams);

        context.log("!!!!!!!!!!!!!result!!!!!!!!!!!!! " + JSON.stringify(result, null, 2));
        returnMessage = result.result;
        // return { status: 200, body: JSON.stringify(returnMessage) };

    } catch (err) {
        context.log(err.message);
        return { status: 500, body: 'internal server error' };
    } finally {
        await client.close();
        return { status: 200, body: returnMessage }
    }
}

async function mqttPublish(context, request) {
    if (globalPayload === null)
        return { status: 400, body: "400 | payload is empty" }


    context.log(`target topic: ${targetTopic}`);
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

function sendMessage(topic, payload) {
    // publish message
    mqttClient.publish(topic, payload, (error) => {
        if (error) {
            console.error('Failed to publish message:', error);
        } else {
            console.log('Message published successfully');
        }
    });
}

async function messagePublish(request, context) {
    var returnValue;
    context.log(`Http function processed request for url "${request.url}"`);

    const id = parseInt(request.params.id, 10);

    if (ids[id].includes("azure")) {
        if (id === 4) {
            methodParams.methodName = 'lockDoor';
        }
        else {
            methodParams.methodName = 'toggleEffect';
        }
        targetDevice = targetDevice.replace(/^azure_/, '');
        returnValue = await azurePublish(context, request);
        context.log("return value: !!!!!!!!!!! " + JSON.stringify(returnValue, null, 2));
    }
    else {
        returnValue = await mqttPublish(context, request);
    }

    const { status, body } = returnValue;

    // Return the HTTP response with the correct status and body
    context.res = {
        status: status,
        body: body
    };
    return context.res;
}

app.http('createJSON', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'mqtt/{id}',
    handler: async (request, context) => {

        const id = parseInt(request.params.id, 10);

        context.log(`[POST] id: ${ids[id]}`);

        context.log(`Http function processed request for url "${request.url}"`);

        let payload = await request.json();
        context.log(`Payload: ${JSON.stringify(payload, null, 2)}`);
        if (payload === null)
            return { status: 400, body: "400 | payload could not be created" }

        // check if id exists
        if (ids.hasOwnProperty(id)) {

            if (ids[id].includes("azure_")) {
                targetDevice = ids[id];
            } else {
                targetTopic = topic + ids[id]
            }
        }
        else {
            targetTopic = null;
            return { status: 400, body: "400 | Resource does not exist." }
        }

        // payload primed
        globalPayload = JSON.stringify(payload, null, 2);

        context.log(`global payload: ${JSON.stringify(globalPayload, null, 2)}`);

        messagePublish(request, context);

        return { status: 200, body: "200 | OK" }
    }
});

app.http('modifyJSON', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'mqtt/{id}',
    handler: async (request, context) => {
        const id = parseInt(request.params.id, 10);

        context.log(`Http function processed request for url "${request.url}"`);

        let payload = await request.json();
        context.log(`Payload: ${JSON.stringify(payload, null, 2)}`);
        if (payload === null)
            return { status: 400, body: "400 | payload could not be created" }

        // check if id exists
        if (ids.hasOwnProperty(id)) {

            if (ids[id].includes("azure")) {
                targetDevice = ids[id];
            } else {
                targetTopic = topic + ids[id]
            }
        }
        else {
            targetTopic = null;
            return { status: 400, body: "400 | Resource does not exist" }
        }

        // payload primed
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