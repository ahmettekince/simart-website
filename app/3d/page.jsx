// "use client";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// import { useState, useRef, useMemo } from "react";
// import * as THREE from "three";

// const wallMat = <meshStandardMaterial color="#f4f3ef" roughness={0.95} />;
// const floorMat = <meshStandardMaterial color="#d8cfbf" roughness={0.8} metalness={0.05} />;

// function Wall({ w, h, t, x, z }) {
//     return <mesh position={[x, h / 2, z]} castShadow receiveShadow>
//         <boxGeometry args={[w, h, t]} />{wallMat}</mesh>;
// }

// function Station() {
//     return <group position={[0, 0, -4.7]}>
//         <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.8, 0.2, 0.5]} /><meshStandardMaterial color="#444" metalness={0.6} roughness={0.4} /></mesh>
//         <mesh position={[0, 0.3, -0.2]}><boxGeometry args={[0.7, 0.6, 0.1]} /><meshStandardMaterial color="#333" /></mesh>
//         <mesh position={[0, 0.5, -0.14]}><sphereGeometry args={[0.03, 16, 16]} /><meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} /></mesh>
//     </group>;
// }

// function Robot({ posRef, rotRef }) {
//     const g = useRef();
//     useFrame(() => {
//         if (!g.current) return;
//         const p = posRef.current;
//         g.current.position.set(p.x, p.y, p.z);
//         g.current.rotation.y = rotRef.current;
//     });
//     return <group ref={g}>
//         <mesh castShadow><cylinderGeometry args={[0.32, 0.32, 0.45, 32]} /><meshStandardMaterial color="#2b2b2b" metalness={0.5} roughness={0.35} /></mesh>
//         <mesh position={[0, 0.1, 0.25]}><boxGeometry args={[0.2, 0.1, 0.1]} /><meshStandardMaterial color="#ff3e00" emissive="#ff3e00" emissiveIntensity={2} /></mesh>
//         <mesh position={[0, 0.23, 0]}><cylinderGeometry args={[0.15, 0.15, 0.02, 32]} /><meshStandardMaterial color="#00a8ff" emissive="#00a8ff" emissiveIntensity={1} /></mesh>
//     </group>;
// }

// /* --- UTILS --- */
// function sweep(xMin, xMax, zMin, zMax, fromPos = null, sw = 0.55) {
//     const M = 0.32; // Robot radiusu kadar güvenli marj
//     const x0 = xMin + M, x1 = xMax - M;
//     const z0 = zMin + M, z1 = zMax - M;
//     if (x0 > x1 || z0 > z1) return [];

//     let startX = x0, endX = x1, stepX = sw;
//     let startZ = z0, endZ = z1;

//     if (fromPos) {
//         // En yakın X sınırını bul
//         if (Math.abs(fromPos[0] - x1) < Math.abs(fromPos[0] - x0)) {
//             startX = x1; endX = x0; stepX = -sw;
//         }
//         // En yakın Z sınırını bul
//         if (Math.abs(fromPos[2] - z1) < Math.abs(fromPos[2] - z0)) {
//             startZ = z1; endZ = z0;
//         }
//     }

//     const pts = [];
//     if (fromPos) pts.push([fromPos[0], 0.25, fromPos[2]]); // Eşik köprüsü

//     let curZStart = startZ, curZEnd = endZ;
//     const shouldCont = (curr) => stepX > 0 ? curr <= endX + 0.01 : curr >= endX - 0.01;

//     for (let x = startX; shouldCont(x);) {
//         pts.push([x, 0.25, curZStart]);
//         pts.push([x, 0.25, curZEnd]);
//         [curZStart, curZEnd] = [curZEnd, curZStart];
//         if (x === endX) break;
//         x = stepX > 0 ? Math.min(x + sw, endX) : Math.max(x - sw, endX);
//     }
//     return pts;
// }

// function door(x, z, dir, toPositive, M = 0.8) {
//     const L = 1.0; // Güvenli kapı geçiş derinliği (duvardan geçmeyi önler)
//     if (dir === 'z') {
//         const p1 = toPositive ? z - L : z + L;
//         const p2 = toPositive ? z + L : z - L;
//         return [[x, 0.25, p1], [x, 0.25, z], [x, 0.25, p2]];
//     } else {
//         const p1 = toPositive ? x - L : x + L;
//         const p2 = toPositive ? x + L : x - L;
//         return [[p1, 0.25, z], [x, 0.25, z], [p2, 0.25, z]];
//     }
// }

