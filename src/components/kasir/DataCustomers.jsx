import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaTrash, FaSearch, FaFilePdf, FaCheck, FaFileExcel } from "react-icons/fa";
import { TbPlayerSkipBackFilled, TbPlayerSkipForwardFilled, TbPlayerTrackNextFilled, TbPlayerTrackPrevFilled } from "react-icons/tb";
import { useGetCustomers } from '../../appwrite/queriesAndMutations';
import { useNavigate } from 'react-router-dom';
import { deleteById } from '../../appwrite/api';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { IoChevronBackOutline } from 'react-icons/io5';

const DataCustomers = () => {
    const [customerList, setCustomerList] = useState([]);
    const [loadingDelete, setLoadingDelete] = useState(null);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const { data: customers, isLoading } = useGetCustomers(itemsPerPage, currentPage);
    const navigate = useNavigate();
    const tableRef = useRef();

    useEffect(() => {
        if (customers) {
            setCustomerList(customers.documents);
        }
    }, [customers]);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const handleLogOut = () => {
        sessionStorage.removeItem('loginInfo')
        window.location.reload();
    }

    const hasNextPage = customers && customers.documents.length === itemsPerPage;

    const handleDelete = async (customerId) => {
        setLoadingDelete(customerId);
        await deleteById(customerId);
        setCustomerList(customerList.filter(customer => customer.$id !== customerId));
        setLoadingDelete(null);
    };

    const handleDeleteSelected = async () => {
        for (const customerId of selectedCustomers) {
            await handleDelete(customerId);
        }
        setSelectedCustomers([]);
    };

    const handleSelectCustomer = (customerId) => {
        setSelectedCustomers(prevSelected =>
            prevSelected.includes(customerId)
                ? prevSelected.filter(id => id !== customerId)
                : [...prevSelected, customerId]
        );
    };

    const handleSelectAllCustomers = () => {
        if (selectedCustomers.length === customerList.length) {
            setSelectedCustomers([]);
        } else {
            setSelectedCustomers(customerList.map(customer => customer.$id));
        }
    };


    const handleExportPDF = useReactToPrint({
        content: () => tableRef.current,
        documentTitle: 'customers',
    });

    const handleExportExcel = () => {
        const filteredData = customerList.map(({ nama, status }) => ({ nama, status }));
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
        XLSX.writeFile(workbook, 'customers.xlsx');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCustomers = customerList.filter(customer =>
        customer.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="w-full h-16 flex bg-[#212529] justify-between">
                <div className="flex justify-start items-center px-10">
                    <h2 className="text-white text-xl">Kedai Kopi GG</h2>
                </div>
                <div className="flex items-center px-10">
                    <button onClick={handleLogOut} className='flex flex-row bg-blue-700 w-20 p-3 text-white rounded-md items-center justify-center'>
                        <FaUser className="mr-2" />
                        LogOut
                    </button>
                </div>
            </div>

            <IoChevronBackOutline onClick={() => navigate('/')} className=' m-5 font-bold text-4xl md:text-5xl bg-slate-50 hover:bg-slate-200 text-black border p-2 rounded-full' />

            <div className="p-10">
                <div className="flex flex-row mb-4">
                    <div className="flex space-x-2">
                        <button className="border bg-slate-50 hover:bg-slate-200 text-black p-2 rounded" onClick={handleDeleteSelected}><FaTrash /></button>
                        <button className="border bg-slate-50 hover:bg-slate-200 text-black p-2 rounded" onClick={handleExportExcel}><FaFileExcel /></button>
                        <button className="border bg-slate-50 hover:bg-slate-200 text-black p-2 rounded" onClick={handleExportPDF}><FaFilePdf /></button>
                        <button className="border bg-slate-50 hover:bg-slate-200 text-black p-2 rounded" onClick={() => setShowCheckboxes(!showCheckboxes)}><FaCheck /></button>
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
                    />
                    <button className="border h-12 bg-slate-50 hover:bg-slate-200 text-black p-2 rounded"><FaSearch /></button>
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
                <table id="customer-table" className="w-full border-collapse" ref={tableRef}>
                    <thead>
                        <tr>
                            {showCheckboxes && (
                                <th className="border p-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedCustomers.length === customerList.length}
                                        onChange={handleSelectAllCustomers}
                                    />
                                </th>
                            )}
                            <th className="border p-2">Nama</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.$id} className='text-center'>
                                {showCheckboxes && (
                                    <td className='border p-2'>
                                        <input
                                            type="checkbox"
                                            checked={selectedCustomers.includes(customer.$id)}
                                            onChange={() => handleSelectCustomer(customer.$id)}
                                        />
                                    </td>
                                )}
                                <td className='border p-2'>{customer.nama}</td>
                                <td className='border p-2'>{customer.status}</td>
                                <td className='border p-2'>
                                    <button className='border p-2 rounded-md bg-slate-600 text-white hover:bg-blue-800' onClick={() => navigate(`/cashier/data-customers/${customer.$id}`)}>View</button>
                                    <button
                                        className='border p-2 rounded-md bg-gray-900 text-white hover:bg-red-800'
                                        onClick={() => handleDelete(customer.$id)}
                                        disabled={loadingDelete === customer.$id}
                                    >
                                        {loadingDelete === customer.$id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default DataCustomers;