const { app } = require('@azure/functions');
const list = {
    people:[
        {name: "Jan"},
        {name: "Stacey"}
]}

app.http('giveList', {
    methods: ['GET'],
    authLevel: 'function',
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
    methods: ['POST'],
    authLevel: 'function',
    route: 'personen',
    handler: async (request, context) => {
        context.log(`hoi :)`)
        context.log(`Http function processed request for url "${request.url}"`);

        let person = await request.json();
        context.log(`Person: ${person.name}`); 
        if(person === null) 
            return { status : 400 }
        
        let personName = person;
        list.people.push(personName);

        context.log(`Person name: ${personName}`);        
    }
});

app.http('modifyPeople', {
    methods: ['PUT'],
    authLevel: 'function',
    route: 'personen/{id}',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const id = parseInt(request.params.id, 10) -1;
        let person = await request.json();
        context.log(`Person: ${person.name}`); 

        if(id === null) {
            return { body: `Hello, ${JSON.stringify(list)}!` };
        }
        else if(id >= list.people.length || id < 0) {
            return {
                body: "404 | Person does not exist.",
                status: 404
            }
        }

        if(person === null) 
            return { status : 400 }
        
        let personName = person;
        list.people[id] = personName;
        console.log(`Person name: ${JSON.stringify(personName)}`);        
    }
});

app.http('deletePeople', {
    methods: ['DELETE'],
    authLevel: 'function',
    route: 'personen/{id}',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const id = parseInt(request.params.id, 10) -1;

        if(id === null) {
            return {
                status: 400         
            }
        }
        else if(id >= list.people.length || id < 0) {
            return {
                body: "404 | Person does not exist.",
                status: 404
            }
        }
        
        list.people.splice(id,1);   
    }
});