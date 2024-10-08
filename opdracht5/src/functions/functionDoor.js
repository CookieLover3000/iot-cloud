const { app } = require('@azure/functions');

require('dotenv').config({ path: './opdracht5_env.env' });

var Client = require('azure-iothub').Client;
var connectionString = process.env.IOTHUB_CONNECTION_STRING;
var targetDevice = 'deur';

var methodParams = {
    methodName: "lockDoor",
    payload: null,
    responseTimeoutInSeconds: 15 // set response timeout as 15 seconds
};


async function messageDeur(request, context) {
    context.log(`Http function processed request for url "${request.url}"`);

    var client = Client.fromConnectionString(connectionString);
    context.log("Connected to client");
    try {
        var result = await client.invokeDeviceMethod(targetDevice, methodParams);
        console.log(result.result);

        context.log(JSON.stringify(result.result));
        client.close();
        return {
            status: 200,
            body: JSON.stringify(result.result)
        }
    } catch (err) {
        context.log(err.message);
        return { status: 500, body: 'internal server error' };
    }
}

app.http('createDeurMessage', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'deur',
    handler: async (request, context) => {


        context.log(`Http function processed request for url "${request.url}"`);

        let payload = await request.json();
        context.log(`Payload: ${JSON.stringify(payload, null, 2)}`);
        if (payload === null)
            return { status: 400, body: "400 | payload could not be created" }

        // payload primed
        methodParams.payload = payload;

        return messageDeur(request, context);
    }
});