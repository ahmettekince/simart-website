import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function Robot({ posRef, rotRef, isCleaning, id = "katya-v-akilli-robot-supurge" }) {
    const g = useRef();
    const brushRefL = useRef();
    const brushRefR = useRef();

    useFrame((state, dt) => {
        if (!g.current) return;
        const p = posRef.current;
        g.current.position.set(p.x, 0.1, p.z);
        g.current.rotation.y = rotRef.current;

        if (isCleaning) {
            if (brushRefL.current) brushRefL.current.rotation.y -= 10 * dt;
            if (brushRefR.current) brushRefR.current.rotation.y += 10 * dt;
        }
    });

    const config = {
        body: "#1a1a1a", // Şık siyah
        top: "#050505",  // Daha koyu ve parlak üst kapak
        glow: "#3c81b5", // Şımart Mavisi
        logo: "#ffffff",
        sensorGlass: "#111111"
    };

    return (
        <group ref={g}>
            {/* 1. ALT MAVİ GÖRSEL (Sadece zeminde duran, ışık saçmayan halka) */}
            <mesh position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.28, 0.35, 64]} />
                <meshBasicMaterial color={config.glow} transparent opacity={0.5} />
            </mesh>
            {/* Işık taşmasını önlemek için pointLight kaldırıldı */}

            {/* 2. ANA GÖVDE (Parlak ve Yansıtıcı) */}
            <mesh castShadow>
                <cylinderGeometry args={[0.35, 0.35, 0.15, 64]} />
                <meshStandardMaterial 
                    color={config.body} 
                    roughness={0.2} 
                    metalness={0.8} 
                />
            </mesh>

            {/* 3. ÖN SENSÖR PANELİ */}
            <mesh position={[0, 0.02, 0.32]}>
                <boxGeometry args={[0.3, 0.06, 0.05]} />
                <meshStandardMaterial color={config.sensorGlass} roughness={0.1} metalness={0.9} />
            </mesh>

            {/* 4. ÜST KAPAK VE İNCE ŞIMART MAVİSİ HALKA */}
            <group position={[0, 0.076, 0]}>
                <mesh>
                    <cylinderGeometry args={[0.34, 0.34, 0.012, 64]} />
                    <meshStandardMaterial 
                        color={config.top} 
                        metalness={0.9} 
                        roughness={0.1} 
                    />
                </mesh>
                {/* Mavi Desen Efekti - Daha İnce ve Zarif */}
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.22, 0.3, 64]} /> 
                    <meshStandardMaterial 
                        color={config.glow} 
                        emissive={config.glow} 
                        emissiveIntensity={3} 
                        transparent 
                        opacity={0.8} 
                        wireframe 
                    />
                </mesh>
            </group>

            {/* 5. LIDAR KULESİ */}
            <group position={[0, 0.1, 0]}>
                <mesh castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 0.06, 32]} />
                    <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, 0.031, 0]}>
                    <cylinderGeometry args={[0.082, 0.082, 0.005, 32]} />
                    <meshStandardMaterial color="#444" metalness={1} roughness={0.1} />
                </mesh>
                {/* Simart Logo Detayı */}
                <mesh position={[0, 0.035, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.002, 16]} />
                    <meshStandardMaterial color={config.logo} emissive={config.logo} emissiveIntensity={0.5} />
                </mesh>
            </group>

            {/* YAN FIRÇALAR */}
            <group position={[0.22, -0.07, 0.22]} ref={brushRefL}>
                <mesh position={[0, 0.01, 0]}>
                    <cylinderGeometry args={[0.03, 0.04, 0.02, 16]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
                {[0, 2.1, 4.2].map(r => (
                    <group key={r} rotation={[0, r, 0]}>
                        <mesh position={[0.09, 0, 0]}>
                            <boxGeometry args={[0.18, 0.005, 0.012]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                    </group>
                ))}
            </group>

            <group position={[-0.22, -0.07, 0.22]} ref={brushRefR}>
                <mesh position={[0, 0.01, 0]}>
                    <cylinderGeometry args={[0.03, 0.04, 0.02, 16]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
                {[0, 2.1, 4.2].map(r => (
                    <group key={r} rotation={[0, r, 0]}>
                        <mesh position={[-0.09, 0, 0]}>
                            <boxGeometry args={[0.18, 0.005, 0.012]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                    </group>
                ))}
            </group>
        </group>
    );
}


