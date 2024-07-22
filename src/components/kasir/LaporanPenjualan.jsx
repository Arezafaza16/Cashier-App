import React, { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useGetAllProductsChart } from '../../appwrite/queriesAndMutations'
import { FaUser } from 'react-icons/fa'
import { formatRupiah } from '../../utils/rupiahFormatter'
import dayjs from 'dayjs' // Pastikan dayjs diimpor di sini
import { useNavigate } from 'react-router-dom'
import { IoChevronBackOutline } from 'react-icons/io5'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Dashboard = () => {
    const { data, isLoading, error } = useGetAllProductsChart()
    const [selectedProduct, setSelectedProduct] = useState(null)
    const navigate = useNavigate()
    const [timeFrame, setTimeFrame] = useState('weekly') // State untuk memilih mingguan atau bulanan

    useEffect(() => {
        if (data) {
        }
    }, [data])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    const handleProductClick = (product) => {
        setSelectedProduct(product)
    }

    const handleLogOut = () => {
        sessionStorage.removeItem('loginInfo')
        window.location.reload();
    }

    const filterDataByTimeFrame = (documents, timeFrame) => {
        const now = dayjs()
        return documents.filter(doc => {
            const createdAt = dayjs(doc.$createdAt)
            const updatedAt = dayjs(doc.$updatedAt)
            if (timeFrame === 'weekly') {
                return createdAt.isAfter(now.subtract(1, 'week')) || updatedAt.isAfter(now.subtract(1, 'week'))
            } else if (timeFrame === 'monthly') {
                return createdAt.isAfter(now.subtract(1, 'month')) || updatedAt.isAfter(now.subtract(1, 'month'))
            }
            return true
        })
    }

    const filteredData = filterDataByTimeFrame(data.documents, timeFrame)

    const labels = filteredData.map(product => product.product)
    const selling = filteredData.map(product => {
        const sell = product.stock - product.stock_akhir
        return sell
    })
    const salesData = filteredData.map((product, index) => {
        const sales = product.harga_jual_satuan * selling[index]
        return sales
    })

    const totalSales = salesData.reduce((acc, curr) => acc + curr, 0)
    const OutCome = filteredData.map(product => product.harga_jual_satuan * product.stock)
    const totalOutCome = OutCome.reduce((acc, curr) => acc + curr, 0)


    const barData = {
        labels,
        datasets: [
            {
                label: 'Hasil Penjualan',
                data: salesData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Menambahkan opsi ini untuk membuat chart responsif
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart Hasil Penjualan',
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 90,
                    minRotation: 45,
                },
            },
        },
    }

    return (
        <>
            <div className="w-full h-16 flex bg-[#212529] justify-between fixed">
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


            <div className="dashboard">
                <div className="header mb-10">
                    <h1 className=' font-bold text-4xl'>Data dan Laporan Penjualan</h1>
                </div>
                <IoChevronBackOutline onClick={() => navigate('/')} className=' m-5 font-bold text-4xl md:text-5xl bg-slate-50 hover:bg-slate-200 text-black border p-2 rounded-full' />
                <div className="overview flex items-center justify-center my-10">
                    <div className="card mx-auto border">
                        <h3>Total penjualan keseluruhan</h3>
                        <p className=' font-bold'>{formatRupiah(totalSales)}</p>
                        <p>Anda menghasilkan {formatRupiah(totalSales)} dari total pengeluaran {formatRupiah(totalOutCome)}</p>
                    </div>
                </div>
                <div className="timeframe-selector flex justify-center mb-10">
                    <button onClick={() => setTimeFrame('weekly')} className={`mx-2 p-2 ${timeFrame === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Mingguan</button>
                    <button onClick={() => setTimeFrame('monthly')} className={`mx-2 p-2 ${timeFrame === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Bulanan</button>
                </div>
                <div className="chart-container" style={{ height: '400px' }}> {/* Menambahkan style untuk mengatur tinggi chart */}
                    <Bar data={barData} options={options} />
                </div>
                <div className="product-list mt-10 flex flex-wrap justify-center gap-4">
                    {filteredData.map(product => (
                        <div key={product.$id} className="product-item border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                            <h3 className="font-bold text-lg mb-2">{product.product}</h3>
                            <p>Stok Awal: {product.stock}</p>
                            <p>Stok Akhir: {product.stock_akhir}</p>
                            <p>Harga: {formatRupiah(product.harga_jual_satuan)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Dashboard