import { useMemo } from "react";

export default function Station({ type = "toz" }) {
    const config = useMemo(() => {
        if (type === "hayir") return { w: 0.4, h: 0.15, d: 0.3, color: "#222", details: false };
        if (type === "hepsi") return { w: 1.0, h: 1.2, d: 0.6, color: "#1a1a1a", details: true };
        return { w: 0.7, h: 1.0, d: 0.5, color: "#1a1a1a", details: true }; // "toz"
    }, [type]);

    return <group position={[0, 0, -4.7]}>
        <mesh position={[0, 0.015, config.d / 2]}>
            <boxGeometry args={[config.w + 0.1, 0.03, config.d + 0.2]} />
            <meshStandardMaterial color="#222" roughness={0.4} />
        </mesh>
        <mesh position={[0, config.h / 2, 0]}>
            <boxGeometry args={[config.w, config.h, config.d]} />
            <meshStandardMaterial color={config.color} roughness={0.4} />
        </mesh>
        <mesh position={[0, config.h + 0.02, 0]}>
            <boxGeometry args={[config.w + 0.02, 0.05, config.d + 0.02]} />
            <meshStandardMaterial color="#222" metalness={0.5} />
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