import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function Robot({ posRef, rotRef }) {
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