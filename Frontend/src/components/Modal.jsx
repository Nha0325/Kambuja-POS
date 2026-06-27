
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
          fixed inset-0 z-[100] flex justify-center items-center overflow-y-auto p-3 backdrop-blur-sm transition-colors duration-300
          ${open ? "visible bg-black/60" : "invisible"}
        `}
        >
         
            <div
                onClick={(e) => e.stopPropagation()}
                className={`
            bg-white dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-4 sm:p-6 transition-all w-full max-h-[calc(100vh-2rem)] overflow-y-auto mx-auto relative
            ${sizes[size]}
            ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}
          `}
            >
                <div className="relative flex items-start justify-between gap-3">
                    <h1 className="min-w-0 text-xl font-semibold sm:text-3xl text-[#020617] dark:text-[#f8fafc]">{title}</h1>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-[#64748b] dark:text-[#a1a1aa] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>

                    </button>
                </div>
                <div className="my-2 text-[#020617] dark:text-[#f8fafc]">
                    {children}
                </div>
            </div>
        </div>
    </>

}
export default Modal