// function buildWaypoints(type) {
//     const all = [];
//     const push = arr => arr.forEach(p => all.push(p));
//     const station = [0, 0.25, -4.5];
//     const entrance = [0, 0.25, -4]; // Koridor giriş noktası
//     let currentPos = station;

//     const areas = [];
//     if (type === "1+1") {
//         // 1+1: Yeni Plan (Senin Düzenlediğin)
//         // Oda Sol Üst (x:[-5,0], z:[0,5]) - Kapı x=0, z=2.5
//         areas.push({ name: "Salon-Sag", bounds: [[0.1, 4.9], [-4.9, 4.9]], doorPos: [0, 0], doorDir: 'x', isCenter: true });
//         areas.push({ name: "Salon-Alt", bounds: [[-4.9, -0.1], [-4.9, -0.1]], doorPos: [0, -2], doorDir: 'x', isCenter: true });
//         areas.push({ name: "Oda", bounds: [[-4.9, -0.1], [0.1, 4.9]], doorPos: [0, 2.5], doorDir: 'x', toPos: false });
//     } else if (type === "2+1") {
//         areas.push({ name: "Salon", bounds: [[2.1, 6.9], [-4.9, 4.9]], doorPos: [2, 2.25], doorDir: 'x', toPos: true });
//         areas.push({ name: "Hol", bounds: [[-1.9, 1.9], [-4.9, 4.9]], doorPos: [0, 0], doorDir: 'x', isCenter: true });
//         areas.push({ name: "Oda 1", bounds: [[-6.9, -2.1], [0.1, 4.9]], doorPos: [-2, 2.3], doorDir: 'x', toPos: false });
//         areas.push({ name: "Oda 2", bounds: [[-6.9, -2.1], [-4.9, -0.1]], doorPos: [-2, -0.8], doorDir: 'x', toPos: false });
//     } else if (type === "3+1") {
//         // 3+1: "Premium Special" Mimari (Yeni Genişletilmiş Odalar)
//         areas.push({ name: "Salon", bounds: [[1.1, 6.9], [-4.9, 1.4]], doorPos: [1, -0.25], doorDir: 'x', toPos: true });
//         areas.push({ name: "Mutfak", bounds: [[1.1, 6.9], [1.6, 4.9]], doorPos: [1, 2.3], doorDir: 'x', toPos: true });
//         areas.push({ name: "Hol", bounds: [[-2.4, 0.9], [-4.9, 4.9]], doorPos: [0, 0], doorDir: 'x', isCenter: true });
//         areas.push({ name: "Ebeveyn Odası", bounds: [[-6.9, -2.6], [0.6, 4.9]], doorPos: [-2.5, 2.37], doorDir: 'x', toPos: false });
//         areas.push({ name: "Oda 2", bounds: [[-6.9, -2.6], [-4.9, 0.4]], doorPos: [-2.5, -2.8], doorDir: 'x', toPos: false });
//     } else if (type === "3+2") {
//         // 3+2: "Grand Mansion" - Özel Hiyerarşik Rotalama
//         const suite = [];
//         suite.push({ name: "Hol", bounds: [[-3.8, 0.8], [-5.8, 5.8]], doorPos: [0, 0], doorDir: 'x', isCenter: true });
//         suite.push({ name: "Ebeveyn", bounds: [[-8.8, -4.1], [2.4, 5.8]], doorPos: [-4, 3.12], doorDir: 'x', toPos: false });
//         suite.push({ name: "Misafir", bounds: [[-8.8, -4.1], [-0.9, 2.1]], doorPos: [-4, -0.12], doorDir: 'x', toPos: false });
//         suite.push({ name: "Çocuk", bounds: [[-8.8, -4.1], [-5.8, -1.2]], doorPos: [-4, -3.75], doorDir: 'x', toPos: false });

//         suite.push({ name: "Mutfak-Ara", bounds: [[1.2, 8.8], [0.1, 2.15]], doorPos: [1, 1.06], doorDir: 'x', toPos: true });
//         suite.push({ name: "Ana Salon", bounds: [[1.2, 8.8], [-5.8, -0.1]], doorPos: [4, 0], doorDir: 'z', toPos: false, corridorX: 1.5 });
//         suite.push({ name: "Mutfak-Üst", bounds: [[1.2, 8.8], [2.35, 5.8]], doorPos: [4, 2.25], doorDir: 'z', toPos: true, corridorX: 1.5 });

