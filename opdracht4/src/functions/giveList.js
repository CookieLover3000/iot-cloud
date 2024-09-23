const { app } = require('@azure/functions');
const list = {
    people:[
        {name: "Jan"},
        {name: "Stacey"}
]}

app.http('giveList', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'personen/{id}',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const id = parseInt(request.params.id, 10) -1;

        const person = list.people[id];

        console.log("id: " + id);
        if(id === null) {
            return { body: `Hello, ${JSON.stringify(list)}!` };
        }
        else if(id >= list.people.length || id < 0) {
            return {
                body: "404 | Person does not exist.",
                status: 404
            }
        }
        else {
            return { body: `Hello, ${JSON.stringify(person)}` };
        }
    }
});

app.http('addPeople', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'personen',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        let person = request.query.get('name');

        if(person === null) 
            return { status : 400 }
        
        let personName = {"name" : person}
        list.people.push(personName);
        console.log(`Person name: ${JSON.stringify(personName)}`);        
    }
});

app.http('modifyPeople', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'personen/change/{id}',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        let person = request.query.get('name');

        if(person === null) 
            return { status : 400 }
        
        let personName = {"name" : person}
        list.people.push(personName);
        console.log(`Person name: ${JSON.stringify(personName)}`);        
    }
});