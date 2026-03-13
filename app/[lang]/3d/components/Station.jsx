export default function Station() {
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