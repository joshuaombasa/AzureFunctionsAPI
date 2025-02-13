
require("dotenv").config();
const { CosmosClient } = require("@azure/cosmos");

// Load environment variables
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE;
const containerId = process.env.COSMOS_DB_CONTAINER;

if (!endpoint || !key || !databaseId || !containerId) {
    throw new Error("Missing required environment variables for Cosmos DB connection.");
}

const client = new CosmosClient({ endpoint, key });
const container = client.database(databaseId).container(containerId);

async function getProducts(context) {
    try {
        const { resources } = await container.items.readAll().fetchAll();
        context.res = { status: 200, body: resources };
    } catch (error) {
        context.res = { status: 500, body: `Error fetching products: ${error.message}` };
    }
}

async function createProduct(context, req) {
    try {
        const { body } = req;
        if (!body || !body.id) {
            throw new Error("Product data with 'id' is required.");
        }
        const { resource } = await container.items.create(body);
        context.res = { status: 201, body: resource };
    } catch (error) {
        context.res = { status: 400, body: `Error creating product: ${error.message}` };
    }
}

async function updateProduct(context, req) {
    try {
        const { id, ...updateData } = req.body;
        if (!id) {
            throw new Error("Product 'id' is required for update.");
        }
        const { resource } = await container.item(id, id).replace(updateData);
        context.res = { status: 200, body: resource };
    } catch (error) {
        context.res = { status: 400, body: `Error updating product: ${error.message}` };
    }
}

async function deleteProduct(context, req) {
    try {
        const { id } = req.body;
        if (!id) {
            throw new Error("Product 'id' is required for deletion.");
        }
        await container.item(id, id).delete();
        context.res = { status: 204 };
    } catch (error) {
        context.res = { status: 400, body: `Error deleting product: ${error.message}` };
    }
}

module.exports = async function (context, req) {
    try {
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
                context.res = { status: 405, body: "Method Not Allowed" };
        }
    } catch (error) {
        context.res = { status: 500, body: `Server error: ${error.message}` };
    }
};
