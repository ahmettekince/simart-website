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

// /*
//   EV GEOMETRİSİ – Kapı Konumları:
//   - Koridor duvarı (z=1): gap x=-4.5 ve x=0.5
//   - Sol bölme üst (x=-2, z=[1,5]): gap z=3  (rooms>=1)
//   - Sol bölme alt (x=-2, z=[-5,-1]): gap z=-3 (rooms>=2)
//   - Salon duvarı (x=3, z=[-5,1]): gap z=-1.5
// */
// function House({ rooms, trail, posRef, rotRef }) {
//     const h = 2.7, t = 0.18;
//     return <>
//         {/* ZEMİN */}
//         <mesh position={[0, 0.01, 0]} receiveShadow><boxGeometry args={[14, 0.01, 10]} />{floorMat}</mesh>

//         {/* TEMİZLENMİŞ ALAN */}
//         {trail.map((p, i) => <mesh key={i} position={[p[0], 0.018, p[2]]} rotation={[-Math.PI / 2, 0, 0]}>
//             <planeGeometry args={[0.8, 0.8]} />
//             <meshStandardMaterial color="#3c81b5" opacity={0.45} transparent depthWrite={false} />
//         </mesh>)}

//         <Station />

//         {/* DIŞ DUVARLAR */}
//         <Wall w={14} h={h} t={t} x={0} z={-5} />
//         <Wall w={14} h={h} t={t} x={0} z={5} />
//         <Wall w={t} h={h} t={10} x={-7} z={0} />
//         <Wall w={t} h={h} t={10} x={7} z={0} />

//         {/* KORIDOR DUVARI z=1 – boşluk x=-4.5 ve x=0.5 (her 1.1 birim) */}
//         <Wall w={1.95} h={h} t={t} x={-6.025} z={1} />
//         <Wall w={3.9} h={h} t={t} x={-2.0} z={1} />
//         <Wall w={5.95} h={h} t={t} x={4.025} z={1} />

//         {/* ÖN ODA BÖLME (x=-2, z=[1,5]) – boşluk z=3 */}
//         {rooms >= 1 && <>
//             <Wall w={t} h={h} t={1.45} x={-2} z={1.725} />
//             <Wall w={t} h={h} t={1.45} x={-2} z={4.275} />
//         </>}

//         {/* ARKA ODA BÖLME (x=-2, z=[-5,-1]) – boşluk z=-3 */}
//         {rooms >= 2 && <>
//             <Wall w={t} h={h} t={1.45} x={-2} z={-4.275} />
//             <Wall w={t} h={h} t={1.45} x={-2} z={-1.725} />
//         </>}

//         {/* 3+1 EK */}
//         {rooms >= 3 && <Wall w={4} h={h} t={t} x={-5} z={-1} />}

//         {/* SALON DUVARI (x=3, z=[-5,1]) – boşluk z=-1.5 */}
//         <Wall w={t} h={h} t={2.95} x={3} z={-3.525} />
//         <Wall w={t} h={h} t={1.95} x={3} z={0.025} />

//         <Robot posRef={posRef} rotRef={rotRef} />
//     </>;
// }

// /* Boustrophedon sweeper – bir bölge için zigzag waypoint listesi */
// function sweep(xMin, xMax, zMin, zMax, sw = 0.85) {
//     const M = 0.45;
//     const x0 = xMin + M, x1 = xMax - M;
//     const z0 = zMin + M, z1 = zMax - M;
//     if (x0 > x1 || z0 > z1) return [];
//     const pts = [];
//     let down = true;
//     for (let x = x0; x <= x1 + 0.01; x = Math.min(x + sw, x1)) {
//         pts.push([x, 0.25, down ? z0 : z1]);
//         pts.push([x, 0.25, down ? z1 : z0]);
//         down = !down;
//         if (x >= x1) break;
//     }
//     return pts;
// }

// /* Kapıdan geçiş waypoint'leri (yaklaş → geç → çık) */
// function door(x, z, dir, fromNeg, M = 0.55) {
//     if (dir === 'z') {
//         const a = fromNeg ? z - M : z + M;
//         const b = fromNeg ? z + M : z - M;
//         return [[x, 0.25, a], [x, 0.25, z], [x, 0.25, b]];
//     } else {
//         const a = fromNeg ? x - M : x + M;
//         const b = fromNeg ? x + M : x - M;
//         return [[a, 0.25, z], [x, 0.25, z], [b, 0.25, z]];
//     }
// }

// /*
//   Tüm waypoint sırası – her bölge geçişi kapıdan:

