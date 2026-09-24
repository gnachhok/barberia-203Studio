import { useEffect, useState } from "react";
import { api, mensajeDeError } from "../api/client";

// Hace un GET a `url` y devuelve { data, error, cargando, recargar }.
// Si url es null no pide nada (sirve para "todavía no tengo los datos para pedir").
// Si la url cambia, pide de nuevo; y si llega tarde la respuesta de una url
// vieja, se ignora (flag `vigente`), así no pisa datos nuevos con viejos.
export function useApi(url) {
  const [res, setRes] = useState({ url: null, data: null, error: null });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!url) return;
    let vigente = true;
    api.get(url)
      .then((r) => vigente && setRes({ url, data: r.data, error: null }))
      .catch((e) => vigente && setRes({ url, data: null, error: mensajeDeError(e) }));
    return () => { vigente = false; };
  }, [url, intento]);

  // "cargando" no es un estado aparte: se deduce de si la respuesta que tenemos es de esta url
  const esDeEstaUrl = res.url === url;
  return {
    data: esDeEstaUrl ? res.data : null,
    error: esDeEstaUrl ? res.error : null,
    cargando: !!url && !esDeEstaUrl,
    recargar: () => { setRes((r) => ({ ...r, url: null })); setIntento((n) => n + 1); },
  };
}
