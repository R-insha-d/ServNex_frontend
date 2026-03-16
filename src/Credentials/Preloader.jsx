import React, { useEffect, useRef } from 'react';

/**
 * Preloader component with a premium, smooth canvas animation.
 * Features:
 * - Glassmorphism UI cards spreading and merging.
 * - Liquid blob reveal with breathing effect.
 * - High-DPI support and responsive scaling.
 * - Elegant easing functions for natural movement.
 */
const Preloader = () => {
    const canvasRef = useRef(null);
    const wrapRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const wrap = wrapRef.current;
        let SIZE, CX, CY;

        const resize = () => {
            const s = wrap.getBoundingClientRect().width || window.innerWidth;
            const h = wrap.getBoundingClientRect().height || window.innerHeight;
            const minS = Math.min(s, h, 560);
            
            canvas.width = minS * window.devicePixelRatio;
            canvas.height = minS * window.devicePixelRatio;
            canvas.style.width = minS + 'px';
            canvas.style.height = minS + 'px';
            
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            SIZE = minS;
            CX = minS / 2;
            CY = minS / 2;
        };

        window.addEventListener('resize', resize);
        resize();

        const E = {
            outExpo: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
            inExpo: t => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
            inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
            outBack: t => {
                const c = 2.5;
                return 1 + c * Math.pow(t - 1, 3) + (c - 1) * Math.pow(t - 1, 2);
            },
            inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
            outQuart: t => 1 - Math.pow(1 - t, 4),
            inOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
        };

        const lerp = (a, b, t) => a + (b - a) * t;
        const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
        const prog = (s, d, n) => clamp((n - s) / d, 0, 1);

        const SVC = [
            { emoji: '🏨', label: 'Hotel' },
            { emoji: '🍽️', label: 'Restaurant' },
            { emoji: '✂️', label: 'Salon' },
            { emoji: '🏠', label: 'Home' },
            { emoji: '🏥', label: 'Health' },
            { emoji: '🚗', label: 'Transport' },
        ];
        const N = SVC.length;

        // Timings adjusted for a premium ~4s experience
        const SPREAD_DUR = 600;
        const ORBIT_END = 1800;
        const MERGE_DUR = 1000;
        const REVEAL_START = ORBIT_END + MERGE_DUR;
        const REVEAL_DUR = 1200;
        const HOLD_START = REVEAL_START + REVEAL_DUR;

        const DOTS = Array.from({ length: 40 }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: 0.5 + Math.random() * 1.5,
            a: 0.1 + Math.random() * 0.2,
            ph: Math.random() * Math.PI * 2,
        }));

        const rr = (x, y, w, h, r) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, h + y - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        };

        const drawCard = (x, y, sz, alpha, emoji, label, labelA) => {
            if (alpha < 0.01) return;
            ctx.save();
            ctx.globalAlpha = alpha;

            // Soft outer shadow for depth
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 15 * alpha;
            ctx.shadowOffsetY = 4 * alpha;

            rr(x - sz / 2, y - sz / 2, sz, sz, sz * 0.25);
            
            const bg = ctx.createLinearGradient(x - sz / 2, y - sz / 2, x + sz / 2, y + sz / 2);
            bg.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
            bg.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
            ctx.fillStyle = bg;
            ctx.fill();

            // Border
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.font = `${sz * 0.45}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, x, labelA > 0.01 ? y - sz * 0.08 : y);

            if (labelA > 0.01) {
                ctx.globalAlpha = alpha * labelA;
                ctx.font = `600 ${sz * 0.16}px system-ui, -apple-system, sans-serif`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                ctx.fillText(label.toUpperCase(), x, y + sz * 0.32);
            }
            ctx.restore();
        };

        let blobT = 0;
        const H = [
            { f: 2, a: 0.10, p: 0 },
            { f: 3, a: 0.07, p: 1.1 },
            { f: 4, a: 0.05, p: 2.3 },
            { f: 5, a: 0.03, p: 0.7 },
            { f: 7, a: 0.02, p: 1.8 },
        ];

        const blobRadius = (angle) => {
            let r = 1;
            H.forEach(h => {
                r += h.a * Math.sin(h.f * angle + blobT * h.f * 0.15 + h.p);
            });
            return r;
        };

        const drawBlob = (cx, cy, R, alpha) => {
            if (alpha < 0.01) return;
            const K = 72;
            const pts = [];
            for (let i = 0; i < K; i++) {
                const a = (i / K) * Math.PI * 2 - Math.PI / 2;
                const r = R * blobRadius(a);
                pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
            }

            const bPath = () => {
                ctx.beginPath();
                for (let i = 0; i < K; i++) {
                    const p0 = pts[(i - 1 + K) % K], p1 = pts[i], p2 = pts[(i + 1) % K], p3 = pts[(i + 2) % K];
                    const cp1x = p1[0] + (p2[0] - p0[0]) / 6, cp1y = p1[1] + (p2[1] - p0[1]) / 6;
                    const cp2x = p2[0] - (p3[0] - p1[0]) / 6, cp2y = p2[1] - (p3[1] - p1[1]) / 6;
                    i === 0 ? ctx.moveTo(p1[0], p1[1]) : ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
                }
                ctx.closePath();
            };

            ctx.save();
            // Outer glow
            bPath();
            const og = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.6);
            og.addColorStop(0, 'rgba(255, 255, 255, 0)');
            og.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.12})`);
            og.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = og;
            ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.3})`;
            ctx.shadowBlur = R * 0.8;
            ctx.fill();

            // Main body
            bPath();
            const fg = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R * 1.1);
            fg.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.4})`);
            fg.addColorStop(0.3, `rgba(168, 85, 247, ${alpha})`); 
            fg.addColorStop(0.7, `rgba(126, 34, 206, ${alpha})`); 
            fg.addColorStop(1, `rgba(88, 28, 135, ${alpha})`);   
            ctx.fillStyle = fg;
            ctx.shadowBlur = 0;
            ctx.fill();

            // Highlighting
            ctx.beginPath();
            ctx.arc(cx - R * 0.15, cy - R * 0.2, R * 0.3, 0, Math.PI * 2);
            const hl = ctx.createRadialGradient(cx - R * 0.15, cy - R * 0.2, 0, cx - R * 0.15, cy - R * 0.2, R * 0.3);
            hl.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.35})`);
            hl.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = hl;
            ctx.fill();
            ctx.restore();
        };

        const drawFinalText = (cx, cy, alpha, scale) => {
            if (alpha < 0.01) return;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);
            const fs = SIZE * 0.13;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetY = 5;

            ctx.font = `900 ${fs}px "Inter", "system-ui", sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.letterSpacing = '0.05em';
            ctx.fillText('SERVNEX', 0, -fs * 0.15);

            ctx.shadowBlur = 0;
            ctx.globalAlpha = alpha * 0.85;
            ctx.font = `300 ${fs * 0.22}px "Inter", "system-ui", sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.letterSpacing = '0.25em';
            ctx.fillText('ALL IN ONE SERVICE', 0, fs * 0.75);
            ctx.restore();
        };

        let t0 = null;
        let dashOff = 0;
        let spinAngle = 0;
        let lastEl = 0;
        let animationFrameId;

        const frame = (now) => {
            if (!t0) t0 = now;
            const el = Math.min(now - t0, HOLD_START + 100);
            const dt = el - lastEl;
            lastEl = el;
            
            blobT += 0.012;
            dashOff -= 0.25;

            ctx.fillStyle = '#9333ea';
            ctx.fillRect(0, 0, SIZE, SIZE);

            DOTS.forEach(s => {
                ctx.save();
                ctx.globalAlpha = s.a * (0.4 + 0.6 * Math.sin(now / 2000 + s.ph));
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.beginPath();
                ctx.arc(s.x * SIZE, s.y * SIZE, s.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            const spreadP = E.outBack(clamp(el / SPREAD_DUR, 0, 1));
            const mergeP = prog(ORBIT_END, MERGE_DUR, el);
            const mergeE = E.inOutQuart(mergeP);

            const BASE_SPEED = 0.08;
            let speed = BASE_SPEED;
            if (el >= ORBIT_END) {
                const dp = clamp((el - ORBIT_END) / (MERGE_DUR * 0.8), 0, 1);
                speed = BASE_SPEED * (1 - E.inOutQuart(dp));
            }
            spinAngle += speed * Math.max(dt, 0);

            const ringA = spreadP * (1 - E.outExpo(clamp(mergeP * 2.5, 0, 1)));
            if (ringA > 0.01) {
                ctx.save();
                ctx.globalAlpha = ringA * 0.4;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([8, 12]);
                ctx.lineDashOffset = dashOff;
                ctx.beginPath();
                ctx.arc(CX, CY, SIZE * 0.32, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            const orbitR = SIZE * 0.32;
            const iconSz = SIZE * 0.12;
            SVC.forEach((s, i) => {
                const base = (i / N) * Math.PI * 2 - Math.PI / 2;
                const ang = base + (spinAngle * Math.PI / 180);
                const curR = orbitR * spreadP;
                const ix = lerp(CX + curR * Math.cos(ang), CX, mergeE);
                const iy = lerp(CY + curR * Math.sin(ang), CY, mergeE);
                const iAlpha = spreadP * (1 - E.outExpo(clamp((mergeP - 0.7) / 0.3, 0, 1)));
                const iScale = lerp(1, 0, E.inExpo(clamp((mergeP - 0.6) / 0.4, 0, 1)));
                const labelA = mergeP > 0 ? 0 : clamp((el / SPREAD_DUR - 0.4) * 2, 0, 1);
                
                ctx.save();
                ctx.translate(ix, iy);
                ctx.scale(iScale, iScale);
                ctx.translate(-ix, -iy);
                drawCard(ix, iy, iconSz, iAlpha, s.emoji, s.label, labelA);
                ctx.restore();
            });

            const blobP = prog(REVEAL_START, REVEAL_DUR, el);
            const blobE = E.outQuart(clamp(blobP * 1.15, 0, 1));
            const blobA = E.outQuart(clamp(blobP * 1.8, 0, 1));
            const textA = E.outQuart(clamp((blobP - 0.22) * 1.5, 0, 1));
            const breathing = blobP >= 1 ? 1 + 0.02 * Math.sin(now * 0.0015) : 1;

            if (blobP > 0) {
                drawBlob(CX, CY, SIZE * 0.28 * blobE * breathing, blobA);
                drawFinalText(CX, CY, textA, 0.75 + 0.25 * blobE);
            }

            animationFrameId = requestAnimationFrame(frame);
        };

        animationFrameId = requestAnimationFrame(frame);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div 
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: '#9333ea',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                cursor: 'none'
            }}
        >
            <div 
                ref={wrapRef}
                style={{
                    width: '90vmin',
                    height: '90vmin',
                    maxWidth: '560px',
                    maxHeight: '560px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <canvas 
                    ref={canvasRef}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '100%'
                    }}
                />
            </div>
        </div>
    );
};

export default Preloader;