//         push([station]); push([entrance]); currentPos = entrance;

//         suite.forEach(area => {
//             const cX = area.corridorX ?? 0;
//             if (!area.isCenter) {
//                 push([[cX, 0.25, currentPos[2]]]);
//                 push([[cX, 0.25, area.doorPos[1]]]);
//                 const dPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, area.toPos);
//                 push(dPts);
//                 currentPos = dPts[dPts.length - 1];
//             }
//             const sPts = sweep(...area.bounds[0], ...area.bounds[1], currentPos);
//             push(sPts);
//             if (sPts.length > 0) currentPos = sPts[sPts.length - 1];
//             if (!area.isCenter) {
//                 const rPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, !area.toPos);
//                 push(rPts);
//                 push([[cX, 0.25, area.doorPos[1]]]);
//                 currentPos = [cX, 0.25, area.doorPos[1]];
//             }
//         });
//         push([station]);
//         return all;
//     }

//     currentPos = station;
//     let pending = [...areas];
//     push([station]);
//     push([entrance]);
//     currentPos = entrance;

//     while (pending.length > 0) {
//         let bestIdx = 0;
//         let minDist = Infinity;
//         pending.forEach((area, idx) => {
//             const dx = area.doorPos[0] - currentPos[0];
//             const dz = area.doorPos[1] - currentPos[2];
//             const d = dx * dx + dz * dz;
//             if (d < minDist) { minDist = d; bestIdx = idx; }
//         });

//         const area = pending.splice(bestIdx, 1)[0];

//         // --- MANHATTAN YOL BULMA (Duvardan Geçişi Önler) ---
//         if (!area.isCenter) {
//             // Önce koridor aksına (x=0) hizalan, kapı boylamına (z) git.
//             // door() fonksiyonu zaten içeriden/dışarıdan noktaları ekleyerek yumuşak geçiş sağlar.
//             push([[0, 0.25, currentPos[2]]]);
//             push([[0, 0.25, area.doorPos[1]]]);

//             const dPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, area.toPos);
//             push(dPts);
//             currentPos = dPts[dPts.length - 1];
//         }

//         const sPts = sweep(...area.bounds[0], ...area.bounds[1], currentPos);
//         push(sPts);
//         if (sPts.length > 0) currentPos = sPts[sPts.length - 1];

//         if (!area.isCenter) {
//             const rPts = door(area.doorPos[0], area.doorPos[1], area.doorDir, !area.toPos);
//             push(rPts);
//             // Koridor aksına güvenli dönüş
//             push([[0, 0.25, area.doorPos[1]]]);
//             currentPos = [0, 0.25, area.doorPos[1]];
//         }
//     }

//     push([station]);
//     return all;
// }

// /* --- COMPONENTS --- */
// function House({ type, trail, posRef, rotRef }) {
//     const h = 2.7, t = 0.18;
//     const is1plus1 = type === "1+1";
//     const is3plus2 = type === "3+2";
//     const fw = is3plus2 ? 18 : (is1plus1 ? 10 : 14);
//     const fz = is3plus2 ? 12 : 10;
//     return <>
//         <mesh position={[0, 0.01, 0]} receiveShadow><boxGeometry args={[fw, 0.01, fz]} />{floorMat}</mesh>
//         <Station />
//         <Wall w={fw} h={h} t={t} x={0} z={-fz / 2} />
//         <Wall w={fw} h={h} t={t} x={0} z={fz / 2} />
//         <Wall w={t} h={h} t={fz} x={-fw / 2} z={0} />
//         <Wall w={t} h={h} t={fz} x={fw / 2} z={0} />

//         {/* TEMİZLENMİŞ ALAN (Parlak Temiz Yüzey Efekti) */}
//         {trail.map((p, i) => <mesh key={i} position={[p[0], 0.02, p[2]]} rotation={[-Math.PI / 2, 0, 0]}>
//             <circleGeometry args={[0.5, 16]} />
//             <meshStandardMaterial
//                 color="#a5d8ff"
//                 opacity={0.25}
//                 transparent
//                 depthWrite={false}
//                 metalness={0.1}
//                 roughness={0.1}
//             />
//         </mesh>)}

