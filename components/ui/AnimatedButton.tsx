'use client'
import { ReactNode, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";

type AnimatedButtonProps = {
    children: ReactNode;
    href?: string;
    inertia?: boolean;
    viewTransition?: boolean;
    className?: string;
    textClassName?: string;
    fillClassName?: string;
    type?: "button" | "submit" | "reset";
    [key: string]: any;
};

const defaultClasses =
    "relative isolate inline-flex items-center justify-center cursor-pointer overflow-hidden rounded-full border-2 border-black bg-white px-3 py-1.5 text-xs uppercase text-center md:px-5 md:py-3 md:text-base";

export default function AnimatedButton({
    children,
    href,
    inertia = true,
    viewTransition = true,
    className = "",
    textClassName = "",
    fillClassName = "bg-black",
    type = "button",
    ...props
}: AnimatedButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const isExternalHref =
        typeof href === "string" && /^(https?:|mailto:|tel:)/.test(href);
    const commonProps = {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        className: `${defaultClasses} ${className}`.trim(),
        ...props,
    };

    return (
        href ? (
            inertia && !isExternalHref ? (
                <Link href={href} {...commonProps}>
                    <motion.span
                        initial={false}
                        animate={{
                            scaleX: isHovered ? 1 : 0,
                            opacity: isHovered ? 1 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        className={`absolute inset-0.75 z-0 origin-left rounded-full ${fillClassName}`}
                    />
                    <span
                        className={`relative z-10 transition-colors duration-200 ${
                            isHovered ? "text-white" : "text-black"
                        } ${textClassName}`.trim()}
                    >
                        {children}
                    </span>
                </Link>
            ) : (
                <a href={href} {...commonProps}>
                    <motion.span
                        initial={false}
                        animate={{
                            scaleX: isHovered ? 1 : 0,
                            opacity: isHovered ? 1 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        className={`absolute inset-0.75 z-0 origin-left rounded-full ${fillClassName}`}
                    />
                    <span
                        className={`relative z-10 transition-colors duration-200 ${
                            isHovered ? "text-white" : "text-black"
                        } ${textClassName}`.trim()}
                    >
                        {children}
                    </span>
                </a>
            )
        ) : (
            <button type={type} {...commonProps}>
                <motion.span
                    initial={false}
                    animate={{
                        scaleX: isHovered ? 1 : 0,
                        opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className={`absolute inset-0.75 z-0 origin-left rounded-full ${fillClassName}`}
                />
                <span
                    className={`relative z-10 transition-colors duration-200 ${
                        isHovered ? "text-white" : "text-black"
                    } ${textClassName}`.trim()}
                >
                    {children}
                </span>
            </button>
        )
    );
}
