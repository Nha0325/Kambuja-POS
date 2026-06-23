
const sizes = {
    sm: "sm:w-[360px]",
    md: "sm:w-[460px]",
    lg: "sm:w-[600px]",
    xl: "sm:w-[600px] lg:w-[900px]"
}
 


const Modal= ({ open, size = "md" , onClose, children, title }) => {
    return <>
        <div
            className={`
          fixed inset-0 flex  backdrop-blur-sm transition-colors duration-300 justify-center items-center
          ${open ? "visible bg-slate-300/30" : "invisible"}
        `}
        >
         
            <div
                onClick={(e) => e.stopPropagation()}
                className={`
            bg-white rounded-xl shadow-xl p-6 transition-all w-[90%] mx-auto relative
            ${sizes[size]}
            ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}
          `}
            >
                <div className="flex justify-between items-center relative">
                    <h1 className="text-3xl font-semibold">{title}</h1>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>

                    </button>
                </div>
                <div className="my-2">
                    {children}
                </div>
            </div>
        </div>
    </>

}
export default Modal
