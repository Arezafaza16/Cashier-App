import React from 'react'
import { useGetOrderByCustomerId } from '../../appwrite/queriesAndMutations';
import { useParams } from 'react-router-dom';

const Order = () => {
    const { id } = useParams()
    const { data, isLoading } = useGetOrderByCustomerId(id);

    if (isLoading && !data) return <div>Loading...</div>
    return (
        <div className=' p-10'>
            <h2 className='text-3xl font-bold mb-5'>List Order</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2">Product</th>
                        <th className="border p-2">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Data produk akan ditambahkan di sini */}
                    {data.documents.map((list) => (
                        <tr key={list.$id} className=' text-center'>
                            <td className='border p-2'>{list.product}</td>
                            <td className='border p-2'>{list.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Order