const PROTO_PATH = './customers.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { v4: uuidv4 } = require('uuid');



const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true, //case sensentive...
    longs: String, //long strings...
    enums: String, // allow enums...
    arrays: true // allow arrays...
});

const customersProto = grpc.loadPackageDefinition(packageDefinition);

const customers = [{
    id: "12345",
    name: 'raghvendra',
    age: 28,
    address: "34u39493"
}, {
    id: "98765",
    name: 'rajesh',
    age: 29,
    address: "dlfjalkdsfj"
}]
// create a grpc server
const server = new grpc.Server();
server.addService(customersProto.customerService.service, {
    //call => this;
    //callback => send and recieve;
    getAll: (call, callback) => {
        callback(null, { customers });
    },
    get: (call, callback) => {
        let customer = customers.find((n) => n.id === call.request.id);
        if (customer) {
            callback(null, customer);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"
            })
        }
    },
    insert: (call, callback) => {
              console.log('asdf',uuidv4())
        let customer = call.request;
  
        customer.id = uuidv4();
        customers.push(customer);
        console.log(customer)
        callback(null, customer);
    },
    update: (call, callback) => {
        let exisitingCustomer = customers.find((n) => n.id === call.request.id);
        if (exisitingCustomer) {
            exisitingCustomer.name = call.request.name;
            exisitingCustomer.age = call.request.age;
            exisitingCustomer.address = call.request.address;
            callback(null, exisitingCustomer);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"

            })
        }
    },
    remove: (call, callback) => {
        let exisitingCustomer = customers.find((n) => n.id === call.request.id);

        if (exisitingCustomer !== -1) {
            customers.splice(exisitingCustomer, 1);
            callback(null, {});
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"

            })
        }

    }
})

server.bindAsync(
    "127.0.0.1:30043",
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error(err);
            return;
        } else {
            // server.start();
            console.log(`Server running on port ${port}`);
        }

    }
);