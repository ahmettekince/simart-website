import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";

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

    // TEK TİP ŞIMART SİYAHI ROBOT (Standardized)
    const config = {
        body: "#1a1a1a",
        top: "#000000",
        sensor: "#111",
        detail: "#3c81b5"
    };

    return (
        <group ref={g}>
            {/* ANA GÖVDE */}
            <mesh castShadow>
                <cylinderGeometry args={[0.35, 0.35, 0.1, 32]} />
                <meshStandardMaterial color={config.body} roughness={0.4} />
            </mesh>

            {/* ÜST KAPAK */}
            <mesh position={[0, 0.052, 0]}>
                <cylinderGeometry args={[0.33, 0.33, 0.01, 32]} />
                <meshStandardMaterial
                    color={config.top}
                    metalness={0.7}
                    roughness={0.2}
                />
            </mesh>

            {/* LIDAR KULESİ */}
            <group position={[0, 0.08, 0]}>
                <mesh castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
                    <meshStandardMaterial color={config.sensor} metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, 0.026, 0]}>
                    <cylinderGeometry args={[0.082, 0.082, 0.005, 16]} />
                    <meshStandardMaterial color={config.detail} metalness={1} roughness={0} />
                </mesh>
            </group>

            {/* BUTONLAR */}
            <mesh position={[0.1, 0.06, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.02, 0.04, 4, 8]} />
                <meshStandardMaterial color={config.detail} />
            </mesh>

            {/* YAN FIRÇALAR */}
            <group position={[0.22, -0.046, 0.22]} ref={brushRefL}>
                <mesh position={[0, 0.01, 0]}>
                    <cylinderGeometry args={[0.03, 0.04, 0.02, 16]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
                {[0, 2.1, 4.2].map(r => (
                    <group key={r} rotation={[0, r, 0]}>
                        <mesh position={[0.09, 0, 0]}>
                            <boxGeometry args={[0.18, 0.01, 0.012]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                    </group>
                ))}
            </group>

            <group position={[-0.22, -0.046, 0.22]} ref={brushRefR}>
                <mesh position={[0, 0.01, 0]}>
                    <cylinderGeometry args={[0.03, 0.04, 0.02, 16]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
                {[0, 2.1, 4.2].map(r => (
                    <group key={r} rotation={[0, r, 0]}>
                        <mesh position={[-0.09, 0, 0]}>
                            <boxGeometry args={[0.18, 0.01, 0.012]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                    </group>
                ))}
            </group>
        </group>
    );
}

