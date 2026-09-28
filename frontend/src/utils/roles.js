// Los roles vienen en el usuario que devuelve el login (y viajan en el token).
// En el frontend solo sirven para decidir QUÉ MOSTRAR: el que decide qué se puede
// HACER es el backend (verificarRol + dueño del recurso).
export const tieneRol = (usuario, ...roles) => !!usuario?.roles?.some((r) => roles.includes(r));
export const esStaff = (usuario) => tieneRol(usuario, "barbero", "admin");
export const esAdmin = (usuario) => tieneRol(usuario, "admin");
