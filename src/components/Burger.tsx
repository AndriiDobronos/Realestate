const Burger = ({ open }: { open: boolean }) => (
    <div className="flex flex-col justify-between w-6 h-[18px]">
        <span
            className={`block h-0.5 bg-gray-100 rounded-full transition-all duration-300 ${
                open ? "rotate-45 translate-y-[8px]" : ""
            }`}
        />
        <span
            className={`block h-0.5 bg-gray-100 rounded-full transition-all duration-300 ${
                open ? "opacity-0 scale-x-0" : "opacity-100"
            }`}
        />
        <span
            className={`block h-0.5 bg-gray-100 rounded-full transition-all duration-300 ${
                open ? "-rotate-45 -translate-y-[8px]" : ""
            }`}
        />
    </div>
);

export default Burger;
