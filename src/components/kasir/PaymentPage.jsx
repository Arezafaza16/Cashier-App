import React, { useState, useEffect } from 'react';
import { useGetAllProductsChart, useSaveOrder } from '../../appwrite/queriesAndMutations';
import { FaShoppingCart, FaTags, FaPlus, FaTimes, FaCheck, FaUser } from "react-icons/fa";
import smallCash from '../../assets/images/icons/small-cash-register.png';
import { formatRupiah } from '../../utils/rupiahFormatter';
import { useNavigate } from 'react-router-dom';
import ReactToPrint from 'react-to-print';

const PaymentPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isInputActive, setIsInputActive] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [checkoutData, setCheckoutData] = useState([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [cash, setCash] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [isCheckedOut, setIsCheckedOut] = useState(false);

    const saveOrderMutation = useSaveOrder();
    const { data, isLoading, error } = useGetAllProductsChart();
    const navigate = useNavigate();

    const handleCashChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        const sanitizedValue = value.replace(/^0+/, '');
        setCash(sanitizedValue ? parseInt(sanitizedValue) : 0);
        e.target.value = sanitizedValue ? formatRupiah(sanitizedValue) : '';
    };

    const calculateChange = () => {
        const grandTotal = calculateGrandTotal();
        const change = cash - grandTotal;
        return change;
    };

    useEffect(() => {
        if (data && data.documents) {
            const filtered = data.documents.filter(product => {
                return product?.product?.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredProducts(filtered);
        }
    }, [data, searchTerm]);


    const handleProductClick = (product) => {
        setSelectedProduct([...selectedProduct, product]);
        setSearchTerm('');
        setIsInputActive(false);
    };

    const handleQuantityChange = (productId, value) => {
        const sanitizedValue = value.replace(/^0+/, '')
        setQuantities({
            ...quantities,
            [productId]: sanitizedValue
        });
    };

    const calculateTotal = (productId, price) => {
        const quantity = parseInt(quantities[productId]) || 0;
        return price * quantity;
    };

    const calculateGrandTotal = () => {
        return selectedProduct.reduce((total, product) => {
            return total + calculateTotal(product.$id, product.harga_jual_satuan);
        }, 0);
    };

    const handleCheckout = () => {
        const checkoutItems = selectedProduct.map(product => ({
            product: product.product,
            kategori: product.kategori,
            harga: product.harga_jual_satuan,
            qty: parseInt(quantities[product.$id]) || 0,
            total: calculateTotal(product.$id, product.harga_jual_satuan)
        }));
        const grandTotal = calculateGrandTotal();
        const change = calculateChange();
        setCheckoutData([...checkoutItems, { grandTotal, change }]);
        setIsPopupVisible(true);
    };

    const handleSubmit = async () => {
        try {
            if (!customerName || cash <= 0) {
                alert('Please fill in all customer details and ensure cash is greater than 0.');
                return;
            }

            if (calculateChange() < 0) {
                alert('Cash tidak cukup.');
                return;
            }

            // Update stock akhir untuk setiap produk
            const updatedProducts = selectedProduct.map(product => ({
                ...product,
                stock_akhir: product.stock_akhir - (parseInt(quantities[product.$id]) || 0)
            }));


            // Simpan order dan update stok produk
            await saveOrderMutation.mutateAsync({
                customerData: { name: customerName },
                cartItems: checkoutData.slice(0, -1).map(item => ({
                    product: item.product,
                    quantity: item.qty,
                })),
                cash: cash, // Simpan cash
                change: calculateChange(), // Simpan change
                updatedProducts // Tambahkan updatedProducts ke dalam payload
            });

            // Tutup popup setelah submit
            setIsPopupVisible(false);
            setIsCheckedOut(true);
            // Reset state setelah submit

        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };

    const handleSelesai = () => {
        setIsCheckedOut(false);
        setSelectedProduct([]);
        setQuantities({});
        setCheckoutData([]);
        setCash(0);
        setCustomerName('');
    }

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading products</div>;

    return (
        <>
            <div className="w-full h-16 flex bg-[#212529] justify-between">
                <div className="flex justify-start items-center px-10">
                    <img src={smallCash} className='w-14 h-14' alt="Cash Register" />
                </div>
            </div>

            <div className="flex p-10 ">
                <div className="w-3/4 border bg-white rounded-lg shadow-md">
                    <div className='border-b-8 p-6'>
                        <div className="flex justify-between mb-4">
                            <div className="flex space-x-2">
                                <h2 className='text-5xl font-bold'>Cashier Payment</h2>
                            </div>
                        </div>
                    </div>
                    <div className=' p-6'>
                        <div className="flex items-center mb-4">
                            <input
                                type="text"
                                placeholder="nama product"
                                className="border p-2 rounded-l"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsInputActive(true)}
                                onBlur={() => setTimeout(() => setIsInputActive(false), 200)}
                            />
                            <button className="bg-slate-900 text-white h-10 p-2 rounded-r"><FaPlus /></button>
                        </div>
                        {isInputActive && (
                            <div className='search-option absolute bg-white border w-96 max-h-60 p-2 rounded shadow-lg overflow-y-auto z-10'>
                                {filteredProducts.map((find) => (
                                    <p
                                        key={find.$id}
                                        className='text-black border-b cursor-pointer p-2 hover:bg-gray-200'
                                        onMouseDown={() => handleProductClick(find)}
                                    >
                                        {find.product}
                                    </p>
                                ))}
                            </div>
                        )}
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="border p-2">Nama Produk</th>
                                    <th className="border p-2">Kategori</th>
                                    <th className="border p-2">Harga</th>
                                    <th className="border p-2">Qty</th>
                                    <th className="border p-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedProduct.map(product => (
                                    <tr key={product.$id}>
                                        <td className="border p-2">{product.product}</td>
                                        <td className="border p-2">{product.kategori}</td>
                                        <td className="border p-2">{formatRupiah(product.harga_jual_satuan)}</td>
                                        <td className="border p-2">
                                            <input
                                                type="number"
                                                value={quantities[product.$id] || ''}
                                                onChange={(e) => handleQuantityChange(product.$id, e.target.value)}
                                                className="w-full p-1"
                                            />
                                        </td>
                                        <td className="border p-2">{formatRupiah(calculateTotal(product.$id, product.harga_jual_satuan))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4">
                            <div className="flex border-b-2 px-20">
                                <div className="text-right">
                                    <div className="mb-2 text-2xl font-bold">Total</div>
                                </div>
                            </div>
                            <div className="flex border-b-2 px-20">
                                <div className="text-right">
                                    <div className="mb-2 text-2xl font-bold">{formatRupiah(calculateGrandTotal())}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between p-10 border-t-8">
                        <button className="bg-gray-300 text-black p-2 rounded" onClick={() => navigate('/')}><FaTimes /> Close Cashier</button>
                        <button className={isCheckedOut ? "hidden" : "bg-blue-500 text-white p-2 rounded"} onClick={handleCheckout}><FaCheck /> Checkout (F2)</button>
                    </div>
                </div>
                <div className="w-1/4 ml-6">
                    <div className="bg-white p-6 rounded-lg shadow-md mb-4 border">
                        <div className="mb-2"><strong>Tanggal</strong>: {new Date().toLocaleDateString()}</div>
                        <div className="mb-2 flex flex-row gap-4"><strong>Customer</strong>: <p className=' text-lg font-bold'>{customerName} </p></div>
                    </div>
                    <div className="bg-white p-6  border rounded-lg shadow-md">
                        {isCheckedOut
                            ? <div className=' cart'>
                                <ReactToPrint
                                    trigger={() => <button className='bg-slate-900 text-white p-2 rounded'>Cetak Struk</button>}
                                    content={() => document.getElementById('struk')}
                                    documentTitle='Struk'
                                    pageStyle='margin: 0;'
                                />
                                <div id='struk'>
                                    <p className='text-3xl font-bold text-center mb-4'>Total Belanja</p>
                                    <ul >
                                        {checkoutData.slice(0, -1).map((item, index) => (
                                            <li key={index} className=' flex flex-row justify-between'>
                                                <p>
                                                    {item.product} ({item.qty})
                                                </p>
                                                <p>{formatRupiah(item.total)}</p>
                                            </li>
                                        ))}
                                        <li className=' flex flex-row justify-between mt-4'>
                                            <p className=' text-lg font-bold'>Grand Total</p>
                                            <p className=' text-lg font-bold'>{formatRupiah(checkoutData[checkoutData.length - 1].grandTotal)}</p>
                                        </li>
                                        <li className=' flex flex-row justify-between'>
                                            <p className=' text-lg font-bold'>Cash</p>
                                            <p className=' text-lg font-bold'>{formatRupiah(cash)}</p>
                                        </li>
                                        <li className=' flex flex-row justify-between'>
                                            <p className=' text-lg font-bold'>Change</p>
                                            <p className=' text-lg font-bold'>{formatRupiah(cash - checkoutData[checkoutData.length - 1].grandTotal)}</p>
                                        </li>
                                        <h2 className=' mt-4 text-lg font-bold'>{customerName}</h2>
                                        <p className=' text-right'>{new Date().toLocaleDateString()}</p>
                                    </ul>
                                </div>
                                <button className='bg-slate-600 mt-4 text-white w-full p-2 rounded-md' onClick={handleSelesai}>Selesai</button>
                            </div>

                            : (
                                <>
                                    <div className="flex items-center justify-center mb-4">
                                        <FaShoppingCart size={50} />
                                    </div>
                                    <button className="bg-red-500 text-white w-full p-2 rounded">Total Belanja</button>
                                </>
                            )
                        }
                    </div>
                </div>
            </div>

            {isPopupVisible && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-md w-1/2">
                        <h2 className="text-2xl font-bold mb-4">Detail Checkout</h2>
                        <table className="w-full border-collapse text-center">
                            <thead>
                                <tr>
                                    <th className=" p-2">Pesanan</th>
                                    <th className=" p-2">Qty</th>
                                    <th className=" p-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checkoutData.slice(0, -1).map((item, index) => (
                                    <tr key={index}>
                                        <td className=" p-2">{item.product}</td>
                                        <td className=" p-2">{item.qty}</td>
                                        <td className=" p-2">{formatRupiah(item.total)}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="4" className="border p-2 text-right font-bold">Grand Total</td>
                                    <td className="border p-2 font-bold"> {formatRupiah(checkoutData[checkoutData.length - 1].grandTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="mt-4">
                            <label className="block mb-2 font-bold">Customer</label>
                            <input
                                type="text"
                                className="border p-2 w-full"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block mb-2 font-bold">Cash</label>
                            <input
                                type="text"
                                className="border p-2 w-full"
                                value={formatRupiah(cash)}
                                onInput={handleCashChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block mb-2 font-bold">Change</label>
                            <div className="border p-2 w-full">
                                {calculateChange() < 0 ? "Cash tidak cukup" : formatRupiah(calculateChange())}
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button className="bg-blue-500 text-white p-2 rounded" onClick={handleSubmit}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PaymentPage;