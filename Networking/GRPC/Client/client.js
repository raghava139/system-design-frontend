const PROTO_PATH = './customers.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');


const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true, //case sensentive...
    longs: String, //long strings...
    enums: String, // allow enums...
    arrays: true // allow arrays...
});

const CustomerService = grpc.loadPackageDefinition(packageDefinition).customerService;

const client = new CustomerService(
    "127.0.0.1:30043",
    grpc.credentials.createInsecure(),
)

module.exports = client;