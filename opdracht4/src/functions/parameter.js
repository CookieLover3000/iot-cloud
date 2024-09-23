const { app } = require('@azure/functions');

app.http('parameter', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name')// || await request.text() || 'world';
        if(name === null) {
            context.log("Error. Name is empty.")
            return {
                status : 500,
                body : "Error. Name is empty"
            }
        } 

        return { body: `Hello, ${name}!` };
    }
});