//         {/* 1+1 ÖZEL MİMARİ */}
//         {type === "1+1" && <>
//             <Wall w={5} h={h} t={t} x={-2.5} z={0} />
//             <Wall w={t} h={h} t={2} x={0} z={1} />
//             <Wall w={t} h={h} t={2} x={0} z={4} />
//         </>}

//         {/* 2+1 MİMARİ DUVARLAR */}
//         {type === "2+1" && <>
//             <Wall w={t} h={h} t={6.25} x={2} z={-1.75} />
//             <Wall w={t} h={h} t={1.75} x={2} z={4} />
//             <Wall w={t} h={h} t={3.25} x={-2} z={-3.3} />
//             <Wall w={t} h={h} t={1.75} x={-2} z={4} />
//             <Wall w={t} h={h} t={1.5} x={-2} z={0.75} />
//             <Wall w={5} h={h} t={t} x={-4.5} z={0} />
//         </>}

//         {/* 3+1 ÖZEL MİMARİ (Premium) */}
//         {type === "3+1" && <>
//             {/* Sağ taraf (Salon-Mutfak) */}
//             <Wall w={6} h={h} t={t} x={4} z={1.5} />
//             <Wall w={t} h={h} t={4} x={1} z={-3} />
//             <Wall w={t} h={h} t={1} x={1} z={1} />
//             <Wall w={t} h={h} t={1.75} x={1} z={4} />

//             {/* Sol taraf (Yatak Odaları) */}
//             <Wall w={t} h={h} t={1.75} x={-2.5} z={4} />
//             <Wall w={t} h={h} t={3.75} x={-2.5} z={-0.25} />
//             <Wall w={t} h={h} t={1.5} x={-2.5} z={-4.25} />
//             <Wall w={4.5} h={h} t={t} x={-4.75} z={0.5} />
//         </>}

//         {/* 3+2 ÖZEL MİMARİ (Grand Mansion) */}
//         {type === "3+2" && <>
//             <Wall w={2} h={h} t={t} x={2} z={0} />
//             <Wall w={4} h={h} t={t} x={7} z={0} />
//             <Wall w={t} h={h} t={6} x={1} z={-3} />
//             <Wall w={t} h={h} t={3.75} x={1} z={4} />
//             <Wall w={4} h={h} t={t} x={7} z={2.25} />
//             <Wall w={2} h={h} t={t} x={2} z={2.25} />
//             <Wall w={t} h={h} t={2} x={-4} z={5} />
//             <Wall w={t} h={h} t={1.5} x={-4} z={1.5} />
//             <Wall w={t} h={h} t={2} x={-4} z={-2} />
//             <Wall w={t} h={h} t={1.5} x={-4} z={-5.25} />
//             <Wall w={5} h={h} t={t} x={-6.5} z={2.25} />
//             <Wall w={5} h={h} t={t} x={-6.5} z={-1} />

//         </>}

//         <Robot posRef={posRef} rotRef={rotRef} />
//     </>;
// }


// export default function Plan3D() {
//     const [type, setType] = useState("2+1");
//     const [isAuto, setIsAuto] = useState(false);
//     const [trail, setTrail] = useState([]);
//     const [status, setStatus] = useState("Hazır");
//     const [pct, setPct] = useState(0);

//     const posRef = useRef(new THREE.Vector3(0, 0.25, -4.5));
//     const rotRef = useRef(0);
//     const wpIdx = useRef(0);
//     const running = useRef(false);
//     const lastTrail = useRef(null);

//     const rooms = parseInt(type.split("+")[0]);
//     const waypoints = useMemo(() => buildWaypoints(type), [type]);

//     const startStop = () => {
//         if (isAuto) {
//             running.current = false;
//             setIsAuto(false);
//             setStatus("Duraklatıldı");
//             return;
//         }
//         setTrail([]); lastTrail.current = null;
//         wpIdx.current = 1; running.current = true; setIsAuto(true); setPct(0);
//         setStatus("Temizlik başlıyor…");
//     };

//     const reset = () => {
//         running.current = false; setIsAuto(false);
//         setTrail([]); lastTrail.current = null;
//         posRef.current.set(0, 0.25, -4.5); rotRef.current = 0;
//         setStatus("Sıfırlandı"); setPct(0);
//     };

