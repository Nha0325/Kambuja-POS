// import SalesReportChart from "../components/RevenueChart"
// import { HiCurrencyDollar } from "react-icons/hi2";
// import { FaFileInvoiceDollar } from "react-icons/fa6";
// import { HiDocumentCurrencyDollar } from "react-icons/hi2";
// import { FaCircleDollarToSlot } from "react-icons/fa6";
// import { FaUser } from "react-icons/fa";
// import { FaHandshake } from "react-icons/fa";
// import { FaFileInvoice } from "react-icons/fa6";
// import useFetchGeneralReport from "../hooks/useFetchGeneralReport";
// function Home() {

//   const {data} = useFetchGeneralReport()
//   return (
//     <>
//     <div className="p-4">

//     <div className="flex justify-between items-center">
//         <h1 className="text-xl font-semibold capitalize">General Report</h1>
//     </div>

//       <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             <div className="bg-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
//                   <div className="space-y-1">
//                         <p className="text-sm text-slate-600">Today Revenue</p>
//                         <h2 className="text-3xl  font-semibold">${data?.totalSaleToday?.toFixed(2) || 0 }</h2>
//                   </div>
//                   <div className="p-2 bg-slate-200/30 rounded-full">
//                         <span className="text-3xl text-slate-700"> 
//                               <HiCurrencyDollar />
//                         </span>
//                   </div>
//             </div>
//             <div className="bg-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
//                   <div className="space-y-1">
//                         <p className="text-sm text-slate-600">Due Invoice</p>
//                         <h2 className="text-3xl font-semibold">${data?.totalDueAmountSale?.toFixed(2) || 0 }</h2>
//                   </div>
//                   <div className="p-2 bg-slate-200/30 rounded-full">
//                       <span className="text-3xl text-slate-700">
//                         <FaFileInvoiceDollar />
//                       </span>
//                   </div>
//             </div>
//             <div className="bg-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
//                   <div className="space-y-1">
//                         <p className="text-sm text-slate-600">Due Purchase</p>
//                         <h2 className="text-3xl font-semibold">${data?.totalDueAmountPurchase?.toFixed(2) || 0 }</h2>
//                   </div>
//                   <div className="p-2 bg-slate-200/30 rounded-full">
//                       <span className="text-3xl text-slate-700"> 
//                        <HiDocumentCurrencyDollar />
//                       </span>
//                   </div>
//             </div>
//             <div className="bg-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
//                   <div className="space-y-1">
//                         <p className="text-sm text-slate-600">Monthly Revenue</p>
//                         <h2 className="text-3xl font-semibold">${data?.totalAmountSale?.toFixed(2) || 0 }</h2>
//                   </div>
//                   <div className="p-2 bg-slate-200/30 rounded-full">
//                       <span className="text-3xl text-slate-700">
//                         <FaCircleDollarToSlot />
//                       </span>
//                   </div>
//             </div>

//             <div className="bg-orange-400 text-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
//                   <div className="space-y-1">
//                         <h2 className="text-3xl font-semibold">{data?.totalCustomers || 0 }</h2>
//                         <p className="text-sm font-semibold">Customers</p>
//                   </div>
//                   <div className="p-2">
//                       <span className="text-3xl"> 
//                         <FaUser />
//                       </span>
//                   </div>
//             </div>
//             <div className="bg-blue-400 text-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
//                   <div className="space-y-1">
//                         <h2 className="text-3xl font-semibold">{data?.totalSuppliers || 0 }</h2>
//                         <p className="text-sm font-semibold">Suppliers</p>
//                   </div>
//                   <div className="p-2">
//                       <span className="text-3xl"> 
//                         <FaHandshake />
//                       </span>
//                   </div>
//             </div>
//             <div className="bg-slate-700 text-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
//                   <div className="space-y-1">
//                         <h2 className="text-3xl font-semibold">{data?.totalPurchaseDue || 0 }</h2>
//                         <p className="text-sm font-semibold">Purchase Due Invoice</p>
//                   </div>
//                   <div className="p-2">
//                       <span className="text-3xl">
//                         <FaFileInvoice />  
//                       </span>
//                   </div>
//             </div>
//             <div className="bg-green-400 text-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
//                   <div className="space-y-1">
//                         <h2 className="text-3xl font-semibold">{data?.totalSaleDue || 0}</h2>
//                         <p className="text-sm font-semibold">Sales Due Invoice</p>
//                   </div>
//                   <div className="p-2">
//                       <span className="text-3xl">
//                       <FaFileInvoice /> 
//                       </span>
//                   </div>
//             </div>
           
//       </div>

//       <div className="bg-white px-4 py-8 rounded-lg shadow-sm mt-4">
//         <SalesReportChart data={data?.monthlySales}/>
//       </div>

//     </div>


//     </>
//   )
// }

// export default Home
