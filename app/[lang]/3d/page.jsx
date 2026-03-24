"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useState, useRef, useMemo, Suspense, useEffect } from "react";
import { OrbitControls, Line, ContactShadows, Text, useTexture } from "@react-three/drei";

//components
import { ROBOTS } from "./robots";
import Robot from "./components/Robot";
import Station from "./components/Station";
import RecommendationModal from "./components/RecommendationModal";


function ForbiddenZone({ position, size }) {
    const meshRef = useRef();
    useFrame(({ clock }) => {
        if (meshRef.current) {
            const time = clock.getElapsedTime();
            meshRef.current.opacity = 0.4 + Math.sin(time * 3) * 0.2;
        }
    });

    const h = size / 2;
    const pts = [[-h, 0.01, -h], [h, 0.01, -h], [h, 0.01, h], [-h, 0.01, h], [-h, 0.01, -h]];

    return <group position={position}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
            <planeGeometry args={[size, size]} />
            <meshStandardMaterial color="#ff0000" transparent opacity={0.6} />
        </mesh>
        <Line points={pts} color="white" lineWidth={4} dashed dashScale={8} dashSize={0.6} gapSize={0.4} />
        <Text
            position={[0, 0.03, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.25}
            color="white"
            font="/fonts/gilroy/Gilroy-Bold.ttf"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.1}
        >
            YASAKLI ALAN
        </Text>
    </group>;
}

function VirtualWall({ p1, p2 }) {
    const midX = (p1[0] + p2[0]) / 2;
    const midZ = (p1[2] + p2[2]) / 2;
    return <group>
        <Line points={[p1, p2]} color="#0984e3" lineWidth={8} dashed dashScale={5} dashSize={1} gapSize={0.5} transparent opacity={0.9} />
        {/* Yazı (Çizginin biraz önünde/üstünde, çakışmayacak şekilde) */}
        <Text
            position={[midX, 0.08, midZ + 0.3]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.25}
            color="white"
            font="/fonts/gilroy/Gilroy-Bold.ttf"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.1}
        >
            SANAL DUVAR
        </Text>
    </group>;
}

function WallMaterial() {
    const tex = useTexture('/images/3d/wallpaper.jpg');
    if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 2); // Duvar boyutuna göre ayarlanabilir
    }

    return <meshStandardMaterial map={tex} roughness={0.8} metalness={0.0} />;
}
const floorMat = <meshStandardMaterial color="#d8cfbf" roughness={0.2} metalness={0.15} />;

function Wall({ w, h, t, x, z }) {
    const bbH = 0.12, bbT = 0.04;
    return <group position={[x, 0, z]}>
        <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, t]} />
            <WallMaterial />
        </mesh>
        <mesh position={[0, bbH / 2, (t / 2) + (bbT / 2)]}>
            <boxGeometry args={[w, bbH, bbT]} />
            <meshStandardMaterial color="#ccc" roughness={0.5} />
        </mesh>
        <mesh position={[0, bbH / 2, -(t / 2) - (bbT / 2)]}>
            <boxGeometry args={[w, bbH, bbT]} />
            <meshStandardMaterial color="#ccc" roughness={0.5} />
        </mesh>
    </group>;
}

function Floor({ w, z, x, zPos, color, opacity = 0.35 }) {
    return (
        <mesh position={[x, 0.015, zPos]}>
            <boxGeometry args={[w, 0.01, z]} />
            <meshStandardMaterial color={color} opacity={opacity} transparent />
        </mesh>
    );
}

function Lintel({ x, z, w, t, h, doorH = 2.15 }) {
    const wallH = h - doorH;
    return <mesh position={[x, doorH + wallH / 2, z]}>
        <boxGeometry args={[w, wallH, t]} />
        <WallMaterial />
    </mesh>;
}

function Window({ x, z, w, t, h, winH = 1.2, bottomH = 0.9, rotate = false }) {
    const topH = h - (bottomH + winH);
    return <group position={[x, 0, z]} rotation={[0, rotate ? Math.PI / 2 : 0, 0]}>
        {/* Alt Duvar */}
        <mesh position={[0, bottomH / 2, 0]}>
            <boxGeometry args={[w, bottomH, t]} />
            <WallMaterial />
        </mesh>
        {/* Üst Duvar */}
        <mesh position={[0, h - topH / 2, 0]}>
            <boxGeometry args={[w, topH, t]} />
            <WallMaterial />
        </mesh>
        {/* Kenar Çerçeveler */}
        <mesh position={[-(w / 2 - 0.05), bottomH + winH / 2, 0]}>
            <boxGeometry args={[0.1, winH, t + 0.02]} />
            <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[w / 2 - 0.05, bottomH + winH / 2, 0]}>
            <boxGeometry args={[0.1, winH, t + 0.02]} />
            <meshStandardMaterial color="#333" />
        </mesh>
        {/* Cam */}
        <mesh position={[0, bottomH + winH / 2, 0]}>
            <boxGeometry args={[w - 0.2, winH, 0.02]} />
            <meshStandardMaterial color="#87ceeb" opacity={0.4} transparent roughness={0} metalness={0.8} />
        </mesh>
    </group>;
}

