'use client'
import React, { ReactNode, useRef, useState } from "react";
import { motion } from "motion/react";
import AnimatedButton from "@/components/ui/AnimatedButton";

type TabProps = {
    children: ReactNode;
    setPosition: React.Dispatch<React.SetStateAction<{
        left: number;
        width: number;
        opacity: number;
    }>>;
};

type CursorProps = {
    position: {
        left: number;
        width: number;
        opacity: number;
    };
};

const Tab = ({ children, setPosition }: TabProps) => {
    const ref = useRef<HTMLLIElement | null>(null);
    return (
        <li 
        ref={ref}
        onMouseEnter={() => {
            if (!ref.current) return;

            const {width} = ref.current.getBoundingClientRect();
        
            setPosition({
                width,
                opacity: 1,
                left: ref.current.offsetLeft,
            });
        }}
        className="relative z-10 inline-flex h-9 items-center cursor-pointer px-3 text-xs uppercase text-white mix-blend-difference md:px-5 md:text-base">
            {children}
        </li>   
    )
};

const SlideTabs = () => {

    const [position, setPosition] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    });
    return (
        <div className="w-full overflow-hidden">
            <ul
                onMouseLeave={() => setPosition({ left: 0, width: 0, opacity: 0 })}
                className="relative text-sm font-bold tracking-wider mx-auto flex h-11 w-full items-center justify-between rounded-full border-2 border-black bg-white p-1 sm:w-fit sm:justify-center"
            >
                <Tab setPosition={setPosition}>Home</Tab>
                <Tab setPosition={setPosition}>About</Tab>
                <Tab setPosition={setPosition}>Features</Tab>
                <Tab setPosition={setPosition}>Contact</Tab>
                <Cursor position={position}></Cursor>
            </ul>
        </div>
    )
};

const Cursor = ({ position }: CursorProps) => {
    return (
        <motion.li
            animate={position}
            className="absolute z-0 h-9 rounded-full bg-black"
        ></motion.li>
    )
};

export default function Header() {
    return (
    <header className="bg-dark-background sticky top-0 z-50 mx-auto grid grid-cols-[1fr_auto] items-center gap-3 px-2 py-3 sm:px-4 sm:py-4 md:grid-cols-[1fr_auto_1fr]"> 
        <h1 className="justify-self-start text-2xl font-bold sm:text-3xl">TeamSync</h1> 
        <div className="col-span-2 w-full md:col-span-1 md:col-start-2 md:row-start-1 md:justify-self-center"> 
            <SlideTabs /> 
        </div>
        <div className="col-start-2 row-start-1 cursor-pointer justify-self-end md:col-start-3"> 
            <AnimatedButton className="h-11 py-0 text-sm font-bold tracking-wider no-underline" href="/auth/login">Log In</AnimatedButton>
        </div>
    </header>
    )
};