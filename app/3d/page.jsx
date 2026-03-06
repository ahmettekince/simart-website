"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, ContactShadows, Html } from "@react-three/drei";
import { useState, useRef, useMemo } from "react";
import * as THREE from "three";

const wallMat = <meshStandardMaterial color="#f4f3ef" roughness={0.6} metalness={0.1} />;
const floorMat = <meshStandardMaterial color="#d8cfbf" roughness={0.2} metalness={0.15} />;

function Wall({ w, h, t, x, z }) {
    const bbH = 0.12, bbT = 0.04;
    return <group position={[x, 0, z]}>
        <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, t]} />{wallMat}
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

function Station() {
    return <group position={[0, 0, -4.7]}>
        {/* TABAN PLAKASI (Z-Fighting Fix: Zeminden hafif yukarıda) */}
        <mesh position={[0, 0.03, 0.3]}>
            <boxGeometry args={[0.8, 0.04, 0.9]} />
            <meshStandardMaterial color="#222" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* ANA KULE (Gövde) */}
        <mesh position={[0, 0.5, -0.1]}>
            <boxGeometry args={[0.7, 1.0, 0.5]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>

        {/* ÜST KAPAK (Lid) */}
        <mesh position={[0, 1.05, -0.1]}>
            <boxGeometry args={[0.72, 0.1, 0.52]} />
            <meshStandardMaterial color="#222" metalness={0.5} roughness={0.2} />
        </mesh>

        {/* ÖN PANEL DETAYI (Dokulu Bölüm) */}
        <mesh position={[0, 0.45, 0.155]}>
            <boxGeometry args={[0.62, 0.7, 0.01]} />
            <meshStandardMaterial color="#111" roughness={1} />
        </mesh>

        {/* LOGO / GÖSTERGE IŞIĞI */}
        <mesh position={[0, 0.1, 0.16]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
        </mesh>
    </group>;
}

function Lintel({ x, z, w, t, h, doorH = 2.15 }) {
    const wallH = h - doorH;
    return <mesh position={[x, doorH + wallH / 2, z]}>
        <boxGeometry args={[w, wallH, t]} />
        {wallMat}
    </mesh>;
}

function Robot({ posRef, rotRef }) {
    const g = useRef();
    const brushRefL = useRef();
    const brushRefR = useRef();

    useFrame((state, dt) => {
        if (!g.current) return;
        const p = posRef.current;
        g.current.position.set(p.x, 0.1, p.z); // Yere daha yakın (0.1)
        g.current.rotation.y = rotRef.current;

        // Yan fırçaların TOZ TOPLAMA mantığında zıt yönlü dönüşü
        // Sol fırça saat yönüne, Sağ fırça saat yönünün tersine döner
        if (brushRefL.current) brushRefL.current.rotation.y -= 10 * dt; // CW
        if (brushRefR.current) brushRefR.current.rotation.y += 10 * dt; // CCW
    });

    const bodyCol = "#222";
    const topCol = "#2d3a5a";
    const sensorCol = "#000000";

    return <group ref={g}>
        {/* ANA GÖVDE (Siyah Disk) */}
        <mesh castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.1, 32]} />
            <meshStandardMaterial color={bodyCol} roughness={0.4} />
        </mesh>

        {/* ÜST KAPAK (Lacivert/Metalik Bölüm) */}
        <mesh position={[0, 0.052, 0]}>
            <cylinderGeometry args={[0.33, 0.33, 0.01, 32]} />
            <meshStandardMaterial
                color={topCol}
                metalness={0.7}
                roughness={0.2}
                emissive={topCol}
                emissiveIntensity={0.1}
            />
        </mesh>

        {/* LIDAR KULESİ (LDS Sensor) */}
        <group position={[0, 0.08, 0]}>
            <mesh castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
                <meshStandardMaterial color={sensorCol} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Kulenin gümüş üst halkası */}
            <mesh position={[0, 0.026, 0]}>
                <cylinderGeometry args={[0.082, 0.082, 0.005, 16]} />
                <meshStandardMaterial color="silver" metalness={1} roughness={0} />
            </mesh>
        </group>

        {/* BUTONLAR */}
        <mesh position={[0.1, 0.06, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.02, 0.04, 4, 8]} />
            <meshStandardMaterial color="#444" />
        </mesh>

        {/* YAN FIRÇALAR (Helikopter Pervanesi Gibi Sabit Pivot) */}
        {/* SOL FIRÇA (Robot Solu) */}
        <group position={[0.22, -0.046, 0.22]} ref={brushRefL}>
            {/* Merkez Kapak (Hub) */}
            <mesh position={[0, 0.01, 0]}>
                <cylinderGeometry args={[0.03, 0.04, 0.02, 16]} />
                <meshStandardMaterial color="#000" />
            </mesh>
            {/* 3 Kollu Fırça */}
            {[0, 2.1, 4.2].map(r => (
                <group key={r} rotation={[0, r, 0]}>
                    <mesh position={[0.09, 0, 0]}>
                        <boxGeometry args={[0.18, 0.01, 0.012]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                </group>
            ))}
        </group>

        {/* SAĞ FIRÇA (Robot Sağı) */}
        <group position={[-0.22, -0.046, 0.22]} ref={brushRefR}>
            {/* Merkez Kapak (Hub) */}
            <mesh position={[0, 0.01, 0]}>
                <cylinderGeometry args={[0.03, 0.04, 0.02, 16]} />
                <meshStandardMaterial color="#000" />
            </mesh>
            {/* 3 Kollu Fırça */}
            {[0, 2.1, 4.2].map(r => (
                <group key={r} rotation={[0, r, 0]}>
                    <mesh position={[-0.09, 0, 0]}>
                        <boxGeometry args={[0.18, 0.01, 0.012]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                </group>
            ))}
        </group>
    </group>;
}

/* --- UTILS --- */
function sweep(xMin, xMax, zMin, zMax, fromPos = null, sw = 0.50) {
    const M = 0.41; // Güvenli marj
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

    // 90 Derecelik akıcı perimeter turu (Geri dönme yok!)
    pts.push([pStartX, 0.25, pStartZ]);
    pts.push([pEndX, 0.25, pStartZ]); // Yan duvara geç (90 derece)
    pts.push([pEndX, 0.25, pEndZ]);
    pts.push([pStartX, 0.25, pEndZ]);
    pts.push([pStartX, 0.25, pStartZ]); // Tur bitti (90 derece)

    // --- 2. ADIM: İÇ ZİGZAG (Fill) ---
    const iz0 = z0 + sw, iz1 = z1 - sw;
    if (iz0 < iz1) {
        let stepX = pStartX === x0 ? sw : -sw;
        let targetX = pStartX === x0 ? x1 : x0;

        // Perimeter'den zigzag'a AKICI GEÇİŞ: 
        // Zaten pStartX hattındayız, bir sonraki zigzag hattından başla
        let startX = pStartX + stepX;
        let stopX = targetX - (stepX * 0.5);

        // Oda çok dar ise sadece perimetre yeterli
        if ((stepX > 0 && startX > x1 - 0.1) || (stepX < 0 && startX < x0 + 0.1)) return pts;

        let curZStart = pStartZ === z0 ? iz0 : iz1;
        let curZEnd = pStartZ === z0 ? iz1 : iz0;

        const shouldCont = (curr) => stepX > 0 ? curr <= stopX + 0.05 : curr >= stopX - 0.05;

        let lastZ = pStartZ;
        for (let x = startX; shouldCont(x);) {
            // ZİGZAG GEÇİŞİNDE L-DÖNÜŞÜ: Bulunulan Z seviyesinde yan hatta kay
            pts.push([x, 0.25, lastZ]);

            pts.push([x, 0.25, curZStart]);
            pts.push([x, 0.25, curZEnd]);
            lastZ = curZEnd; // Bir sonraki geçiş için son Z'yi kaydet
            [curZStart, curZEnd] = [curZEnd, curZStart];
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
        suite.push({ name: "Salon-Mutfak-A", bounds: [[-4.9, 4.9], [-4.9, 0]], isCenter: true, displayName: "Salon-Mutfak" });
        suite.push({ name: "Salon-Mutfak-B", bounds: [[0.1, 4.9], [0, 4.9]], isCenter: true, displayName: "Salon-Mutfak" });
        suite.push({ name: "Oda", bounds: [[-4.9, -0.6], [0.1, 4.9]], doorPos: [0, 2.5], doorDir: 'x', toPos: false, corridorX: 0.6 });

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

            <Html position={[0, 0.1, -2.5]} center transform rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
                <div style={{ color: 'white', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'Bold', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>SALON-MUTFAK</div>
            </Html>
            <Html position={[-2.5, 0.1, 2.5]} center transform rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
                <div style={{ color: 'white', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'Bold', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>ODA</div>
            </Html>
        </>}

        {type === "2+1" && <>
            <mesh position={[4.5, 0.015, 0]}><boxGeometry args={[4.8, 0.01, 9.8]} /><meshStandardMaterial color="#ee5253" opacity={0.35} transparent /></mesh>
            <mesh position={[0, 0.015, 0]}><boxGeometry args={[3.8, 0.01, 9.8]} /><meshStandardMaterial color="#b2bec3" opacity={0.35} transparent /></mesh>
            <mesh position={[-4.5, 0.015, 2.5]}><boxGeometry args={[4.8, 0.01, 4.8]} /><meshStandardMaterial color="#10ac84" opacity={0.35} transparent /></mesh>
            <mesh position={[-4.5, 0.015, -2.5]}><boxGeometry args={[4.8, 0.01, 4.8]} /><meshStandardMaterial color="#00d2d3" opacity={0.35} transparent /></mesh>

            <Html position={[4.5, 0.1, 0]} center transform rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
                <div style={{ color: 'white', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'Bold', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>SALON</div>
            </Html>
            <Html position={[0, 0.1, 0]} center transform rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
                <div style={{ color: 'white', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'Bold', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>HOL</div>
            </Html>
            <Html position={[-4.5, 0.1, 2.5]} center transform rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
                <div style={{ color: 'white', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'Bold', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>ODA 1</div>
            </Html>
            <Html position={[-4.5, 0.1, -2.5]} center transform rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
                <div style={{ color: 'white', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'Bold', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>ODA 2</div>
            </Html>
        </>}

        {type === "3+1" && <>
            <mesh position={[4, 0.015, -1.75]}><boxGeometry args={[5.8, 0.01, 6.3]} /><meshStandardMaterial color="#ee5253" opacity={0.35} transparent /></mesh>
            <mesh position={[4, 0.015, 3.25]}><boxGeometry args={[5.8, 0.01, 3.3]} /><meshStandardMaterial color="#ff9f43" opacity={0.35} transparent /></mesh>
            <mesh position={[-0.75, 0.015, 0]}><boxGeometry args={[3.3, 0.01, 9.8]} /><meshStandardMaterial color="#b2bec3" opacity={0.35} transparent /></mesh>
            <mesh position={[-4.75, 0.015, 2.75]}><boxGeometry args={[4.3, 0.01, 4.3]} /><meshStandardMaterial color="#10ac84" opacity={0.35} transparent /></mesh>
            <mesh position={[-4.75, 0.015, -2.25]}><boxGeometry args={[4.3, 0.01, 5.3]} /><meshStandardMaterial color="#00d2d3" opacity={0.35} transparent /></mesh>

            {/* Oda İsimleri (HTML Overlay - Sıfır GPU Yükü) */}
            <Html position={[4, 0.1, -1.75]} center transform rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
                <div style={{ color: 'white', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'Bold', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>SALON</div>
            </Html>
            <Html position={[4, 0.1, 3.25]} center transform rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
                <div style={{ color: 'white', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'Bold', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>ODA 1</div>
            </Html>
            <Html position={[-0.75, 0.1, 0]} center transform rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
                <div style={{ color: 'white', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'Bold', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>HOL</div>
            </Html>
            <Html position={[-4.75, 0.1, 2.75]} center transform rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
                <div style={{ color: 'white', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'Bold', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>EBEVEYN ODASI</div>
            </Html>
            <Html position={[-4.75, 0.1, -2.25]} center transform rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
                <div style={{ color: 'white', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'Bold', whiteSpace: 'nowrap', userSelect: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>ODA 2</div>
            </Html>
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
                const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0); // Keskin köşeler için 0
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
            <Lintel x={0} z={2.5} w={t} t={1} h={h} /> {/* Door to Oda */}

        </>}

        {/* 2+1 MİMARİ DUVARLAR */}
        {type === "2+1" && <>
            <Wall w={t} h={h} t={6.25} x={2} z={-1.75} />
            <Wall w={t} h={h} t={1.75} x={2} z={4} />
            <Lintel x={2} z={2.25} w={t} t={1.75} h={h} /> {/* Door to Salon */}

            <Wall w={t} h={h} t={3.25} x={-2} z={-3.3} />
            <Wall w={t} h={h} t={1.75} x={-2} z={4} />
            <Wall w={t} h={h} t={1.65} x={-2} z={0.75} /> {/* Wall between Oda 1 and 2 */}
            <Lintel x={-2} z={2.3} w={t} t={1.65} h={h} /> {/* Door to Oda 1 */}
            <Lintel x={-2} z={-0.9} w={t} t={1.65} h={h} /> {/* Door to Oda 2 */}
            <Wall w={5} h={h} t={t} x={-4.5} z={0} />
        </>}

        {/* 3+1 ÖZEL MİMARİ (Premium) */}
        {type === "3+1" && <>
            {/* Sağ taraf (Salon-Mutfak) */}
            <Wall w={6} h={h} t={t} x={4} z={1.5} />
            <Wall w={t} h={h} t={4} x={1} z={-3} />
            <Wall w={t} h={h} t={1} x={1} z={1} />
            <Wall w={t} h={h} t={1.75} x={1} z={4} />
            <Lintel x={1} z={-0.25} w={t} t={1.75} h={h} /> {/* Lintel Salon */}
            <Lintel x={1} z={2.3} w={t} t={1.75} h={h} /> {/* Lintel Mutfak */}

            <Wall w={t} h={h} t={3.2} x={-2.5} z={3.3} />
            <Wall w={t} h={h} t={1.5} x={-2.5} z={-0.25} />
            <Wall w={t} h={h} t={1.5} x={-2.5} z={-4.25} />
            <Lintel x={-2.5} z={1} w={t} t={1.75} h={h} /> {/* Lintel Ebeveyn Odası */}
            <Lintel x={-2.5} z={-2.2} w={t} t={2.75} h={h} /> {/* Lintel Oda 2 */}
            <Wall w={4.5} h={h} t={t} x={-4.75} z={0.5} />
        </>}

        {/* 3+2 ÖZEL MİMARİ (Grand Mansion) */}
        {type === "3+2" && <>
            <Wall w={2} h={h} t={t} x={2} z={0} />
            <Wall w={4} h={h} t={t} x={7} z={0} />
            <Lintel x={4} z={0} w={2} t={t} h={h} /> {/* Lintel Salon */}

            <Wall w={t} h={h} t={6} x={1} z={-3} />
            <Wall w={t} h={h} t={3.75} x={1} z={4} />
            <Lintel x={1} z={1.1} w={t} t={2.25} h={h} />

            <Wall w={4} h={h} t={t} x={7} z={2.25} />
            <Wall w={2} h={h} t={t} x={2} z={2.25} />
            <Lintel x={4} z={2.25} w={2} t={t} h={h} /> {/* Lintel Mutfak */}

            <Wall w={t} h={h} t={2} x={-4} z={5} />
            <Wall w={t} h={h} t={1.5} x={-4} z={1.5} />
            <Wall w={t} h={h} t={2} x={-4} z={-2} />
            <Wall w={t} h={h} t={1.5} x={-4} z={-5.25} />
            <Lintel x={-4} z={3.12} w={t} t={1.75} h={h} /> {/* Lintel Ebeveyn */}
            <Lintel x={-4} z={-0.12} w={t} t={1.75} h={h} /> {/* Lintel Misafir */}
            <Lintel x={-4} z={-3.75} w={t} t={1.5} h={h} /> {/* Lintel Çocuk */}

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
                <ambientLight intensity={0.5} />
                <hemisphereLight intensity={0.4} groundColor="#d6d2c8" />
                <directionalLight position={[0, 10, 0]} intensity={1.5} />
                <ContactShadows
                    position={[0, 0.01, 0]}
                    opacity={0.3}
                    scale={25}
                    blur={2.5}
                    far={4}
                    resolution={128}
                />
                <House type={type} trail={trail} posRef={posRef} rotRef={rotRef} />
                <Mover />
                <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={26} />
            </Canvas>
        </div>
    );
}