//     function Mover() {
//         useFrame((_, dt) => {
//             if (!running.current) return;
//             const idx = wpIdx.current;
//             if (idx >= waypoints.length) {
//                 running.current = false; setIsAuto(false);
//                 setStatus("✅ Tamamlandı!"); setPct(100); return;
//             }
//             const [tx, ty, tz] = waypoints[idx];
//             const cur = posRef.current;
//             const tgt = new THREE.Vector3(tx, ty, tz);
//             const diff = new THREE.Vector3().subVectors(tgt, cur);
//             const dist = diff.length();

//             if (dist > 0.02) {
//                 const ang = Math.atan2(diff.x, diff.z);
//                 let da = ang - rotRef.current;
//                 while (da > Math.PI) da -= 2 * Math.PI;
//                 while (da < -Math.PI) da += 2 * Math.PI;
//                 rotRef.current += da * Math.min(1, dt * 10);
//             }

//             const step = 3.5 * dt;
//             if (dist <= step) {
//                 cur.copy(tgt);
//                 wpIdx.current = idx + 1;
//                 setPct(Math.round((idx + 1) / waypoints.length * 100));
//                 if ((idx + 1) < waypoints.length) setStatus(`🧹 Temizleniyor… %${Math.round((idx + 1) / waypoints.length * 100)}`);
//             } else {
//                 diff.normalize().multiplyScalar(step);
//                 cur.add(diff);
//             }

//             const ltp = lastTrail.current;
//             if (!ltp || cur.distanceTo(ltp) >= 0.10) {
//                 lastTrail.current = cur.clone();
//                 setTrail(prev => [...prev, [cur.x, cur.y, cur.z]]);
//             }
//         });
//         return null;
//     }

//     return (
//         <div style={{ width: "100%", height: "100vh", background: "#1a1a2e", overflow: "hidden", fontFamily: "Inter,sans-serif" }}>
//             <div style={{ position: "absolute", zIndex: 10, top: 0, left: 0, right: 0, padding: "14px 24px", display: "flex", gap: 16, alignItems: "center", background: "rgba(15,15,30,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
//                 <div>
//                     <label style={{ fontSize: 11, display: "block", color: "#aaa", marginBottom: 4, letterSpacing: 1 }}>EV PLANI</label>
//                     <select value={type} onChange={e => { setType(e.target.value); reset(); }}
//                         style={{ padding: "7px 12px", fontSize: 14, borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", cursor: "pointer" }}>
//                         <option style={{ background: "#1a1a2e" }}>1+1</option>
//                         <option style={{ background: "#1a1a2e" }}>2+1</option>
//                         <option style={{ background: "#1a1a2e" }}>3+1</option>
//                         <option style={{ background: "#1a1a2e" }}>3+2</option>
//                     </select>
//                 </div>
//                 <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "8px 16px", color: "#ddd", fontSize: 13 }}>{status}</div>
//                 <div style={{ width: 160 }}>
//                     <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
//                         <span>Temizlik</span><span style={{ color: "#55efc4" }}>{pct}%</span>
//                     </div>
//                     <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 6, height: 8, overflow: "hidden" }}>
//                         <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#3c81b5,#55efc4)", borderRadius: 6, transition: "width 0.4s" }} />
//                     </div>
//                 </div>
//                 <button onClick={startStop} style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: isAuto ? "#fdcb6e" : "linear-gradient(135deg,#3c81b5,#55efc4)", color: isAuto ? "#2b2b2b" : "white", fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 14px rgba(60,129,181,0.4)" }}>
//                     {isAuto ? "⏸ Durdur" : "⚡ Temizliği Başlat"}
//                 </button>
//                 <button onClick={reset} style={{ padding: "9px 18px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#ff7675", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>↺ Sıfırla</button>
//             </div>
//             <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true }} camera={{ position: [14, 12, 14], fov: 42 }}>
//                 <ambientLight intensity={0.4} />
//                 <hemisphereLight intensity={0.6} groundColor="#d6d2c8" />
//                 <directionalLight position={[2, 10, 4]} intensity={1.3} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
//                 <House type={type} trail={trail} posRef={posRef} rotRef={rotRef} />
//                 <Mover />
//                 <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={26} />
//             </Canvas>
//         </div>
//     );
// }