'use client'

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function Preloader() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [complete, setComplete] = useState(false)

    useGSAP(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                // "Shutter" open effect
                gsap.to(containerRef.current, {
                    scaleY: 0,
                    transformOrigin: "top",
                    duration: 0.8,
                    ease: "expo.inOut",
                    onComplete: () => setComplete(true)
                })
            }
        })

        // Word Cycle Effect
        const words = ["CHAOS", "TO", "CLARITY"]
        const textEl = document.querySelector(".loader-word")

        words.forEach((word, i) => {
            tl.to(textEl, {
                duration: 0.3,
                opacity: 1,
                text: word,
                ease: "none",
                onStart: () => {
                    if (textEl) textEl.textContent = word
                }
            })
                .to(textEl, {
                    duration: 0.1,
                    opacity: 0, // Blink out
                    delay: 0.3
                })
        })

        // Final "SAPPIO" Reveal
        tl.to(textEl, {
            duration: 0.1,
            opacity: 1,
            color: "#D4FF00",
            scale: 1.5,
            text: "SAPPIO",
            onStart: () => {
                if (textEl) textEl.textContent = "SAPPIO"
            }
        })

        // Hold
        tl.to({}, { duration: 0.5 })

    }, { scope: containerRef })

    if (complete) return null

    return (
        <div ref={containerRef} className="fixed inset-0 z-[9999] bg-[#0E0E0E] flex flex-col items-center justify-center pointer-events-none">
            <h1 className="loader-word text-[12vw] font-black tracking-tighter text-white/10 uppercase">
                LOADING
            </h1>
        </div>
    )
}
