import React, { useState } from "react";

const Burger = ({ open }: { open: boolean }) => (
    <div className="flex flex-col justify-between w-6 h-5">
    <span
        className={`h-1 bg-gray-100 rounded transition-transform duration-300 ${
            open ? "rotate-45 translate-y-2" : ""
        }`}
    />
        <span
            className={`h-1 bg-gray-100 rounded transition-opacity duration-300 ${
                open ? "opacity-0" : "opacity-100"
            }`}
        />
        <span
            className={`h-1 bg-gray-100 rounded transition-transform duration-300 ${
                open ? "-rotate-45 -translate-y-2" : ""
            }`}
        />
    </div>
);

export default Burger;
