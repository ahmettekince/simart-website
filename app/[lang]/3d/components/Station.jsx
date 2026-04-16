import { useMemo } from "react";

export default function Station({ type = "toz" }) {
    // TEK TİP STANDART ŞIMART İSTASYONU (Standardized)
    const config = useMemo(() => {
        if (type === "hayir") return { w: 0.4, h: 0.15, d: 0.3, color: "#111", details: false };
        // Tüm istasyonlar (Toz veya Hepsi) aynı standart boyutta ve renkte
        return { w: 0.7, h: 1.0, d: 0.5, color: "#181818", details: true }; 
    }, [type]);

    return <group position={[0, 0, -4.7]}>
        {/* ALT TABAN */}
        <mesh position={[0, 0.015, config.d / 2]}>
            <boxGeometry args={[config.w + 0.1, 0.03, config.d + 0.2]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
        </mesh>
        {/* ANA GÖVDE (Yansıtıcı hale getirildi) */}
        <mesh position={[0, config.h / 2, 0]}>
            <boxGeometry args={[config.w, config.h, config.d]} />
            <meshStandardMaterial 
                color={config.color} 
                roughness={0.2} 
                metalness={0.8} 
            />
        </mesh>
        {/* ÜST KAPAK (Ayna Efekti) */}
        <mesh position={[0, config.h + 0.02, 0]}>
            <boxGeometry args={[config.w + 0.02, 0.05, config.d + 0.02]} />
            <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.1} />
        </mesh>

        {config.details && type === "hepsi" && (
            <>
                <mesh position={[0, config.h / 2, config.d / 2 + 0.005]}>
                    <boxGeometry args={[0.02, config.h - 0.2, 0.01]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
                <mesh position={[0, config.h - 0.1, config.d / 2]}>
                    <boxGeometry args={[config.w - 0.1, 0.01, 0.01]} />
                    <meshStandardMaterial color="#34495e" />
                </mesh>
            </>
        )}

        <mesh position={[0, 0.1, config.d / 2 + 0.01]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
        </mesh>
    </group>;
}