/* --- UTILS --- */
function sweep(xMin, xMax, zMin, zMax, fromPos = null, sw = 0.50, exclusion = null, skipPerimeter = false, orientation = 'vertical') {
    const M = 0.41; // Güvenli marj

    // Yasaklı alan kontrolü: Robot yarıçapı kadar marj ekliyoruz
    const isForbidden = (x, z) => {
        if (!exclusion) return false;
        return x >= exclusion[0][0] - 0.2 && x <= exclusion[0][1] + 0.2 &&
            z >= exclusion[1][0] - 0.2 && z <= exclusion[1][1] + 0.2;
    };
    const x0 = xMin + M, x1 = xMax - M;
    const z0 = zMin + M, z1 = zMax - M;
    if (x0 > x1 || z0 > z1) return [];

    const pts = [];
    let pStartX = x0, pEndX = x1, pStartZ = z0, pEndZ = z1;

    if (fromPos) {
        if (Math.abs(fromPos[0] - x1) < Math.abs(fromPos[0] - x0)) { pStartX = x1; pEndX = x0; }
        if (Math.abs(fromPos[2] - z1) < Math.abs(fromPos[2] - z0)) { pStartZ = z1; pEndZ = z0; }

        pts.push([fromPos[0], 0.25, fromPos[2]]);
        // ÇAPRAZ GİREİŞİ ENGELLE: Önce X aksında köşeye hizalan (L-Entry)
        pts.push([pStartX, 0.25, fromPos[2]]);
    }

    // --- 1. ADIM: PERIMETER (Çevreleme) ---
    if (!skipPerimeter) {
        const cPoints = [
            [pStartX, pStartZ], [pEndX, pStartZ], [pEndX, pEndZ], [pStartX, pEndZ], [pStartX, pStartZ]
        ];
        cPoints.forEach(([cx, cz]) => {
            // Eğer köşe yasaklı alan içindeyse (Salon Kiler), etrafından dolan
            if (exclusion && cx >= exclusion[0][0] - 0.1 && cx <= exclusion[0][1] + 0.1 && cz >= exclusion[1][0] - 0.1 && cz <= exclusion[1][1] + 0.1) {
                if (cx === pEndX && cz === pEndZ) {
                    pts.push([pEndX, 0.25, exclusion[1][1] + 0.5]);
                    pts.push([exclusion[0][0] - 0.5, 0.25, exclusion[1][1] + 0.5]);
                    pts.push([exclusion[0][0] - 0.5, 0.25, pEndZ]);
                }
            } else {
                pts.push([cx, 0.25, cz]);
            }
        });
    }

    // --- 2. ADIM: İÇ ZİGZAG (Fill) ---
    if (orientation === 'horizontal') {
        const iz0 = z0 + sw, iz1 = z1 - sw;
        let stepZ = pStartZ === z1 ? -sw : sw;
        let targetZ = pStartZ === z1 ? z0 : z1;
        let startZ = pStartZ + stepZ;
        let stopZ = targetZ - (stepZ * 0.5);

        const ix0 = x0 + sw, ix1 = x1 - sw;
        let curXStart = pStartX === x0 ? ix0 : ix1;
        let curXEnd = pStartX === x0 ? ix1 : ix0;
        const shouldCont = (curr) => stepZ > 0 ? curr <= stopZ + 0.05 : curr >= stopZ - 0.05;

        let lastX = pStartX;
        for (let z = startZ; shouldCont(z);) {
            let cxStart = curXStart, cxEnd = curXEnd;
            // Yatayda yasaklı alan (kiler) kontrolü (0.50 tampon payı ile)
            if (exclusion && z >= exclusion[1][0] - 0.5 && z <= exclusion[1][1] + 0.5) {
                if (cxStart > exclusion[0][0]) cxStart = exclusion[0][0] - 0.5;
                if (cxEnd > exclusion[0][0]) cxEnd = exclusion[0][0] - 0.5;
            }
            if (cxStart < cxEnd || cxStart > cxEnd) {
                pts.push([lastX, 0.25, z]);
                pts.push([cxStart, 0.25, z]);
                pts.push([cxEnd, 0.25, z]);
                lastX = cxEnd;
            }
            [curXStart, curXEnd] = [curXEnd, curXStart];
            if (Math.abs(z - stopZ) < 0.1) break;
            z = stepZ > 0 ? Math.min(z + sw, stopZ) : Math.max(z - sw, stopZ);
        }
    } else {
        const iz0 = z0 + sw, iz1 = z1 - sw;
        if (iz0 < iz1) {
            let stepX = pStartX === x0 ? sw : -sw;
            let targetX = pStartX === x0 ? x1 : x0;
            let startX = pStartX + stepX;
            let stopX = targetX - (stepX * 0.5);

            if ((stepX > 0 && startX > x1 - 0.1) || (stepX < 0 && startX < x0 + 0.1)) return pts;

            let curZStart = pStartZ === z0 ? iz0 : iz1;
            let curZEnd = pStartZ === z0 ? iz1 : iz0;
            const shouldCont = (curr) => stepX > 0 ? curr <= stopX + 0.05 : curr >= stopX - 0.05;

            let lastZ = pStartZ;
            for (let x = startX; shouldCont(x);) {
                let czStart = curZStart, czEnd = curZEnd;
                if (exclusion && x >= exclusion[0][0] - 0.1 && x <= exclusion[0][1] + 0.1) {
                    if (czStart < exclusion[1][1]) czStart = exclusion[1][1] + 0.5;
                    if (czEnd < exclusion[1][1]) czEnd = exclusion[1][1] + 0.5;
                }
                if (czStart < czEnd || czStart > czEnd) {
                    pts.push([x, 0.25, lastZ]);
                    pts.push([x, 0.25, czStart]);
                    pts.push([x, 0.25, czEnd]);
                    lastZ = czEnd;
                }
                [curZStart, curZEnd] = [curZEnd, curZStart];
                if (Math.abs(x - stopX) < 0.1) break;
                x = stepX > 0 ? Math.min(x + sw, stopX) : Math.max(x - sw, stopX);
            }
        }
    }

    return pts;
}

function door(x, z, dir, toPositive) {
    const gap = 0.5; // Kapı giriş/çıkış derinliği (Güvenli Mesafe)
    if (dir === 'z') {
        const pTarget = toPositive ? z + gap : z - gap;
        return [[x, 0.25, z], [x, 0.25, pTarget]];
    } else {
        const pTarget = toPositive ? x + gap : x - gap;
        return [[x, 0.25, z], [pTarget, 0.25, z]];
    }
}

