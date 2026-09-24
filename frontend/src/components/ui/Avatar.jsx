// Círculo con la foto del barbero, o sus iniciales mientras no haya foto
export default function Avatar({ foto, iniciales, chico = false, className = "" }) {
  return (
    <span className={`avatar ${chico ? "avatar-chico" : ""} ${className}`}>
      {foto ? <img src={foto} alt="" /> : iniciales}
    </span>
  );
}