//   1+1: HOL_ALT → SALON_ALT → KORIDOR_UST → ON_ODA
//   2+1: HOL_ALT → ARKA_ODA → HOL_ALT(transit) → SALON_ALT → KORIDOR_UST → ON_ODA
//   3+1: aynı + ek oda

//   Kritik bölge sınırları:
//   - SALON: sadece z=[-5, 1] (koridor duvarı üzerini kesmez)
//   - KORIDOR_UST: x=[-2, 7], z=[1, 5] (salon üstü dahil, açık alan)
// */
// function buildWaypoints(rooms) {
//     const all = [];
//     const push = arr => arr.forEach(p => all.push(p));

//     // Bölgeler
//     const HOL = [[-2.0, 3.0], [-5.0, 1.0]];         // x=[-2,3], z=[-5,1]
//     const ARKA = [[-6.7, -2.2], [-4.8, -1.2]];       // arka oda (rooms>=2)
//     const SALON = [[3.2, 6.7], [-4.8, 0.8]];         // SADECE z<1!
//     const KORIDOR = [[-1.9, 6.7], [1.2, 4.8]];       // üst alan (x geniş, salon dahil)
//     const ON_ODA = [[-6.7, -2.2], [1.2, 4.8]];       // ön oda (rooms>=1)

//     // 1+1: Hol zaten geniş (x=-7'den 3'e kadar, alt bölme yok)
//     const HOL_1_1 = [[-6.7, 3.0], [-4.8, 0.8]];     // 1+1 için tüm alt alan

//     if (rooms === 1) {
//         // Hol (alt tüm alan sol taraf dahil)
//         push(sweep(...HOL_1_1[0], ...HOL_1_1[1]));
//         // Salon'a geç
//         push(door(3, -1.5, 'x', true));
//         push(sweep(...SALON[0], ...SALON[1]));
//         push(door(3, -1.5, 'x', false));
//         // Koridor üst'e geç
//         push(door(0.5, 1, 'z', true));
//         push(sweep(...KORIDOR[0], ...KORIDOR[1]));
//         // Ön Oda'ya geç
//         push(door(-2, 3, 'x', false));
//         push(sweep(...ON_ODA[0], ...ON_ODA[1]));

//     } else if (rooms === 2) {
//         // Hol (alt orta alan)
//         push(sweep(...HOL[0], ...HOL[1]));
//         // Arka odaya geç
//         push(door(-2, -3, 'x', false));
//         push(sweep(...ARKA[0], ...ARKA[1]));
//         push(door(-2, -3, 'x', true));
//         // Salon'a geç
//         push(door(3, -1.5, 'x', true));
//         push(sweep(...SALON[0], ...SALON[1]));
//         push(door(3, -1.5, 'x', false));
//         // Koridor üst'e geç
//         push(door(0.5, 1, 'z', true));
//         push(sweep(...KORIDOR[0], ...KORIDOR[1]));
//         // Ön Oda'ya geç
//         push(door(-2, 3, 'x', false));
//         push(sweep(...ON_ODA[0], ...ON_ODA[1]));

//     } else {
//         push(sweep(...HOL[0], ...HOL[1]));
//         push(door(-2, -3, 'x', false));
//         push(sweep(...ARKA[0], ...ARKA[1]));
//         push(door(-2, -3, 'x', true));
//         push(door(3, -1.5, 'x', true));
//         push(sweep(...SALON[0], ...SALON[1]));
//         push(door(3, -1.5, 'x', false));
//         push(door(0.5, 1, 'z', true));
//         push(sweep(...KORIDOR[0], ...KORIDOR[1]));
//         push(door(-2, 3, 'x', false));
//         push(sweep(...ON_ODA[0], ...ON_ODA[1]));
//     }
//     return all;
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
//     const waypoints = useMemo(() => buildWaypoints(rooms), [rooms]);

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
//         if (waypoints.length > 0) {
//             const [sx, , sz] = waypoints[0];
//             posRef.current.set(sx, 0.25, sz);
//         }
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
//             if (!ltp || cur.distanceTo(ltp) >= 0.8) {
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
//             <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true }} camera={{ position: [12, 10, 12], fov: 42 }}>
//                 <ambientLight intensity={0.4} />
//                 <hemisphereLight intensity={0.6} groundColor="#d6d2c8" />
//                 <directionalLight position={[2, 10, 4]} intensity={1.3} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
//                 <House rooms={rooms} trail={trail} posRef={posRef} rotRef={rotRef} />
//                 <Mover />
//                 <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={22} />
//             </Canvas>
//         </div>
//     );
// }