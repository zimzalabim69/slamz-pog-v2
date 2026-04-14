
export function Ring({ position, args, color, opacity }: {
  position?: [number, number, number];
  args?: [number, number, number];
  color?: string;
  opacity?: number;
}) {
  return (
    <mesh position={position}>
      <ringGeometry args={args || [0.1, 0.12, 32]} />
      <meshBasicMaterial 
        color={color || "#00ffcc"} 
        transparent 
        opacity={opacity || 0.8} 
      />
    </mesh>
  );
}