function buildWaypoints(type) {
    const all = [];
    const push = arr => arr.forEach(p => all.push(p));
    const station = [0, 0.25, -4.5];
    const entrance = [0, 0.25, -4]; // Koridor giriş noktası
    let currentPos = station;

    const areas = [];
    if (type === "1+1") {
        const suite = [];
        suite.push({ name: "Salon-Mutfak-A", bounds: [[-4.9, 4.9], [-4.9, 0]], isCenter: true, displayName: "Salon-Mutfak" });
        suite.push({ name: "Salon-Mutfak-B", bounds: [[0.1, 4.9], [0, 4.9]], isCenter: true, displayName: "Salon-Mutfak" });
        suite.push({ name: "Oda", bounds: [[-4.9, -0.1], [0.1, 4.9]], doorPos: [0, 2.5], doorDir: 'x', toPos: false, corridorX: 0.6 });

        push([station], false); currentPos = station;
        const plan = ["Salon-Mutfak-A", "Salon-Mutfak-B", "Oda"];
        plan.forEach(name => {
            const area = suite.find(a => a.name === name);
            const cX = area.corridorX ?? 0;
            if (area.doorPos) {
                push([[cX, 0.25, currentPos[2]]], false);
                push([[cX, 0.25, area.doorPos[1]]], false);
                const dPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, area.toPos);
                push(dPts, false);
                currentPos = dPts[dPts.length - 1];
            }
            const sPts = sweep(...area.bounds[0], ...area.bounds[1], currentPos, 0.50);
            push(sPts, true);
            if (sPts.length > 0) currentPos = sPts[sPts.length - 1];
            if (!area.isCenter) {
                if (area.doorDir === 'z') push([[area.doorPos[0], 0.25, currentPos[2]]], false);
                else push([[currentPos[0], 0.25, area.doorPos[1]]], false);
                const rPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, !area.toPos);
                push(rPts, false);
                push([[cX, 0.25, area.doorPos[1]]], false);
                currentPos = [cX, 0.25, area.doorPos[1]];
            }
        });
        push([station], false);
        return all;
    } else if (type === "2+1") {
        const suite = [];
        suite.push({ name: "Hol", bounds: [[-1.9, 1.9], [-4.9, 4.9]], isCenter: true });
        suite.push({ name: "Oda 1", bounds: [[-6.9, -2.1], [0.1, 4.9]], doorPos: [-2, 2.3], doorDir: 'x', toPos: false });
        suite.push({ name: "Oda 2", bounds: [[-6.9, -2.1], [-4.9, -0.1]], doorPos: [-2, -0.8], doorDir: 'x', toPos: false });
        suite.push({ name: "Salon", bounds: [[2.1, 6.9], [-2.5, 4.9]], doorPos: [2, 2.25], doorDir: 'x', toPos: true });

        const plan = ["Hol", "Oda 1", "Oda 2", "Salon"];
        push([station], false); push([entrance], false); currentPos = entrance;

        plan.forEach(name => {
            const area = suite.find(a => a.name === name);
            const cX = 0;

            if (area.doorPos) {
                push([[cX, 0.25, currentPos[2]]], false);
                push([[cX, 0.25, area.doorPos[1]]], false);
                const dPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, area.toPos);
                push(dPts, false);
                currentPos = dPts[dPts.length - 1];
            }
            const sPts = area.customPath ? area.customPath : sweep(...area.bounds[0], ...area.bounds[1], currentPos, 0.50);
            push(sPts, true);
            if (sPts.length > 0) currentPos = sPts[sPts.length - 1];

            if (!area.isCenter) {
                if (area.doorDir === 'z') push([[area.doorPos[0], 0.25, currentPos[2]]], false);
                else push([[currentPos[0], 0.25, area.doorPos[1]]], false);
                const rPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, !area.toPos);
                push(rPts, false);
                push([[cX, 0.25, area.doorPos[1]]], false);
                currentPos = [cX, 0.25, area.doorPos[1]];
            }
        });
        push([station], false);
        return all;
    } else if (type === "3+1") {
        const suite = [
            { name: "Hol", bounds: [[-2.4, 0.9], [-4.9, 4.9]], isCenter: true },
            { name: "Salon", bounds: [[1.1, 6.9], [-4.9, 1.4]], doorPos: [1, -0.25], doorDir: 'x', toPos: true, isCenter: false, orientation: 'horizontal', exclusion: [[4.6, 6.9], [-4.65, -2.35]] },
            { name: "Mutfak", bounds: [[1.1, 6.9], [1.6, 4.9]], doorPos: [1, 2.3], doorDir: 'x', toPos: true },
            { name: "Ebeveyn Odası", bounds: [[-6.9, -2.6], [0.6, 4.9]], doorPos: [-2.5, 2.37], doorDir: 'x', toPos: false },
            { name: "Oda 2", bounds: [[-6.9, -2.6], [-4.9, 0.4]], doorPos: [-2.5, -2.8], doorDir: 'x', toPos: false }
        ];

        const plan = ["Hol", "Salon", "Mutfak", "Ebeveyn Odası", "Oda 2"];
        push([station], false); push([entrance], false); currentPos = entrance;

        plan.forEach(name => {
            const area = suite.find(a => a.name === name);
            if (area.doorPos) {
                push([[0, 0.25, currentPos[2]]], false);
                push([[0, 0.25, area.doorPos[1]]], false);
                const dPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, area.toPos);
                push(dPts, false);
                currentPos = dPts[dPts.length - 1];
            }
            const sPts = sweep(...area.bounds[0], ...area.bounds[1], currentPos, 0.45, area.exclusion, area.skipPerimeter, area.orientation);
            push(sPts, true);
            if (sPts.length > 0) currentPos = sPts[sPts.length - 1];

            if (!area.isCenter) {
                if (area.doorDir === 'z') push([[area.doorPos[0], 0.25, currentPos[2]]], false);
                else push([[currentPos[0], 0.25, area.doorPos[1]]], false);
                const rPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, !area.toPos);
                push(rPts, false);
                push([[0, 0.25, area.doorPos[1]]], false);
                currentPos = [0, 0.25, area.doorPos[1]];
            }
        });
        push([station], false);
        return all;
    } else if (type === "3+2") {
        const suite = [];
        // Orta Koridor: Hem bir merkez alan (isCenter) hem de girişi olan bir alan (doorPos)
        suite.push({ name: "Orta Koridor", bounds: [[1, 9], [1, 3.25]], doorPos: [1, 2.1], doorDir: 'x', toPos: true, isCenter: true });
        suite.push({ name: "Ana Salon", bounds: [[1, 9], [-5, 1]], doorPos: [4, 1], doorDir: 'z', toPos: false, corridorX: 4 });
        suite.push({ name: "Mutfak-Üst", bounds: [[1, 9], [3.25, 7]], doorPos: [4, 3.25], doorDir: 'z', toPos: true, corridorX: 4 });
        suite.push({ name: "Hol", bounds: [[-4, 1], [-5, 7]], isCenter: true });
        suite.push({ name: "Ebeveyn", bounds: [[-9, -4], [3.25, 7]], doorPos: [-4, 4.12], doorDir: 'x', toPos: false, corridorX: -2 });
        suite.push({ name: "Misafir", bounds: [[-9, -4], [0, 3.25]], doorPos: [-4, 0.88], doorDir: 'x', toPos: false, corridorX: -2 });
        suite.push({ name: "Çocuk", bounds: [[-9, -4], [-5, 0]], doorPos: [-4, -2.75], doorDir: 'x', toPos: false, corridorX: -2 });

        const plan = ["Hol", "Ebeveyn", "Misafir", "Çocuk", "Orta Koridor", "Ana Salon", "Mutfak-Üst"];

        push([station], false); push([entrance], false); currentPos = entrance;

        plan.forEach(name => {
            const area = suite.find(a => a.name === name);
            const cX = area.corridorX ?? 0;

            // Eğer bir kapı varsa (isCenter olsa bile girişte kapı Lazım)
            if (area.doorPos) {
                // Çapraz hareketi engelle: Önce koridor aksına, sonra kapı hizasına git
                push([[cX, 0.25, currentPos[2]]]);
                push([[cX, 0.25, area.doorPos[1]]]);
                const dPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, area.toPos);
                push(dPts);
                currentPos = dPts[dPts.length - 1];
            }
            const sPts = sweep(...area.bounds[0], ...area.bounds[1], currentPos, 0.50);
            push(sPts);
            if (sPts.length > 0) currentPos = sPts[sPts.length - 1];

            // Sadece koridor olmayan (merkezi olmayan) alanlardan çıkarken koridor aksına geri dön
            if (!area.isCenter) {
                if (area.doorDir === 'z') push([[area.doorPos[0], 0.25, currentPos[2]]]);
                else push([[currentPos[0], 0.25, area.doorPos[1]]]);
                const rPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, !area.toPos);
                push(rPts);
                push([[cX, 0.25, area.doorPos[1]]]);
                currentPos = [cX, 0.25, area.doorPos[1]];
            }
        });

        if (currentPos[0] > 1) {
            push([[4, 0.25, 2.06]]);
            push([[1, 0.25, 2.06]]);
        }
        push([[0, 0.25, 2.06]]);
        push([entrance]); push([station]);
        return all;
    }

    currentPos = station;
    let pending = [...areas];
    push([station]); push([entrance]); currentPos = entrance;

    while (pending.length > 0) {
        let bestIdx = 0; let minDist = Infinity;
        pending.forEach((area, idx) => {
            const dx = area.doorPos[0] - currentPos[0], dz = area.doorPos[1] - currentPos[2];
            const d = dx * dx + dz * dz;
            if (d < minDist) { minDist = d; bestIdx = idx; }
        });
        const area = pending.splice(bestIdx, 1)[0];
        if (!area.isCenter) {
            push([[0, 0.25, currentPos[2]]]); // Added this line for consistency
            push([[0, 0.25, area.doorPos[1]]]);
            const dPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, area.toPos);
            push(dPts);
            currentPos = dPts[dPts.length - 1];
        }
        const sPts = area.customPath ? area.customPath : sweep(...area.bounds[0], ...area.bounds[1], currentPos, 0.45, area.exclusion);
        push(sPts);
        if (sPts.length > 0) currentPos = sPts[sPts.length - 1];
        if (!area.isCenter) {
            if (area.doorDir === 'z') push([[area.doorPos[0], 0.25, currentPos[2]]]);
            else push([[currentPos[0], 0.25, area.doorPos[1]]]);
            const rPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, !area.toPos);
            push(rPts);
            push([[0, 0.25, area.doorPos[1]]]);
            currentPos = [0, 0.25, area.doorPos[1]];
        }
    }
    push([[0, 0.25, currentPos[2]]]); push([station]);
    return all;
}

