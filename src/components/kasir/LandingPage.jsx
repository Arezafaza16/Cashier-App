import React from 'react'
import { FaUser } from "react-icons/fa";
import cashMachineImage from '../../assets/images/icons/cash-machine.png';
import inventory from '../../assets/images/icons/inventory.png';
import report from '../../assets/images/icons/report.png';
import team from '../../assets/images/icons/team.png';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate()
    const cards = [
        { icon: <img src={cashMachineImage} className=' w-52 h-52' />, title: 'Kasir', path: "/cashier/payment" },
        { icon: <img src={report} className=' w-52 h-52' />, title: 'Laporan Penjualan', path: "/cashier/data-penjualan" },
        { icon: <img src={inventory} className=' w-52 h-52' />, title: 'Data Product', path: "/cashier/data-products" },
        { icon: <img src={team} className=' w-52 h-52' />, title: 'Data Customer', path: "/cashier/data-customers" },
    ];

    return (
        <>
            <div className="w-full h-16 flex bg-[#212529] justify-between">
                <div className="flex justify-start items-center px-10">
                    <h2 className="text-white text-xl">Kedai Kopi GG</h2>
                </div>
                <div className="flex items-center px-10">
                    <button className='flex flex-row bg-blue-700 w-20 p-3 text-white rounded-md items-center justify-center'>
                        <FaUser className="mr-2" />
                        User
                    </button>
                </div>
            </div>

            <div className="p-24 grid grid-cols-2 gap-6">
                {cards.map((card, index) => (
                    <div key={index} onClick={() => navigate(card.path)} className="bg-white hover:bg-slate-100 cursor-pointer shadow-lg border rounded-lg flex flex-col items-center">
                        <div className="flex-grow flex items-center justify-center mb-10 mt-10">
                            {card.icon}
                        </div>
                        <h3 className="text-2xl font-semibold bg-blue-600 w-full text-center rounded-b-lg text-white p-2">{card.title}</h3>
                    </div>
                ))}
            </div>
        </>
    )
}

export default LandingPage