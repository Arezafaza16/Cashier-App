import { Account, Client, Databases, Storage } from "appwrite";

export const appwriteConfig = {
    endpoint: import.meta.env.VITE_ENDPOINT,
    projectId: import.meta.env.VITE_PROJECT_ID,
    databaseId: import.meta.env.VITE_DATABASE_ID,
    productCollectionId: import.meta.env.VITE_PRODUCT_COLLECTION_ID,
    customerCollectionId: import.meta.env.VITE_CUSTOMER_COLLECTION_ID,
    orderCollectionId: import.meta.env.VITE_ORDER_COLLECTION_ID,
    userCollectionId: import.meta.env.VITE_USER_COLLECTION_ID,

}

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_ENDPOINT)
    .setProject(import.meta.env.VITE_PROJECT_ID);


export const databases = new Databases(client)