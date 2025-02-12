require("dotenv").config();
const { CosmosClient } = require("@azure/cosmos");

// Load from .env
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE;
const containerId = process.env.COSMOS_DB_CONTAINER;

const client = new CosmosClient({ endpoint, key });
const container = client.database(databaseId).container(containerId);

module.exports = async function (context, req) {
    switch (req.method) {
        case "GET":
            await getProducts(context);
            break;
        case "POST":
            await createProduct(context, req);
            break;
        case "PUT":
            await updateProduct(context, req);
            break;
        case "DELETE":
            await deleteProduct(context, req);
            break;
        default:
            context.res = { status: 400, body: "Invalid request method" };
    }
};
