import { useMemo } from "react";

export default function Station({ type = "toz" }) {
    // Standart konfigürasyon
    const config = useMemo(() => {
        if (type === "hayir") return { w: 0.3, h: 0.2, d: 0.08, color: "#1a1a1a" };
        return { w: 0.7, h: 1.0, d: 0.35, color: "#222" };
    }, [type]);

    return (
        <group position={[0, 0, -4.7]}>
            {type === "hayir" ? (
                <>
                    {/* İNCE ŞARJ ÜNİTESİ - Görünürlük için milimetrik öne alındı */}
                    <mesh position={[0, config.h / 2, -0.2]}>
                        <boxGeometry args={[config.w, config.h, config.d]} />
                        <meshStandardMaterial color={config.color} roughness={0.3} metalness={0.7} />
                    </mesh>
                    {/* LED - Daha belirgin */}
                    <mesh position={[0, 0.18, -0.155]}>
                        <sphereGeometry args={[0.015, 8, 8]} />
                        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1.5} />
                    </mesh>
                </>
            ) : (
                <>
                    {/* BÜYÜK İSTASYON (Alt Tablalı ve Yuvalı) */}
                    <mesh position={[0, 0.015, config.d / 2]}>
                        <boxGeometry args={[config.w, 0.03, config.d + 0.15]} />
                        <meshStandardMaterial color="#1a1a1a" roughness={1} />
                    </mesh>

                    {/* Ana Gövde (Hole/Boşluklu Yapı) */}
                    <group position={[0, 0, 0]}>
                        <mesh position={[-(config.w / 2 - 0.025), config.h / 2, 0]}>
                            <boxGeometry args={[0.05, config.h, config.d]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.5} />
                        </mesh>
                        <mesh position={[config.w / 2 - 0.025, config.h / 2, 0]}>
                            <boxGeometry args={[0.05, config.h, config.d]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.5} />
                        </mesh>
                        <mesh position={[0, 0.75, 0]}>
                            <boxGeometry args={[config.w - 0.1, 0.5, config.d]} />
                            <meshStandardMaterial color="#282828" roughness={0.2} metalness={0.7} />
                        </mesh>
                        <mesh position={[0, 0.4, 0]}>
                            <boxGeometry args={[config.w - 0.1, 0.3, config.d - 0.02]} />
                            <meshStandardMaterial color="#222222" roughness={0.8} metalness={0.2} />
                        </mesh>
                        <mesh position={[0, config.h / 2, -(config.d / 2 - 0.025)]}>
                            <boxGeometry args={[config.w, config.h, 0.05]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
                        </mesh>
                        <mesh position={[0, config.h + 0.01, 0]}>
                            <boxGeometry args={[config.w + 0.02, 0.03, config.d + 0.02]} />
                            <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
                        </mesh>
                    </group>

                    {/* İstasyon LED */}
                    <mesh position={[0, 0.1, config.d / 2 + 0.01]}>
                        <sphereGeometry args={[0.01, 8, 8]} />
                        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
                    </mesh>
                </>
            )}
        </group>
    );
}