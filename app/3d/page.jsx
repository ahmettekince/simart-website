"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { useState, useRef, useMemo } from "react";
import * as THREE from "three";

const wallMat = <meshStandardMaterial color="#f4f3ef" roughness={0.95} />;
const floorMat = <meshStandardMaterial color="#d8cfbf" roughness={0.8} metalness={0.05} />;

function Wall({ w, h, t, x, z }) {
    return <mesh position={[x, h / 2, z]}>
        <boxGeometry args={[w, h, t]} />{wallMat}</mesh>;
}

function Floor({ w, z, x, zPos, color, opacity = 0.35 }) {
    return (
        <mesh position={[x, 0.015, zPos]}>
            <boxGeometry args={[w, 0.01, z]} />
            <meshStandardMaterial color={color} opacity={opacity} transparent />
        </mesh>
    );
}

function Station() {
    return <group position={[0, 0, -4.7]}>
        <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.8, 0.2, 0.5]} /><meshStandardMaterial color="#444" metalness={0.6} roughness={0.4} /></mesh>
        <mesh position={[0, 0.3, -0.2]}><boxGeometry args={[0.7, 0.6, 0.1]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[0, 0.5, -0.14]}><sphereGeometry args={[0.03, 16, 16]} /><meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} /></mesh>
    </group>;
}

function Robot({ posRef, rotRef }) {
    const g = useRef();
    useFrame(() => {
        if (!g.current) return;
        const p = posRef.current;
        g.current.position.set(p.x, p.y, p.z);
        g.current.rotation.y = rotRef.current;
    });
    return <group ref={g}>
        <mesh><cylinderGeometry args={[0.32, 0.32, 0.45, 32]} /><meshStandardMaterial color="#2b2b2b" metalness={0.5} roughness={0.35} /></mesh>
        <mesh position={[0, 0.1, 0.25]}><boxGeometry args={[0.2, 0.1, 0.1]} /><meshStandardMaterial color="#ff3e00" emissive="#ff3e00" emissiveIntensity={2} /></mesh>
        <mesh position={[0, 0.23, 0]}><cylinderGeometry args={[0.15, 0.15, 0.02, 32]} /><meshStandardMaterial color="#00a8ff" emissive="#00a8ff" emissiveIntensity={1} /></mesh>
    </group>;
}

