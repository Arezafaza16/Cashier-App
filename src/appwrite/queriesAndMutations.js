import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addProduct, deleteById, deleteProduct, getAllProducts, getCustomers, getOrderById, getProducts, getUserByEmail, saveOrder, updateCustomerStatus, updateProduct } from "./api"
import { QueryKeys } from "./queryKey"


export const useGetAllProducts = (itemsPerPage, currentPage) => {
    try {
        const data = useQuery({
            queryKey: [QueryKeys.getAllProducts, itemsPerPage, currentPage],
            queryFn: () => getProducts(itemsPerPage, currentPage),
        })
        return data;
    } catch (error) {
        console.log(error);

    }
}

export const useGetAllProductsChart = () => {
    try {
        const data = useQuery({
            queryKey: [QueryKeys.getAllProducts,],
            queryFn: () => getAllProducts(),
        })
        return data;
    } catch (error) {
        console.log(error);

    }
}

export const useSaveOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customerData, cartItems, updatedProducts }) => saveOrder(customerData, cartItems, updatedProducts),
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.getAllCustomers]);
            queryClient.invalidateQueries([QueryKeys.getAllOrders]);
            queryClient.invalidateQueries([QueryKeys.getAllProducts]); // Tambahkan ini untuk mengupdate produk
        }
    });
};

export const useGetCustomers = (itemsPerPage, currentPage) => {
    return useQuery({
        queryKey: [QueryKeys.getAllCustomers, itemsPerPage, currentPage],
        queryFn: () => getCustomers(itemsPerPage, currentPage),
    })
}

export const useGetOrderByCustomerId = (customerId) => {
    return useQuery({
        queryKey: [QueryKeys.getOrderById, customerId],
        queryFn: () => getOrderById(customerId),
        enabled: !!customerId,
    })
}


export const useDeleteById = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (customerId, orderId) => deleteById(customerId, orderId),
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.getAllCustomers]);
            queryClient.invalidateQueries([QueryKeys.getAllOrders]);
        }
    });
}

export const useAddProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (product) => addProduct(product),
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.getAllProducts]);
        }
    });
}

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (productId) => deleteProduct(productId),
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.getAllProducts]);
        }
    });
}

export const useUpdateCustomerStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (customerId, newStatus) => updateCustomerStatus(customerId, newStatus),
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.getAllCustomers]);
        }
    });
}

export const useGetUserByEmail = () => {
    return useQuery({
        queryKey: [QueryKeys.getUserByEmail],
        queryFn: () => getUserByEmail(email),

    })
}

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.getAllProducts]);
        }
    });
}