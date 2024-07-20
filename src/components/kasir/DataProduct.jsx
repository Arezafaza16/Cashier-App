import React, { useEffect, useState } from 'react';
import { FaUser, FaPlus, FaTrash, FaEdit, FaSearch, FaFilePdf, FaCheck } from "react-icons/fa";
import { TbPlayerSkipBackFilled, TbPlayerSkipForwardFilled, TbPlayerTrackNextFilled, TbPlayerTrackPrevFilled } from "react-icons/tb";
import { FaFileExcel } from "react-icons/fa";
import { useAddProduct, useGetAllProducts, useDeleteProduct } from '../../appwrite/queriesAndMutations';
import { formatRupiah } from '../../utils/rupiahFormatter';
import ReactToPrint from 'react-to-print';
import * as XLSX from 'xlsx';

const DataProduct = () => {
    const addProduct = useAddProduct();
    const deleteProduct = useDeleteProduct();
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [newProduct, setNewProduct] = useState({
        product: '',
        kategori: '',
        harga_jual_satuan: '',
        harga_pokok_satuan: '',
        stock: '',
        stock_akhir: ''
    });
    const { data, isLoading: isLoadingProducts, isError } = useGetAllProducts(itemsPerPage, currentPage);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const exportToExcel = () => {
        if (!data || !data.documents) return;
        const header = [
            ["Nama Produk", "Kategori", "Harga Jual / Satuan", "Harga Pokok / Satuan", "Stock Awal", "Stock Akhir"]
        ];
        const rows = data.documents.map(product => [
            product.product,
            product.kategori,
            formatRupiah(product.harga_jual_satuan),
            formatRupiah(product.harga_pokok_satuan),
            product.stock,
            product.stock_akhir
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet(header);
        XLSX.utils.sheet_add_aoa(worksheet, rows, { origin: "A2" });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Produk");

        const headerStyle = {
            font: { bold: true },
            alignment: { horizontal: "center" },
            fill: { fgColor: { rgb: "FFFF00" } }
        };
        for (let col = 0; col < header[0].length; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
            worksheet[cellAddress].s = headerStyle;
        }

        XLSX.writeFile(workbook, "DataProduk.xlsx");
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Reset to first page when items per page changes
    };

    const handleSelectAll = () => {
        if (!data || !data.documents) return;
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedProducts(data.documents.map(product => product.$id));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleCheckboxChange = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'harga_jual_satuan' || name === 'harga_pokok_satuan') {
            formattedValue = formatRupiah(value);
        }

        setNewProduct({
            ...newProduct,
            [name]: formattedValue,
            stock_akhir: name === 'stock' ? value : newProduct.stock_akhir
        });
    };

    const handleAddProduct = () => {
        setIsLoading(true);
        const data = {
            product: newProduct.product,
            kategori: newProduct.kategori,
            harga_jual_satuan: parseInt(newProduct.harga_jual_satuan.replace(/Rp/g, "").replace(/\./g, "")),
            harga_pokok_satuan: parseInt(newProduct.harga_pokok_satuan.replace(/Rp/g, "").replace(/\./g, "")),
            stock: parseInt(newProduct.stock),
            stock_akhir: parseInt(newProduct.stock_akhir)
        };

        console.log(data, 'dataAdd');

        addProduct.mutate(data, {
            onSuccess: (data) => {
                console.log('Produk baru berhasil ditambahkan:', data);
                setIsLoading(false); // Set loading state to false
            },
            onError: (error) => {
                console.error('Error menambahkan produk:', error);
                setIsLoading(false); // Set loading state to false
            }
        });
        setIsPopupVisible(false);
    };

    const handleDeleteProducts = () => {
        setIsLoading(true); // Set loading state to true
        selectedProducts.forEach(productId => {
            deleteProduct.mutate(productId, {
                onSuccess: () => {
                    console.log(`Produk dengan ID ${productId} berhasil dihapus`);
                    setIsLoading(false); // Set loading state to false
                },
                onError: (error) => {
                    console.error(`Error menghapus produk dengan ID ${productId}:`, error);
                    setIsLoading(false); // Set loading state to false
                }
            });
        });
        setSelectedProducts([]);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleLogOut = () => {
        sessionStorage.removeItem('loginInfo')
        window.location.reload();
    }

    const filteredProducts = data && data.documents ? data.documents.filter(product =>
        product.product.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const hasNextPage = data && data.documents.length === itemsPerPage;

    if (isLoadingProducts && !data) {
        return <div>Loading...</div>
    }
    if (isError) {
        return <div>There is an Error</div>
    }
    console.log(data);
    return (
        <>
            <div className="w-full h-16 flex bg-[#212529] justify-between">
                <div className="flex justify-start items-center px-10">
                    <h2 className="text-white text-xl">Kedai Kopi GG</h2>
                </div>
                <div className="flex items-center px-10">
                    <button onClick={handleLogOut} className='flex flex-row bg-blue-700 w-20 p-3 text-white rounded-md items-center justify-center' disabled={isLoading}>
                        <FaUser className="mr-2" />
                        LogOut
                    </button>
                </div>
            </div>

            <div className="p-10">
                <div className="flex flex-row mb-4">
                    <div className="flex space-x-2">
                        <button
                            className="border bg-slate-50 hover:bg-slate-200 text-black p-2 rounded"
                            onClick={() => setIsPopupVisible(true)}
                            disabled={isLoading}
                        >
                            <FaPlus />
                        </button>
                        <button
                            className="border bg-slate-50 hover:bg-slate-200 text-black p-2 rounded"
                            onClick={handleDeleteProducts}
                            disabled={isLoading || selectedProducts.length === 0}
                        >
                            <FaTrash />
                        </button>
                        <button
                            className="border bg-slate-50 hover:bg-slate-200 text-black p-2 rounded"
                            onClick={exportToExcel}
                            disabled={isLoading}
                        >
                            <FaFileExcel />
                        </button>
                        <ReactToPrint
                            trigger={() => <button className="border bg-slate-50 hover:bg-slate-200 text-black p-2 rounded" disabled={isLoading}><FaFilePdf /></button>}
                            content={() => document.getElementById('struk')}
                            documentTitle='Data Produk'
                            pageStyle='padding: 10px;'
                        />
                        <button
                            className="border bg-slate-50 hover:bg-slate-200 text-black p-2 rounded"
                            onClick={() => setShowCheckboxes(!showCheckboxes)}
                            disabled={isLoading}
                        >
                            <FaCheck />
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            className=" pagination border w-20 h-12 p-2 rounded mx-5"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            disabled={isLoading}
                        >
                            <option value="15">15</option>
                            <option value="30">30</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                    <input
                        type="text"
                        placeholder="Nama Produk"
                        className="border w-80 h-12 p-2 rounded"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        disabled={isLoading}
                    />
                    <button className="border h-12 bg-slate-50 hover:bg-slate-200 text-black p-2 rounded" disabled={isLoading}><FaSearch /></button>
                    <div className="flex justify-between ml-4">
                        <div className="flex flex-row items-center">
                            <button
                                className="bg-slate-50 h-12 text-black p-2 rounded-l-md border"
                                disabled={isLoading || currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 2)}
                            >
                                <TbPlayerTrackPrevFilled />
                            </button>
                            <button
                                className='bg-slate-50 h-12 text-black p-2 border'
                                disabled={isLoading || currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                <TbPlayerSkipBackFilled />
                            </button>
                            <span className='w-12 h-12 flex justify-center items-center border bg-slate-300'>{currentPage}</span>
                            <button
                                className="bg-slate-50 h-12 text-black p-2 border"
                                disabled={isLoading || !hasNextPage}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                <TbPlayerSkipForwardFilled />
                            </button>
                            <button
                                className='bg-slate-50 h-12 text-black p-2 border rounded-r-md'
                                disabled={isLoading || !hasNextPage}
                                onClick={() => setCurrentPage(currentPage + 2)}
                            >
                                <TbPlayerTrackNextFilled />
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading && <div>Loading...</div>}

                <table id='struk' className="w-full border-collapse">
                    <thead>
                        <tr>
                            {showCheckboxes && (
                                <th className="border p-2">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        disabled={isLoading}
                                    />
                                </th>
                            )}
                            <th className="border p-2">Nama Produk</th>
                            <th className="border p-2">Kategori</th>
                            <th className="border p-2">Harga Jual / Satuan</th>
                            <th className="border p-2">Harga Pokok / Satuan</th>
                            <th className="border p-2">Stock Awal</th>
                            <th className="border p-2">Stock Akhir</th>
                            <th className="border p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.$id}>
                                {showCheckboxes && (
                                    <td className="border p-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.$id)}
                                            onChange={() => handleCheckboxChange(product.$id)}
                                            disabled={isLoading}
                                        />
                                    </td>
                                )}
                                <td className="border p-2">{product.product}</td>
                                <td className="border p-2">{product.kategori}</td>
                                <td className="border p-2">{formatRupiah(product.harga_jual_satuan)}</td>
                                <td className="border p-2">{formatRupiah(product.harga_pokok_satuan)}</td>
                                <td className="border p-2">{product.stock}</td>
                                <td className="border p-2">{product.stock_akhir}</td>
                                <td className="border p-2"><button className='bg-slate-50 hover:bg-slate-200 text-black p-2 rounded' disabled={isLoading}><FaEdit /> Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isPopupVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-10 rounded shadow-lg w-1/2">
                        <h2 className="text-2xl mb-6">Tambah Produk Baru</h2>
                        <form>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Nama Produk</label>
                                <input
                                    type="text"
                                    name="product"
                                    value={newProduct.product}
                                    onChange={handleInputChange}
                                    className="border w-full p-3 rounded"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Kategori</label>
                                <select
                                    name="kategori"
                                    value={newProduct.kategori}
                                    onChange={handleInputChange}
                                    className="border w-full p-3 rounded"
                                    disabled={isLoading}
                                >
                                    <option value="" selected disabled>Pilih Kategori</option>
                                    <option value="makanan">Makanan</option>
                                    <option value="minuman">Minuman</option>
                                    <option value="kopi">Kopi</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Harga Jual / Satuan</label>
                                <input
                                    type="text"
                                    name="harga_jual_satuan"
                                    value={newProduct.harga_jual_satuan}
                                    onChange={handleInputChange}
                                    className="border w-full p-3 rounded"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Harga Pokok / Satuan</label>
                                <input
                                    type="text"
                                    name="harga_pokok_satuan"
                                    value={newProduct.harga_pokok_satuan}
                                    onChange={handleInputChange}
                                    className="border w-full p-3 rounded"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={newProduct.stock}
                                    onChange={handleInputChange}
                                    className="border w-full p-3 rounded"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Stock Akhir</label>
                                <input
                                    type="number"
                                    name="stock_akhir"
                                    value={newProduct.stock_akhir}
                                    readOnly
                                    className="border w-full p-3 rounded bg-gray-200"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsPopupVisible(false)}
                                    className="bg-gray-500 text-white p-3 rounded mr-3"
                                    disabled={isLoading}
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddProduct}
                                    className="bg-blue-500 text-white p-3 rounded"
                                    disabled={isLoading}
                                >
                                    Tambah
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default DataProduct;