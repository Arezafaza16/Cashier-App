import { ID, Query } from "appwrite";
import { appwriteConfig, databases } from "./config";


export async function getProducts(itemsPerPage, currentPage) {
    try {
        const products = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.productCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(itemsPerPage), Query.offset(currentPage - 1)]

        );
        if (!products) throw Error;

        return products;
    } catch (error) {
        console.log(error);
    }
}
export async function getAllProducts() {
    try {
        const products = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.productCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(50)]

        );
        if (!products) throw Error;

        return products;
    } catch (error) {
        console.log(error);
    }
}

export async function saveOrder(customerData, cartItems, updatedProducts) {
    try {
        const customer = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customerCollectionId,
            ID.unique(),
            {
                nama: customerData.name,
                status: "onCooked"
            }
        );

        for (const item of cartItems) {
            const order = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.orderCollectionId,
                ID.unique(),
                {
                    product: item.product,
                    quantity: item.quantity,
                    status: "onCooked",
                    customers: customer.$id,
                }
            );

            if (updatedProducts && Array.isArray(updatedProducts)) {
                const product = updatedProducts.find(p => p.product === item.product);
                if (product) {
                    await databases.updateDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.productCollectionId,
                        product.$id,
                        { stock_akhir: product.stock_akhir }
                    );
                } else {
                    console.warn(`Product with ID ${item.product} not found in updatedProducts`);
                }
            } else {
                console.error('updatedProducts is not defined or not an array');
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export async function getCustomers(itemsPerPage, currentPage) {
    const customers = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.customerCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(itemsPerPage), Query.offset(currentPage - 1)]
    );

    return customers;
}

export async function getOrderById(customerId) {
    const orders = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.orderCollectionId,
        [Query.equal('customers', customerId)]
    );
    return orders;
}

export async function deleteById(customerId) {

    const orders = await getOrderById(customerId)

    orders.documents.map(async (order) => (
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.orderCollectionId,
            order.$id
        )

    ))

    await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.customerCollectionId,
        customerId
    );
}

export async function addProduct(data) {
    const product = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productCollectionId,
        ID.unique(),
        {
            product: data.product,
            kategori: data.kategori,
            harga_jual_satuan: data.harga_jual_satuan,
            harga_pokok_satuan: data.harga_pokok_satuan,
            stock: data.stock,
            stock_akhir: data.stock_akhir,
        }
    );
}

export async function deleteProduct(productId) {
    await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productCollectionId,
        productId
    );
}

export async function updateCustomerStatus(customerId) {
    await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.customerCollectionId,
        customerId.customerId,
        { status: customerId.newStatus }
    );
}

export const getUserByEmail = async (email, password) => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('email', email), Query.equal('password', password)]
        );
        if (response.documents.length === 0) {
            throw new Error('Invalid email/password');
        }
        return response.documents[0];
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw error;
    }
};

export async function updateProduct(productId, data) {
    await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productCollectionId,
        productId,
        {
            product: data.product,
            kategori: data.kategori,
            harga_jual_satuan: data.harga_jual_satuan,
            harga_pokok_satuan: data.harga_pokok_satuan,
            stock: data.stock,
            stock_akhir: data.stock_akhir,
        }
    )
}