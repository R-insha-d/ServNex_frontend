import React, { useEffect } from "react";
import "./CustomCursor.css";

const CustomCursor = () => {
    useEffect(() => {
        const cursor = document.getElementById("cursor");

        let mouseX = window.innerWidth / 1;
        let mouseY = window.innerHeight / 1;

        let currentX = mouseX;
        let currentY = mouseY;

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        window.addEventListener("mousemove", handleMouseMove);

        function animate() {
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;

            if (cursor) {
                cursor.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
            }

            requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return <div id="cursor" className="cursor-circle"></div>;
};

export default CustomCursor;