/* --- COMPONENTS --- */
function House({ type, trail, posRef, rotRef, recommendedRobot }) {
    const h = 2.7, t = 0.18;
    const is1plus1 = type === "1+1";
    const is3plus2 = type === "3+2";
    const fw = is3plus2 ? 18 : (is1plus1 ? 10 : 14);
    const fz = is3plus2 ? 12 : 10;
    const zOff = is3plus2 ? 1 : 0; // 3+2 planını geriye kaydır (arkadaki duvar sabit kalsın)

    return <>
        <mesh position={[0, 0.01, zOff]}><boxGeometry args={[fw, 0.01, fz]} />{floorMat}</mesh>

        {/* ODALARA ÖZEL RENKLİ ZEMİN KAPLAMALARI */}
        {type === "1+1" && <>
            {/* Salon-Mutfak L-Şekli Birleşik Renk */}
            <Floor w={10} z={5} x={0} zPos={-2.5} color="#ee5253" opacity={0.35} /> {/* Üst parça */}
            <Floor w={5} z={5} x={2.5} zPos={2.5} color="#ee5253" opacity={0.35} /> {/* Sağ alt parça */}
            <Floor w={5} z={5} x={-2.5} zPos={2.5} color="#10ac84" opacity={0.35} /> {/* Oda */}

            <Text position={[0, 0.1, -2.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                SALON-MUTFAK
            </Text>
            <group position={[-2.5, 0.1, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <Text

                    fontSize={0.5}
                    color="white"
                    letterSpacing={0.1}
                    anchorX="center"
                    anchorY="middle"
                    fontWeight={700}
                >
                    ODA
                </Text>
            </group>
        </>}

        {type === "2+1" && <>
            <mesh position={[4.5, 0.015, 0]}><boxGeometry args={[4.8, 0.01, 9.8]} /><meshStandardMaterial color="#ee5253" opacity={0.35} transparent /></mesh>

            {/* Sanal Duvar (2+1 Salonu - Daha da ileriye taşındı) */}
            <VirtualWall p1={[2.1, 0.05, -2.5]} p2={[6.9, 0.05, -2.5]} />

            <mesh position={[0, 0.015, 0]}><boxGeometry args={[3.8, 0.01, 9.8]} /><meshStandardMaterial color="#b2bec3" opacity={0.35} transparent /></mesh>
            <mesh position={[-4.5, 0.015, 2.5]}><boxGeometry args={[4.8, 0.01, 4.8]} /><meshStandardMaterial color="#10ac84" opacity={0.35} transparent /></mesh>
            <mesh position={[-4.5, 0.015, -2.5]}><boxGeometry args={[4.8, 0.01, 4.8]} /><meshStandardMaterial color="#00d2d3" opacity={0.35} transparent /></mesh>

            <Text position={[4.5, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                SALON
            </Text>
            <Text position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                HOL
            </Text>
            <Text position={[-4.5, 0.1, 2.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                ODA 1
            </Text>
            <Text position={[-4.5, 0.1, -2.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                ODA 2
            </Text>
        </>}

        {type === "3+1" && <>
            <mesh position={[4, 0.015, -1.75]}><boxGeometry args={[5.8, 0.01, 6.3]} /><meshStandardMaterial color="#ee5253" opacity={0.35} transparent /></mesh>
            {/* Yasaklı Alan (Model Zemin Üstüne Çıkartıldı: y=0.022) */}
            <ForbiddenZone position={[5.75, 0.022, -3.5]} size={2.3} />

            <mesh position={[4, 0.015, 3.25]}><boxGeometry args={[5.8, 0.01, 3.3]} /><meshStandardMaterial color="#ff9f43" opacity={0.35} transparent /></mesh>
            <mesh position={[-0.75, 0.015, 0]}><boxGeometry args={[3.3, 0.01, 9.8]} /><meshStandardMaterial color="#b2bec3" opacity={0.35} transparent /></mesh>
            <mesh position={[-4.75, 0.015, 2.75]}><boxGeometry args={[4.3, 0.01, 4.3]} /><meshStandardMaterial color="#10ac84" opacity={0.35} transparent /></mesh>
            <mesh position={[-4.75, 0.015, -2.25]}><boxGeometry args={[4.3, 0.01, 5.3]} /><meshStandardMaterial color="#00d2d3" opacity={0.35} transparent /></mesh>

            {/* Oda İsimleri (HTML Overlay - Sıfır GPU Yükü) */}
            <Text position={[4, 0.1, -1.75]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                SALON
            </Text>
            <Text position={[4, 0.1, 3.25]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                ODA 1
            </Text>
            <Text position={[-0.75, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                HOL
            </Text>
            <Text position={[-4.75, 0.1, 2.75]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                EBEVEYN ODASI
            </Text>
            <Text position={[-4.75, 0.1, -2.25]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                ODA 2
            </Text>
        </>}

        {
            type === "3+2" && <>
                <mesh position={[-1.5, 0.015, 1]}><boxGeometry args={[5, 0.01, 12]} /><meshStandardMaterial color="#b2bec3" opacity={0.25} transparent /></mesh>
                <mesh position={[-6.5, 0.015, 5.12]}><boxGeometry args={[5, 0.01, 3.75]} /><meshStandardMaterial color="#5f27cd" opacity={0.35} transparent /></mesh>
                <mesh position={[-6.5, 0.015, 1.62]}><boxGeometry args={[5, 0.01, 3.25]} /><meshStandardMaterial color="#10ac84" opacity={0.35} transparent /></mesh>
                <mesh position={[-6.5, 0.015, -2.5]}><boxGeometry args={[5, 0.01, 5]} /><meshStandardMaterial color="#00d2d3" opacity={0.35} transparent /></mesh>
                <mesh position={[5, 0.015, 2.1]}><boxGeometry args={[8, 0.01, 2.25]} /><meshStandardMaterial color="#ff9f43" opacity={0.35} transparent /></mesh>
                <mesh position={[5, 0.015, -2]}><boxGeometry args={[8, 0.01, 6]} /><meshStandardMaterial color="#ee5253" opacity={0.35} transparent /></mesh>
                <mesh position={[5, 0.015, 5.12]}><boxGeometry args={[8, 0.01, 3.75]} /><meshStandardMaterial color="#ee5253" opacity={0.25} transparent /></mesh>

                <Text position={[5, 0.1, -2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                    ANA SALON
                </Text>
                <Text position={[5, 0.1, 5.12]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                    MUTFAK
                </Text>
                <Text position={[-1.5, 0.1, 1]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                    HOL
                </Text>
                <Text position={[-6.5, 0.1, 5.12]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                    EBEVEYN ODASI
                </Text>
                <Text position={[-6.5, 0.1, 1.62]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                    MİSAFİR ODASI
                </Text>
                <Text position={[-6.5, 0.1, -2.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                    ÇOCUK ODASI
                </Text>
                <Text position={[5, 0.1, 2.1]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="white" font="/fonts/gilroy/Gilroy-Bold.ttf" anchorX="center" anchorY="middle" letterSpacing={0.1}>
                    KORİDOR
                </Text>
            </>
        }

        <Station type={recommendedRobot?.features?.station} />
        <Wall w={fw} h={h} t={t} x={0} z={(-fz / 2) + zOff} />
        {/* Dış Duvarlar (Pencere Mantığıyla 1+1 Oda Duvarı Bölünüyor) */}
        {type === "1+1" ? (
            <>
                <Wall w={fw} h={h} t={t} x={0} z={(fz / 2) + zOff} />
                <Wall w={t} h={h} t={6.5} x={-fw / 2} z={-1.75} />
                <Window x={-fw / 2} z={2.5} w={2} t={t} h={h} rotate={true} />
                <Wall w={t} h={h} t={1.5} x={-fw / 2} z={4.25} />
                <Wall w={t} h={h} t={fz} x={fw / 2} z={zOff} />
            </>
        ) : (
            <>
                <Wall w={fw} h={h} t={t} x={0} z={(fz / 2) + zOff} />
                <Wall w={t} h={h} t={fz} x={-fw / 2} z={zOff} />
                <Wall w={t} h={h} t={fz} x={fw / 2} z={zOff} />
            </>
        )}

        {/* ROBOTUN TEMİZLİK ROTASI (Ovalleştirilmiş Beyaz Çizgi) */}
        {
            trail.length > 1 && (() => {
                const curvePoints = trail.map(p => new THREE.Vector3(p[0], 0.05, p[2]));
                // Eğer yeterli nokta varsa (en az 3) ovalleştir, yoksa düz çizgi
                if (trail.length > 2) {
                    const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0); // Keskin köşeler için 0
                    const points = curve.getPoints(trail.length * 4); // Daha fazla nokta ile pürüzsüzlük
                    return <Line points={points} color="white" lineWidth={2} transparent opacity={0.6} />;
                } else {
                    return <Line points={curvePoints} color="white" lineWidth={2} transparent opacity={0.6} />;
                }
            })()
        }

        {/* 1+1 ÖZEL MİMARİ */}
        {
            type === "1+1" && <>
                <Wall w={5} h={h} t={t} x={-2.5} z={0} />
                <Wall w={t} h={h} t={2} x={0} z={1} />
                <Wall w={t} h={h} t={2} x={0} z={4} />
                <Lintel x={0} z={2.5} w={t} t={1} h={h} /> {/* Door to Oda */}

            </>
        }

        {/* 2+1 MİMARİ DUVARLAR */}
        {
            type === "2+1" && <>
                <Wall w={t} h={h} t={6.25} x={2} z={-1.75} />
                <Wall w={t} h={h} t={1.75} x={2} z={4} />
                <Lintel x={2} z={2.25} w={t} t={1.75} h={h} /> {/* Door to Salon */}

                <Wall w={t} h={h} t={3.25} x={-2} z={-3.3} />
                <Wall w={t} h={h} t={1.75} x={-2} z={4} />
                <Wall w={t} h={h} t={1.65} x={-2} z={0.75} /> {/* Wall between Oda 1 and 2 */}
                <Lintel x={-2} z={2.3} w={t} t={1.65} h={h} /> {/* Door to Oda 1 */}
                <Lintel x={-2} z={-0.9} w={t} t={1.65} h={h} /> {/* Door to Oda 2 */}
                <Wall w={5} h={h} t={t} x={-4.5} z={0} />
            </>
        }

        {/* 3+1 ÖZEL MİMARİ (Premium) */}
        {
            type === "3+1" && <>
                {/* Sağ taraf (Salon-Mutfak) */}
                <Wall w={6} h={h} t={t} x={4} z={1.5} />
                <Wall w={t} h={h} t={4} x={1} z={-3} />
                <Wall w={t} h={h} t={1} x={1} z={1} />
                <Wall w={t} h={h} t={1.75} x={1} z={4} />
                <Lintel x={1} z={-0.25} w={t} t={1.75} h={h} /> {/* Lintel Salon */}
                <Lintel x={1} z={2.3} w={t} t={1.75} h={h} /> {/* Lintel Mutfak */}

                <Wall w={t} h={h} t={2} x={-2.5} z={4} />
                <Wall w={t} h={h} t={3.30} x={-2.5} z={-0.25} />
                <Wall w={t} h={h} t={1.5} x={-2.5} z={-4.25} />
                <Lintel x={-2.5} z={1.75} w={t} t={2.5} h={h} />
                <Lintel x={-2.5} z={-2.2} w={t} t={2.75} h={h} /> {/* Lintel Oda 2 */}
                <Wall w={4.5} h={h} t={t} x={-4.75} z={0.5} />
            </>
        }

        {/* 3+2 ÖZEL MİMARİ (Grand Mansion) */}
        {
            type === "3+2" && <>
                <Wall w={2} h={h} t={t} x={2} z={1} />
                <Wall w={4} h={h} t={t} x={7} z={1} />
                <Lintel x={4} z={1} w={2} t={t} h={h} /> {/* Lintel Salon */}

                <Wall w={t} h={h} t={6} x={1} z={-2} />
                <Wall w={t} h={h} t={3.75} x={1} z={5} />
                <Lintel x={1} z={2.1} w={t} t={2.25} h={h} />

                <Wall w={4} h={h} t={t} x={7} z={3.25} />
                <Wall w={2} h={h} t={t} x={2} z={3.25} />
                <Lintel x={4} z={3.25} w={2} t={t} h={h} /> {/* Lintel Mutfak */}

                <Wall w={t} h={h} t={2} x={-4} z={6} />
                <Wall w={t} h={h} t={1.5} x={-4} z={2.5} />
                <Wall w={t} h={h} t={2} x={-4} z={-1} />
                <Wall w={t} h={h} t={1.5} x={-4} z={-4.25} />
                <Lintel x={-4} z={4.12} w={t} t={1.75} h={h} /> {/* Lintel Ebeveyn */}
                <Lintel x={-4} z={0.88} w={t} t={1.75} h={h} /> {/* Lintel Misafir */}
                <Lintel x={-4} z={-2.75} w={t} t={1.5} h={h} /> {/* Lintel Çocuk */}

                <Wall w={5} h={h} t={t} x={-6.5} z={3.25} />
                <Wall w={5} h={h} t={t} x={-6.5} z={0} />

            </>
        }

        <Robot posRef={posRef} rotRef={rotRef} id={recommendedRobot?.id} />
    </>;
}

export default function Plan3D() {
    const [type, setType] = useState("3+1");
    const [isAuto, setIsAuto] = useState(false);
    const [trail, setTrail] = useState([]);
    const [status, setStatus] = useState("Başlatmayı Bekliyor");
    const [pct, setPct] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [metrekare, setMetrekare] = useState(null);
    const [pet, setPet] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [carpet, setCarpet] = useState(null);
    const [station, setStation] = useState(null);
    const [mopPref, setMopPref] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [analysisIdx, setAnalysisIdx] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);

    const analysisMessages = useMemo(() => [
        `${type} aranıyor..`,
        `Alan: ${metrekare} m² hesaplanıyor...`,
        `Halı Yoğunluğu: ${carpet} kontrol ediliyor...`,
        `Evcil Hayvan: ${pet ? "Var" : "Yok"}...`,
        `Tercih: ${station === "toz" ? "Toz Boşaltmalı" : "Standart"}...`,
        "En uygun robot aranıyor...",
        "Model eşleştiriliyor...",
    ], [type, metrekare, carpet, pet, station]);

    // Önerilen Robotu Seçme Mantığı (Kullanıcı Kurallarına Göre Taslak)
    const recommendedRobot = useMemo(() => {
        if (!metrekare) return ROBOTS[0]; // Katya V default

        // Metrekare değerine göre sayısal eşik belirle (ör: "151-180" -> 180, "180+" -> 181)
        let mSq = 0;
        if (metrekare === "180+") mSq = 181;
        else if (metrekare.includes("-")) mSq = parseInt(metrekare.split("-")[1]);
        else mSq = parseInt(metrekare);

        // 1. Durum: Kullanıcı Paspas Konforu (Auto Mop Lifting) İstemesi VEYA İstasyonun "Hepsi Bir Arada" seçilmesi
        if (mopPref === "auto" || station === "hepsi") {
            return ROBOTS.find(r => r.id === "katya-u-akilli-robot-supurge") || ROBOTS[0];
        }

        // --- BÜYÜK EVLER (150+ m2) ---
        // 150m2 üzerindeyse Katya U yerine V+ (İstasyonlu) veya V (İstasyonsuz) daha makul.
        if (mSq > 150) {
            if (station === "toz") {
                return ROBOTS.find(r => r.id === "katya-v-plus-akilli-robot-supurge") || ROBOTS[0];
            }
            if (station === "hayir") {
                return ROBOTS.find(r => r.id === "katya-v-akilli-robot-supurge") || ROBOTS[0];
            }
            // Varsayılan koca ev robotu: V+
            return ROBOTS.find(r => r.id === "katya-v-plus-akilli-robot-supurge") || ROBOTS[0];
        }

        // 2. İSTASYON İSTEMEYENLER (HAYIR)
        if (station === "hayir") {
            // Halı Çok ise -> Katya V (Dayanıklı)
            if (carpet === "Çok") {
                return ROBOTS.find(r => r.id === "katya-v-akilli-robot-supurge") || ROBOTS[0];
            }
            // Evcil Hayvan + Düşük/Orta Halı -> Katya P
            if (pet && (carpet === "Az" || carpet === "Orta")) {
                return ROBOTS.find(r => r.id === "katya-p-akilli-robot-supurge") || ROBOTS[0];
            }
            // Diğer Durumlar -> Katya Z
            return ROBOTS.find(r => r.id === "katya-z-akilli-robot-supurge") || ROBOTS[0];
        }

        // 3. ÇOK HALI VE STANDART İSTASYON İSTEYENLER
        if (carpet === "Çok" || station === "toz") {
            return ROBOTS.find(r => r.id === "katya-v-plus-akilli-robot-supurge") || ROBOTS[0];
        }

        // 4. VARSAYILAN (Katya V)
        return ROBOTS.find(r => r.id === "katya-v-akilli-robot-supurge") || ROBOTS[0];
    }, [metrekare, pet, carpet, station, mopPref]);

    useEffect(() => {
        let timer;
        if (isAuto && isAnalyzing && !showModal) {
            timer = setInterval(() => {
                setAnalysisIdx(prev => (prev + 1) % analysisMessages.length);
            }, 800);
        }
        return () => clearInterval(timer);
    }, [isAuto, isAnalyzing, showModal, analysisMessages.length]);

    // TEMİZLİK BİTTİĞİNDE MODALI AÇ
    useEffect(() => {
        if (isCleaning && pct >= 100 && !showModal) {
            setShowModal(true);
            setIsCleaning(false);
            setStatus("Temizlik başarıyla tamamlandı!");
        }
    }, [isCleaning, pct, showModal]);

    // MOBİLDE ANALİZ BİTİNCE (1.5 SN) ROBOT HAREKET ETTİKTEN 3 SN SONRA HARİTAYA KAYDIR
    useEffect(() => {
        let scrollTimer;
        if (isMobile && isCleaning && !isAnalyzing) {
            scrollTimer = setTimeout(() => {
                const element = document.getElementById("simulation-area");
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 3000); // Temizlikten tam 3 saniye sonra
        }
        return () => clearTimeout(scrollTimer);
    }, [isMobile, isCleaning, isAnalyzing]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 992);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const posRef = useRef(new THREE.Vector3(0, 0.25, -4.5));
    const rotRef = useRef(0);
    const wpIdx = useRef(0);
    const running = useRef(false);
    const lastTrail = useRef(null);

    const rooms = type ? parseInt(type.split("+")[0]) : 0;
    const waypoints = useMemo(() => type ? buildWaypoints(type) : [], [type]);

    const startStop = () => {
        if (isAuto) {
            running.current = false;
            setIsAuto(false);
            setIsCleaning(false);
            setIsAnalyzing(false);
            setStatus("Başlatmayı Bekliyor");
            return;
        }

        // --- SÜREÇ BAŞLIYOR ---
        setTrail([]); lastTrail.current = null;
        setIsAuto(true);
        setIsAnalyzing(true); // Önce Analiz
        setIsCleaning(false); // Robot Beklemede
        setPct(0);
        setStatus("Veriler analiz ediliyor…");

        // 3.5 Saniye sonra robotu harekete geçir ve ürünü göster
        setTimeout(() => {
            setIsAnalyzing(false);
            setIsCleaning(true);
            running.current = true;
            wpIdx.current = 1;
            setStatus("En uygun robot bulundu. Temizlik başlıyor…");
        }, 1500);
    };

    const reset = () => {
        running.current = false; setIsAuto(false);
        setIsCleaning(false); setIsAnalyzing(false);
        setTrail([]); lastTrail.current = null;
        posRef.current.set(0, 0.25, -4.5); rotRef.current = 0;
        setStatus("Başlatmayı Bekliyor"); setPct(0);
        setMetrekare(null); setPet(null); setCarpet(null); setStation(null); setMopPref(null);
        setCurrentStep(1);
    };

    function Mover() {
        useFrame((_, dt) => {
            if (!running.current) return;
            const idx = wpIdx.current;
            if (idx >= waypoints.length) {
                running.current = false; setIsAuto(false);
                setStatus("Tamamlandı / Şarj Oluyor"); setPct(100); return;
            }

            // Son bacak (İstasyona dönüş) kontrolü
            const isReturning = idx === waypoints.length - 1;

            const [tx, ty, tz] = waypoints[idx];
            const cur = posRef.current;
            const tgt = new THREE.Vector3(tx, ty, tz);
            const diff = new THREE.Vector3().subVectors(tgt, cur);
            const dist = diff.length();

            if (dist > 0.02) {
                const ang = Math.atan2(diff.x, diff.z);
                let da = ang - rotRef.current;
                while (da > Math.PI) da -= 2 * Math.PI;
                while (da < -Math.PI) da += 2 * Math.PI;
                rotRef.current += da * Math.min(1, dt * 10);
            }

            const step = speed * dt;
            if (dist <= step) {
                cur.copy(tgt);
                wpIdx.current = idx + 1;

                if (isReturning) {
                    setStatus("Tamamlandı / Şarj Oluyor");
                    setPct(100);
                    setTimeout(() => setShowModal(true), 800);
                } else {
                    const progress = Math.round((idx + 1) / (waypoints.length - 1) * 100);
                    setPct(Math.min(100, progress));
                    if (idx + 1 === waypoints.length - 1) {
                        setStatus("İstasyona Dönülüyor");
                        setPct(100);
                    } else {
                        setStatus(`🧹 Temizleniyor… %${progress}`);
                    }
                }
            } else {
                diff.normalize().multiplyScalar(step);
                cur.add(diff);
            }

            const ltp = lastTrail.current;
            if (!ltp || cur.distanceTo(ltp) >= 0.10) {
                lastTrail.current = cur.clone();
                setTrail(prev => [...prev, [cur.x, cur.y, cur.z]]);
            }
        });
        return null;
    }

    return (
        <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row", background: "#fdfdfd", color: "#2d3436", fontFamily: "'Gilroy-Bold', sans-serif", overflow: isMobile ? "auto" : "hidden" }}>

            <style>{`
                @keyframes pulseGlow {
                    0% { border-color: #e0e0e0; box-shadow: 0 0 0px rgba(60, 129, 181, 0); }
                    50% { border-color: #3c81b5; box-shadow: 0 0 12px rgba(60, 129, 181, 0.4); }
                    100% { border-color: #e0e0e0; box-shadow: 0 0 0px rgba(60, 129, 181, 0); }
                }
                .step-enter { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                @keyframes slideUpFade {
                    0% { opacity: 0; transform: translateY(20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-20px); }
                }
                .analysis-text { animation: slideUpFade 2.5s infinite; }
            `}</style>
            {/* ÜST/SOL PANEL - KURUMSAL SORU ALANI */}
            <div style={{
                width: isMobile ? "100%" : "420px",
                height: isMobile ? "auto" : "100%",
                background: "#ffffff",
                borderRight: isMobile ? "none" : "1px solid #eee",
                borderBottom: isMobile ? "1px solid #eee" : "none",
                display: "flex",
                flexDirection: "column",
                padding: isMobile ? "20px" : "50px 40px",
                zIndex: 10,
                boxShadow: "10px 0 30px rgba(0,0,0,0.02)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h1 style={{ fontSize: isMobile ? "20px" : "26px", fontWeight: "800", margin: 0, lineHeight: "1.3", color: "#1a1a1a" }}>
                        Size Uygun Robot Süpürgeyi Seçelim
                    </h1>
                    <button
                        onClick={reset}
                        style={{ background: "none", border: "none", color: "#636e72", cursor: "pointer", fontWeight: "700", fontSize: "13px", padding: "5px 10px", borderRadius: "5px", border: "1px solid #eee" }}
                    >
                        ↻
                    </button>
                </div>

                {/* ADIM GÖSTERGESİ */}
                {!isAuto && (
                    <div style={{ display: "flex", gap: "5px", marginBottom: "30px" }}>
                        {[1, 2, 3, 4, 5, 6].map(s => (
                            <div key={s} style={{ flex: 1, height: "4px", background: s <= currentStep ? "#3c81b5" : "#eee", borderRadius: "2px", transition: "all 0.3s ease" }} />
                        ))}
                    </div>
                )}

                {isAuto ? (
                    <div className="step-enter">
                        <div>
                            {/* ANALİZ EDİLİYOR TEXT (Dinamik) */}
                            {isAnalyzing && (
                                <div style={{
                                    marginTop: "25px",
                                    padding: "20px",
                                    background: "#f1f2f6",
                                    borderRadius: "12px",
                                    border: "1px solid #3c81b5",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "15px",
                                    boxShadow: "0 5px 15px rgba(60, 129, 181, 0.1)"
                                }}>
                                    <div style={{ height: "30px", overflow: "hidden" }}>
                                        <div key={analysisIdx} className="analysis-text" style={{ fontSize: "13px", fontWeight: "600", color: "#2f3542" }}>
                                            {analysisMessages[analysisIdx]}
                                        </div>
                                    </div>
                                    <div style={{ height: "4px", background: "#eee", borderRadius: "2px", overflow: "hidden" }}>
                                        <div style={{ width: "100%", height: "100%", background: "#3c81b5", animation: "loadingBar 1.5s linear forwards" }} />
                                    </div>
                                    <style>{`
                                        @keyframes loadingBar { from { width: 0%; } to { width: 100%; } }
                                    `}</style>
                                </div>
                            )}

                            {/* ÖNERİLEN ÜRÜN ALANI (Analiz Bittikten Sonra) */}
                            {/* ÖNERİLEN ÜRÜN ALANI (Analiz Bittikten Sonra) */}
                            {(!isAnalyzing && isCleaning) && (
                                <div className="step-enter" style={{ marginTop: "30px" }}>
                                    <div style={{
                                        background: "#fff",
                                        borderRadius: "15px",
                                        padding: "10px",
                                        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                                        border: "1px solid #eee",
                                        textAlign: "center"
                                    }}>
                                        <div style={{
                                            width: "100%",
                                            height: "240px",
                                            background: "#fff",
                                            borderRadius: "10px",
                                            marginBottom: "15px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            overflow: "hidden",
                                        }}>
                                            <img src={recommendedRobot.image} alt={recommendedRobot.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                        </div>

                                        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>{recommendedRobot.name}</h3>
                                        <p style={{ fontSize: "12px", color: "#747d8c" }}>Seçimlerinize en uygun modelimiz.</p>

                                        <div style={{ background: "#f1f2f6", padding: "10px", borderRadius: "10px", marginBottom: "15px" }}>
                                            <p style={{ fontSize: "18px", color: "#3c81b5", margin: 0, fontWeight: "900", letterSpacing: "1px" }}>{recommendedRobot.couponCode}</p>
                                        </div>

                                        <button
                                            onClick={() => window.open(recommendedRobot.link, "_blank")}
                                            style={{
                                                width: "100%",
                                                padding: "14px",
                                                background: "#3c81b5",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "10px",
                                                fontWeight: "800",
                                                cursor: "pointer",
                                                boxShadow: "0 5px 15px rgba(60,129,181,0.2)"
                                            }}
                                        >
                                            Ürünü İncele
                                        </button>
                                    </div>

                                    {/* BÜYÜK SEÇİM ÖZETİ (FOTOĞRAF 1 TASARIMI) - KARTIN ALTINDA */}
                                    <div style={{ marginTop: "25px", paddingTop: "0px" }}>
                                        <div style={{ fontSize: "14px", fontWeight: "800", color: "#3c81b5", textTransform: "uppercase", marginBottom: "15px", letterSpacing: "1px" }}>Seçim Özetiniz</div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                            <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "12px", border: "1px solid #f1f2f6" }}>
                                                <div style={{ fontSize: "10px", color: "#b2bec3", fontWeight: "700", marginBottom: "5px" }}>ALAN</div>
                                                <div style={{ fontSize: "14px", color: "#2d3436", fontWeight: "800" }}>{metrekare ? `${metrekare} m²` : "-"}</div>
                                            </div>
                                            <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "12px", border: "1px solid #f1f2f6" }}>
                                                <div style={{ fontSize: "10px", color: "#b2bec3", fontWeight: "700", marginBottom: "5px" }}>EVCİL HAYVAN</div>
                                                <div style={{ fontSize: "14px", color: "#2d3436", fontWeight: "800" }}>{pet === null ? "-" : (pet ? "Var" : "Yok")}</div>
                                            </div>
                                            <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "12px", border: "1px solid #f1f2f6" }}>
                                                <div style={{ fontSize: "10px", color: "#b2bec3", fontWeight: "700", marginBottom: "5px" }}>HALI YOĞUNLUĞU</div>
                                                <div style={{ fontSize: "14px", color: "#2d3436", fontWeight: "800" }}>{carpet || "-"}</div>
                                            </div>
                                            <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "12px", border: "1px solid #f1f2f6" }}>
                                                <div style={{ fontSize: "10px", color: "#b2bec3", fontWeight: "700", marginBottom: "5px" }}>İSTASYON</div>
                                                <div style={{ fontSize: "14px", color: "#2d3436", fontWeight: "800" }}>{station ? (station === "toz" ? "Toz Boşaltmalı" : station === "hepsi" ? "Tam İstasyon" : "İstenmiyor") : "-"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                ) : (
                    <>
                        {/* SORU 1: EV TİPİ */}
                        {currentStep === 1 && (
                            <div className="step-enter">
                                <p style={{ fontSize: isMobile ? "12px" : "14px", color: "#636e72", marginBottom: "15px", fontWeight: "700" }}>Eviniz kaç odalı?</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {["1+1", "2+1", "3+1", "3+2"].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => { setType(t); setCurrentStep(2); }}
                                            style={{
                                                flex: "1 1 calc(50% - 10px)",
                                                padding: "16px",
                                                borderRadius: "12px",
                                                border: type === t ? "2.5px solid #3c81b5" : "1px solid #e0e0e0",
                                                background: type === t ? "#3c81b5" : "#fff",
                                                color: type === t ? "#fff" : "#2d3436",
                                                cursor: "pointer",
                                                fontWeight: "800",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SORU 2: METREKARE */}
                        {currentStep === 2 && (
                            <div className="step-enter">
                                <p style={{ fontSize: isMobile ? "12px" : "14px", color: "#636e72", marginBottom: "15px", fontWeight: "700" }}>Eviniz Kaç Metrekare?</p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    {["0-60", "61-90", "91-120", "121-150", "151-180", "180+"].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => { setMetrekare(m); setCurrentStep(3); }}
                                            style={{
                                                padding: "16px",
                                                borderRadius: "10px",
                                                border: metrekare === m ? "2.5px solid #3c81b5" : "1px solid #e0e0e0",
                                                background: metrekare === m ? "#3c81b5" : "#fff",
                                                color: metrekare === m ? "#fff" : "#2d3436",
                                                fontWeight: "800",
                                                cursor: "pointer",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            {m} m²
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SORU 3: HALI YOĞUNLUĞU */}
                        {currentStep === 3 && (
                            <div className="step-enter">
                                <p style={{ fontSize: isMobile ? "12px" : "14px", color: "#636e72", marginBottom: "15px", fontWeight: "700" }}>Evinizdeki Halı Yoğunluğu Ne Kadar?</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {[
                                        { id: "Az", label: "Az", desc: "Çoğunlukla parke veya fayans." },
                                        { id: "Orta", label: "Orta", desc: "Küçük ve ince halılarım var. Parke veya fayans alanım daha çok" },
                                        { id: "Çok", label: "Yoğun", desc: "Parke veya fayans alanım az, halı alanım daha çok" }
                                    ].map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => { setCarpet(c.id); setCurrentStep(4); }}
                                            style={{
                                                width: "100%",
                                                padding: "16px",
                                                borderRadius: "12px",
                                                border: carpet === c.id ? "2.5px solid #3c81b5" : "1px solid #e0e0e0",
                                                background: carpet === c.id ? "#3c81b5" : "#fff",
                                                color: carpet === c.id ? "#fff" : "#2d3436",
                                                textAlign: "left",
                                                cursor: "pointer",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            <div style={{ fontWeight: "800", fontSize: "15px" }}>{c.label}</div>
                                            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>{c.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SORU 4: EVCİL HAYVAN */}
                        {currentStep === 4 && (
                            <div className="step-enter">
                                <p style={{ fontSize: isMobile ? "12px" : "14px", color: "#636e72", marginBottom: "15px", fontWeight: "700" }}>Evcil Hayvanınız Var mı?</p>
                                <div style={{ display: "flex", gap: "12px" }}>
                                    {[
                                        { val: true, label: "Evet", icon: "🐾" },
                                        { val: false, label: "Hayır", icon: "❌" }
                                    ].map(v => (
                                        <button
                                            key={v.val.toString()}
                                            onClick={() => {
                                                setPet(v.val);
                                                setCurrentStep(5);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: "30px 20px",
                                                borderRadius: "15px",
                                                border: pet === v.val ? "2.5px solid #3c81b5" : "1px solid #e0e0e0",
                                                background: pet === v.val ? "#3c81b5" : "#fff",
                                                color: pet === v.val ? "#fff" : "#2d3436",
                                                cursor: "pointer",
                                                fontWeight: "800",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "10px",
                                                alignItems: "center",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            <span style={{ fontSize: "24px" }}>{v.icon}</span>
                                            <span>{v.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SORU 5: İSTASYON (TOZ TOPLAMA ÜNİTESİ) */}
                        {currentStep === 5 && (
                            <div className="step-enter">
                                <p style={{ fontSize: isMobile ? "12px" : "14px", color: "#636e72", marginBottom: "5px", fontWeight: "700" }}>Toz Toplama Ünitesi İstiyor musunuz?</p>
                                <p style={{ fontSize: "12px", color: "#95a5a6", marginBottom: "20px" }}>İstasyonlu modeller toz haznesini otomatik boşaltır. </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {[
                                        { id: "hepsi", label: "Toz Boşaltsın + Su Yenilesin", desc: "Toz boşaltma ile birlikte otomatik su değişimi ve paspas yıkama servisi sunar." },
                                        { id: "toz", label: "Otomatik Toz Boşaltsın", desc: "Toz haznesini otomatik boşaltır." },
                                        { id: "hayir", label: "İstasyon Yok", desc: "Sadece şarj ünitesi içerir. Su tankı ve toz haznesini manuel olarak temizlemek gerekir." }
                                    ].map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                setStation(s.id);
                                                if (s.id === "toz") {
                                                    setCurrentStep(6);
                                                } else {
                                                    startStop();
                                                }
                                            }}
                                            style={{
                                                width: "100%",
                                                padding: "16px",
                                                borderRadius: "12px",
                                                border: station === s.id ? "2.5px solid #3c81b5" : "1px solid #e0e0e0",
                                                background: station === s.id ? "#3c81b5" : "#f8f9fa",
                                                color: station === s.id ? "#fff" : "#2d3436",
                                                textAlign: "left",
                                                cursor: "pointer",
                                                transition: "all 0.2s ease",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "4px"
                                            }}
                                        >
                                            <div style={{ fontWeight: "800", fontSize: "15px" }}>{s.label}</div>
                                            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>{s.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SORU 6: PASPAS KONFORU */}
                        {currentStep === 6 && (
                            <div className="step-enter">
                                <p style={{ fontSize: isMobile ? "12px" : "14px", color: "#636e72", marginBottom: "5px", fontWeight: "700" }}>Paspas Konforu Sizin İçin Ne Kadar Önemli?</p>
                                <p style={{ fontSize: "11px", color: "#95a5a6", marginBottom: "20px" }}>Bazı modeller halıyı tanır ve paspasını otomatik kaldırır.</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {[
                                        { id: "manual", label: "Manuel Yönetim", desc: "Halı gibi alanları uygulama üzerinden yasaklı alan veya sanal duvar oluşturarak yönetebilirim" },
                                        { id: "auto", label: "Otomatik Paspas Kaldırma", desc: "Halı zeminlerde paspasını otomatik kaldırır. Halıda leke oluşması ihtimalinin tamamen önüne geçer." }

                                    ].map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => {
                                                setMopPref(m.id);
                                                startStop();
                                            }}
                                            style={{
                                                width: "100%",
                                                padding: "16px",
                                                borderRadius: "12px",
                                                border: mopPref === m.id ? "2.5px solid #3c81b5" : "1px solid #e0e0e0",
                                                background: mopPref === m.id ? "#3c81b5" : "#f8f9fa",
                                                color: mopPref === m.id ? "#fff" : "#2d3436",
                                                textAlign: "left",
                                                cursor: "pointer",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            <div style={{ fontWeight: "800", fontSize: "15px" }}>{m.label}</div>
                                            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>{m.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ALT/SAĞ PANEL - 3D SAHNE */}
            <div id="simulation-area" style={{ flex: 1, position: "relative", background: "#f5f6fa", height: isMobile ? "500px" : "auto", minHeight: isMobile ? "500px" : "auto" }}>
                <Canvas dpr={[1, 1.5]} gl={{ antialias: true }} camera={{ position: [-8.53, 24.48, 15.09], fov: isMobile ? 50 : 38 }}>
                    <ambientLight intensity={0.7} />
                    <hemisphereLight intensity={0.5} groundColor="#f5f6fa" />
                    <directionalLight position={[10, 15, 10]} intensity={1.5} />
                    <ContactShadows position={[0, 0.01, 0]} opacity={0.2} scale={30} blur={2.5} far={4} resolution={128} />
                    <Suspense fallback={null}>
                        {type && <House type={type} trail={trail} posRef={posRef} rotRef={rotRef} recommendedRobot={recommendedRobot} />}
                    </Suspense>
                    <Mover />
                    <OrbitControls
                        enablePan={false}
                        maxPolarAngle={Math.PI / 3}
                        minDistance={8}
                        maxDistance={33}
                        makeDefault
                    />
                </Canvas>

                {/* DURUM GÖSTERGESİ */}
                <div style={{ position: "absolute", top: isMobile ? "15px" : "30px", left: isMobile ? "15px" : "30px", padding: "8px 14px", background: "#fff", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #eee" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: isAuto ? "#2ed573" : "#ff4757" }} />
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#2f3542" }}>{status.toUpperCase()}</span>
                </div>


                {/* HIZ AYARI */}
                <div style={{ position: "absolute", bottom: isMobile ? "15px" : "30px", right: isMobile ? "15px" : "30px", display: "flex", alignItems: "center", gap: "10px", background: "#fff", padding: "8px 12px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
                    <span style={{ fontSize: "9px", color: "#747d8c", fontWeight: "800" }}>HIZ</span>
                    <button onClick={() => setSpeed(prev => Math.max(1, prev - 1))} style={{ width: "22px", height: "22px", border: "1px solid #eee", background: "#f8f9fa", borderRadius: "6px", cursor: "pointer" }}>-</button>
                    <span style={{ color: "#3c81b5", fontWeight: "900", minWidth: "25px", textAlign: "center", fontSize: "12px" }}>x{speed.toFixed(1)}</span>
                    <button onClick={() => setSpeed(prev => Math.min(15, prev + 1))} style={{ width: "22px", height: "22px", border: "1px solid #eee", background: "#f8f9fa", borderRadius: "6px", cursor: "pointer" }}>+</button>
                </div>
            </div>

            {/* PRODUCT RECOMMENDATION MODAL (Refactored to separate component) */}
            <RecommendationModal
                showModal={showModal}
                setShowModal={setShowModal}
                recommendedRobot={recommendedRobot}
                onReset={reset}
            />
        </div>
    );
}