/* --- UTILS --- */
function sweep(xMin, xMax, zMin, zMax, fromPos = null, sw = 0.50) {
    const M = 0.41; // Güvenli marj
    const x0 = xMin + M, x1 = xMax - M;
    const z0 = zMin + M, z1 = zMax - M;
    if (x0 > x1 || z0 > z1) return [];

    const pts = [];
    if (fromPos) pts.push([fromPos[0], 0.25, fromPos[2]]);

    // --- 1. ADIM: PERİMETRE TEMİZLİĞİ (Köşeler İlk) ---
    // En yakın köşeden başlayarak tam bir tur at
    let pStartX = x0, pEndX = x1, pStartZ = z0, pEndZ = z1;
    if (fromPos) {
        if (Math.abs(fromPos[0] - x1) < Math.abs(fromPos[0] - x0)) { pStartX = x1; pEndX = x0; }
        if (Math.abs(fromPos[2] - z1) < Math.abs(fromPos[2] - z0)) { pStartZ = z1; pEndZ = z0; }

        // ERKEN DÖNÜŞ: "Gidip-gelme" (backtrack) yapmadan köşeye süzül
        // Önce köşenin derinlik (Z) hizasına git, sonra X köşesine yanaş
        pts.push([fromPos[0], 0.25, pStartZ]);
    }

    // Dikdörtgen turu (4 Köşe)
    pts.push([pStartX, 0.25, pStartZ]);
    pts.push([pEndX, 0.25, pStartZ]);
    pts.push([pEndX, 0.25, pEndZ]);
    pts.push([pStartX, 0.25, pEndZ]); // Burada bitti! Geri dönme yok.

    // --- 2. ADIM: İÇ ZİGZAG (Fill) ---
    // Kenarlar temizlendiği için içeriden süzül
    const iz0 = z0 + sw, iz1 = z1 - sw;

    if (iz0 < iz1) {
        let stepX = pStartX === x0 ? sw : -sw;
        let targetX = pStartX === x0 ? x1 : x0;

        // BAŞLANGIÇTA BOŞLUĞU KALDIR: Olduğun hattan başla
        let startX = pStartX;
        let stopX = targetX - stepX; // Karşı duvara 50cm kala dur!

        // Oda çok dar ise sadece perimetre yeterli
        if ((stepX > 0 && startX > stopX + 0.1) || (stepX < 0 && startX < stopX - 0.1)) return pts;

        let curZStart = pEndZ === z1 ? iz1 : iz0;
        let curZEnd = pEndZ === z1 ? iz0 : iz1;

        const shouldCont = (curr) => stepX > 0 ? curr <= stopX + 0.05 : curr >= stopX - 0.05;

        for (let x = startX; shouldCont(x);) {
            pts.push([x, 0.25, curZStart]);
            pts.push([x, 0.25, curZEnd]);
            [curZStart, curZEnd] = [curZEnd, curZStart];

            // Son noktaya geldiysek döngüden çık, targetX'e gitme!
            if (Math.abs(x - stopX) < 0.1) break;
            x = stepX > 0 ? Math.min(x + sw, stopX) : Math.max(x - sw, stopX);
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
        // Salon-Mutfak iki parçadan oluşuyor ama tek isimle temizlenecek
        suite.push({ name: "Salon-Mutfak-A", bounds: [[-4.9, 4.9], [-4.9, 0]], isCenter: true, displayName: "Salon-Mutfak" });
        suite.push({ name: "Salon-Mutfak-B", bounds: [[0.1, 4.9], [0, 4.9]], isCenter: true, displayName: "Salon-Mutfak" });
        suite.push({ name: "Oda", bounds: [[-4.9, -0.1], [0.1, 4.9]], doorPos: [0, 2.5], doorDir: 'x', toPos: false, corridorX: 0.6 });

        push([station], false); push([entrance], false); currentPos = entrance;
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
        suite.push({ name: "Salon", bounds: [[2.1, 6.9], [-4.9, 4.9]], doorPos: [2, 2.25], doorDir: 'x', toPos: true });

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
    } else if (type === "3+1") {
        areas.push({ name: "Salon", bounds: [[1.1, 6.9], [-4.9, 1.4]], doorPos: [1, -0.25], doorDir: 'x', toPos: true });
        areas.push({ name: "Mutfak", bounds: [[1.1, 6.9], [1.6, 4.9]], doorPos: [1, 2.3], doorDir: 'x', toPos: true });
        areas.push({ name: "Hol", bounds: [[-2.4, 0.9], [-4.9, 4.9]], doorPos: [0, 0], doorDir: 'x', isCenter: true });
        areas.push({ name: "Ebeveyn Odası", bounds: [[-6.9, -2.6], [0.6, 4.9]], doorPos: [-2.5, 2.37], doorDir: 'x', toPos: false });
        areas.push({ name: "Oda 2", bounds: [[-6.9, -2.6], [-4.9, 0.4]], doorPos: [-2.5, -2.8], doorDir: 'x', toPos: false });
    } else if (type === "3+2") {
        const suite = [];
        // Orta Koridor: Hem bir merkez alan (isCenter) hem de girişi olan bir alan (doorPos)
        suite.push({ name: "Orta Koridor", bounds: [[1, 9], [0, 2.25]], doorPos: [1, 1.1], doorDir: 'x', toPos: true, isCenter: true });
        suite.push({ name: "Ana Salon", bounds: [[1, 9], [-6, 0]], doorPos: [4, 0], doorDir: 'z', toPos: false, corridorX: 4 });
        suite.push({ name: "Mutfak-Üst", bounds: [[1, 9], [2.25, 6]], doorPos: [4, 2.25], doorDir: 'z', toPos: true, corridorX: 4 });
        suite.push({ name: "Hol", bounds: [[-4, 1], [-6, 6]], isCenter: true });
        suite.push({ name: "Ebeveyn", bounds: [[-9, -4], [2.25, 6]], doorPos: [-4, 3.12], doorDir: 'x', toPos: false, corridorX: -2 });
        suite.push({ name: "Misafir", bounds: [[-9, -4], [-1, 2.25]], doorPos: [-4, -0.12], doorDir: 'x', toPos: false, corridorX: -2 });
        suite.push({ name: "Çocuk", bounds: [[-9, -4], [-6, -1]], doorPos: [-4, -3.75], doorDir: 'x', toPos: false, corridorX: -2 });

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
            push([[4, 0.25, 1.06]]);
            push([[1, 0.25, 1.06]]);
        }
        push([[0, 0.25, 1.06]]);
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
        const sPts = sweep(...area.bounds[0], ...area.bounds[1], currentPos, 0.45);
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
function House({ type, trail, posRef, rotRef }) {
    const h = 2.7, t = 0.18;
    const is1plus1 = type === "1+1";
    const is3plus2 = type === "3+2";
    const fw = is3plus2 ? 18 : (is1plus1 ? 10 : 14);
    const fz = is3plus2 ? 12 : 10;
    return <>
        <mesh position={[0, 0.01, 0]}><boxGeometry args={[fw, 0.01, fz]} />{floorMat}</mesh>

        {/* ODALARA ÖZEL RENKLİ ZEMİN KAPLAMALARI */}
        {type === "1+1" && <>
            {/* Salon-Mutfak L-Şekli Birleşik Renk */}
            <Floor w={10} z={5} x={0} zPos={-2.5} color="#ee5253" opacity={0.35} /> {/* Üst parça */}
            <Floor w={5} z={5} x={2.5} zPos={2.5} color="#ee5253" opacity={0.35} /> {/* Sağ alt parça */}
            <Floor w={5} z={5} x={-2.5} zPos={2.5} color="#10ac84" opacity={0.35} /> {/* Oda */}
        </>}

        {type === "2+1" && <>
            <mesh position={[4.5, 0.015, 0]}><boxGeometry args={[4.8, 0.01, 9.8]} /><meshStandardMaterial color="#ee5253" opacity={0.35} transparent /></mesh>
            <mesh position={[0, 0.015, 0]}><boxGeometry args={[3.8, 0.01, 9.8]} /><meshStandardMaterial color="#b2bec3" opacity={0.35} transparent /></mesh>
            <mesh position={[-4.5, 0.015, 2.5]}><boxGeometry args={[4.8, 0.01, 4.8]} /><meshStandardMaterial color="#10ac84" opacity={0.35} transparent /></mesh>
            <mesh position={[-4.5, 0.015, -2.5]}><boxGeometry args={[4.8, 0.01, 4.8]} /><meshStandardMaterial color="#00d2d3" opacity={0.35} transparent /></mesh>
        </>}

        {type === "3+1" && <>
            <mesh position={[4, 0.015, -1.75]}><boxGeometry args={[5.8, 0.01, 6.3]} /><meshStandardMaterial color="#ee5253" opacity={0.35} transparent /></mesh>
            <mesh position={[4, 0.015, 3.25]}><boxGeometry args={[5.8, 0.01, 3.3]} /><meshStandardMaterial color="#ff9f43" opacity={0.35} transparent /></mesh>
            <mesh position={[-0.75, 0.015, 0]}><boxGeometry args={[3.3, 0.01, 9.8]} /><meshStandardMaterial color="#b2bec3" opacity={0.35} transparent /></mesh>
            <mesh position={[-4.75, 0.015, 2.75]}><boxGeometry args={[4.3, 0.01, 4.3]} /><meshStandardMaterial color="#10ac84" opacity={0.35} transparent /></mesh>
            <mesh position={[-4.75, 0.015, -2.25]}><boxGeometry args={[4.3, 0.01, 5.3]} /><meshStandardMaterial color="#00d2d3" opacity={0.35} transparent /></mesh>
        </>}

        {type === "3+2" && <>
            <mesh position={[-1.5, 0.015, 0]}><boxGeometry args={[5, 0.01, 12]} /><meshStandardMaterial color="#b2bec3" opacity={0.25} transparent /></mesh>
            <mesh position={[-6.5, 0.015, 4.12]}><boxGeometry args={[5, 0.01, 3.75]} /><meshStandardMaterial color="#5f27cd" opacity={0.35} transparent /></mesh>
            <mesh position={[-6.5, 0.015, 0.62]}><boxGeometry args={[5, 0.01, 3.25]} /><meshStandardMaterial color="#10ac84" opacity={0.35} transparent /></mesh>
            <mesh position={[-6.5, 0.015, -3.5]}><boxGeometry args={[5, 0.01, 5]} /><meshStandardMaterial color="#00d2d3" opacity={0.35} transparent /></mesh>
            <mesh position={[5, 0.015, 1.1]}><boxGeometry args={[8, 0.01, 2.25]} /><meshStandardMaterial color="#ff9f43" opacity={0.35} transparent /></mesh>
            <mesh position={[5, 0.015, -3]}><boxGeometry args={[8, 0.01, 6]} /><meshStandardMaterial color="#ee5253" opacity={0.35} transparent /></mesh>
            <mesh position={[5, 0.015, 4.12]}><boxGeometry args={[8, 0.01, 3.75]} /><meshStandardMaterial color="#ee5253" opacity={0.25} transparent /></mesh>
        </>}

        <Station />
        <Wall w={fw} h={h} t={t} x={0} z={-fz / 2} />
        <Wall w={fw} h={h} t={t} x={0} z={fz / 2} />
        <Wall w={t} h={h} t={fz} x={-fw / 2} z={0} />
        <Wall w={t} h={h} t={fz} x={fw / 2} z={0} />

        {/* ROBOTUN TEMİZLİK ROTASI (Ovalleştirilmiş Beyaz Çizgi) */}
        {trail.length > 1 && (() => {
            const curvePoints = trail.map(p => new THREE.Vector3(p[0], 0.05, p[2]));
            // Eğer yeterli nokta varsa (en az 3) ovalleştir, yoksa düz çizgi
            if (trail.length > 2) {
                const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.2);
                const points = curve.getPoints(trail.length * 4); // Daha fazla nokta ile pürüzsüzlük
                return <Line points={points} color="white" lineWidth={2} transparent opacity={0.6} />;
            } else {
                return <Line points={curvePoints} color="white" lineWidth={2} transparent opacity={0.6} />;
            }
        })()}

        {/* 1+1 ÖZEL MİMARİ */}
        {type === "1+1" && <>
            <Wall w={5} h={h} t={t} x={-2.5} z={0} />
            <Wall w={t} h={h} t={2} x={0} z={1} />
            <Wall w={t} h={h} t={2} x={0} z={4} />
        </>}

        {/* 2+1 MİMARİ DUVARLAR */}
        {type === "2+1" && <>
            <Wall w={t} h={h} t={6.25} x={2} z={-1.75} />
            <Wall w={t} h={h} t={1.75} x={2} z={4} />
            <Wall w={t} h={h} t={3.25} x={-2} z={-3.3} />
            <Wall w={t} h={h} t={1.75} x={-2} z={4} />
            <Wall w={t} h={h} t={1.5} x={-2} z={0.75} />
            <Wall w={5} h={h} t={t} x={-4.5} z={0} />
        </>}

        {/* 3+1 ÖZEL MİMARİ (Premium) */}
        {type === "3+1" && <>
            {/* Sağ taraf (Salon-Mutfak) */}
            <Wall w={6} h={h} t={t} x={4} z={1.5} />
            <Wall w={t} h={h} t={4} x={1} z={-3} />
            <Wall w={t} h={h} t={1} x={1} z={1} />
            <Wall w={t} h={h} t={1.75} x={1} z={4} />

            {/* Sol taraf (Yatak Odaları) */}
            <Wall w={t} h={h} t={1.75} x={-2.5} z={4} />
            <Wall w={t} h={h} t={3.75} x={-2.5} z={-0.25} />
            <Wall w={t} h={h} t={1.5} x={-2.5} z={-4.25} />
            <Wall w={4.5} h={h} t={t} x={-4.75} z={0.5} />
        </>}

        {/* 3+2 ÖZEL MİMARİ (Grand Mansion) */}
        {type === "3+2" && <>
            <Wall w={2} h={h} t={t} x={2} z={0} />
            <Wall w={4} h={h} t={t} x={7} z={0} />
            <Wall w={t} h={h} t={6} x={1} z={-3} />
            <Wall w={t} h={h} t={3.75} x={1} z={4} />
            <Wall w={4} h={h} t={t} x={7} z={2.25} />
            <Wall w={2} h={h} t={t} x={2} z={2.25} />
            <Wall w={t} h={h} t={2} x={-4} z={5} />
            <Wall w={t} h={h} t={1.5} x={-4} z={1.5} />
            <Wall w={t} h={h} t={2} x={-4} z={-2} />
            <Wall w={t} h={h} t={1.5} x={-4} z={-5.25} />
            <Wall w={5} h={h} t={t} x={-6.5} z={2.25} />
            <Wall w={5} h={h} t={t} x={-6.5} z={-1} />

        </>}

        <Robot posRef={posRef} rotRef={rotRef} />
    </>;
}


export default function Plan3D() {
    const [type, setType] = useState("2+1");
    const [isAuto, setIsAuto] = useState(false);
    const [trail, setTrail] = useState([]);
    const [status, setStatus] = useState("Hazır");
    const [pct, setPct] = useState(0);
    const [speed, setSpeed] = useState(3.5);

    const posRef = useRef(new THREE.Vector3(0, 0.25, -4.5));
    const rotRef = useRef(0);
    const wpIdx = useRef(0);
    const running = useRef(false);
    const lastTrail = useRef(null);

    const rooms = parseInt(type.split("+")[0]);
    const waypoints = useMemo(() => buildWaypoints(type), [type]);

    const startStop = () => {
        if (isAuto) {
            running.current = false;
            setIsAuto(false);
            setStatus("Duraklatıldı");
            return;
        }
        setTrail([]); lastTrail.current = null;
        wpIdx.current = 1; running.current = true; setIsAuto(true); setPct(0);
        setStatus("Temizlik başlıyor…");
    };

    const reset = () => {
        running.current = false; setIsAuto(false);
        setTrail([]); lastTrail.current = null;
        posRef.current.set(0, 0.25, -4.5); rotRef.current = 0;
        setStatus("Sıfırlandı"); setPct(0);
    };

    function Mover() {
        useFrame((_, dt) => {
            if (!running.current) return;
            const idx = wpIdx.current;
            if (idx >= waypoints.length) {
                running.current = false; setIsAuto(false);
                setStatus("✅ Tamamlandı!"); setPct(100); return;
            }
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
                setPct(Math.round((idx + 1) / waypoints.length * 100));
                if ((idx + 1) < waypoints.length) setStatus(`🧹 Temizleniyor… %${Math.round((idx + 1) / waypoints.length * 100)}`);
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
        <div style={{ width: "100%", height: "100vh", background: "#1a1a2e", overflow: "hidden", fontFamily: "Inter,sans-serif" }}>
            <div style={{ position: "absolute", zIndex: 10, top: 0, left: 0, right: 0, padding: "14px 24px", display: "flex", gap: 16, alignItems: "center", background: "rgba(15,15,30,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                    <label style={{ fontSize: 11, display: "block", color: "#aaa", marginBottom: 4, letterSpacing: 1 }}>EV PLANI</label>
                    <select value={type} onChange={e => { setType(e.target.value); reset(); }}
                        style={{ padding: "7px 12px", fontSize: 14, borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", cursor: "pointer" }}>
                        <option style={{ background: "#1a1a2e" }}>1+1</option>
                        <option style={{ background: "#1a1a2e" }}>2+1</option>
                        <option style={{ background: "#1a1a2e" }}>3+1</option>
                        <option style={{ background: "#1a1a2e" }}>3+2</option>
                    </select>
                </div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "8px 16px", color: "#ddd", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{status}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: 8 }}>
                        <span style={{ fontSize: 10, color: "#aaa" }}>HIZ</span>
                        <button onClick={() => setSpeed(prev => Math.max(1, prev - 1))} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,118,117,0.15)", color: "#ff7675", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>-</button>
                        <span style={{ minWidth: 20, textAlign: "center", fontWeight: "600", fontSize: 12, color: "#55efc4" }}>x{speed.toFixed(1)}</span>
                        <button onClick={() => setSpeed(prev => Math.min(15, prev + 1))} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(85,239,196,0.15)", color: "#55efc4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>+</button>
                    </div>
                </div>
                <div style={{ width: 160 }}>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                        <span>Temizlik</span><span style={{ color: "#55efc4" }}>{pct}%</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#3c81b5,#55efc4)", borderRadius: 6, transition: "width 0.4s" }} />
                    </div>
                </div>
                <button onClick={startStop} style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: isAuto ? "#fdcb6e" : "linear-gradient(135deg,#3c81b5,#55efc4)", color: isAuto ? "#2b2b2b" : "white", fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 14px rgba(60,129,181,0.4)" }}>
                    {isAuto ? "⏸ Durdur" : "⚡ Temizliği Başlat"}
                </button>
                <button onClick={reset} style={{ padding: "9px 18px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#ff7675", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>↺ Sıfırla</button>
            </div>
            <Canvas dpr={[1, 1.5]} gl={{ antialias: true }} camera={{ position: [14, 12, 14], fov: 42 }}>
                <ambientLight intensity={0.4} />
                <hemisphereLight intensity={0.6} groundColor="#d6d2c8" />
                <directionalLight position={[2, 10, 4]} intensity={1.3} />
                <House type={type} trail={trail} posRef={posRef} rotRef={rotRef} />
                <Mover />
                <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={26} />
            </Canvas>
        </div>
    );
}