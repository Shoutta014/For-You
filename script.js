// =====================================================
//  FLORES PARA TI 🌷
// =====================================================

// ---------- LIENZO ----------
const canvas = document.getElementById("lienzo");
const ctx = canvas.getContext("2d");

// Medidas de la pantalla (se calculan en prepararEscena)
let ancho, alto, escala, baseX, baseY, nudoY;

let estrellas = [];
let pasto = [];
let arbustos = [];
let particulas = [];

let inicio = null;          // el momento en que ella toca el botón
let tituloMostrado = false;
let ultimoTiempo = 0;

// ---------- EL RAMO ----------
// dx: qué tan a la izquierda (-) o derecha (+) está la flor
// dy: qué tan arriba de la base está la flor
// Las de más arriba van primero para que queden atrás.
const flores = [
  { tipo: "daisy",   dx: -45,  dy: 565, tamano: 36 },
  { tipo: "daisy",   dx: 55,   dy: 550, tamano: 36 },
  { tipo: "daisy",   dx: -150, dy: 515, tamano: 28 },
  { tipo: "daisy",   dx: 160,  dy: 505, tamano: 28 },
  { tipo: "peonia",  dx: 0,    dy: 470, tamano: 54 },
  { tipo: "peonia",  dx: -110, dy: 420, tamano: 48 },
  { tipo: "peonia",  dx: 115,  dy: 430, tamano: 48 },
  { tipo: "daisy",   dx: -230, dy: 425, tamano: 40 },
  { tipo: "daisy",   dx: 235,  dy: 435, tamano: 40 },
  { tipo: "tulipan", dx: -120, dy: 300, tamano: 58, color: "amarillo" },
  { tipo: "tulipan", dx: 125,  dy: 310, tamano: 58, color: "rosa" },
  { tipo: "tulipan", dx: 0,    dy: 335, tamano: 58, color: "morado" },
  { tipo: "tulipan", dx: -205, dy: 320, tamano: 60, color: "rojo" },
  { tipo: "tulipan", dx: 210,  dy: 330, tamano: 60, color: "rojo" }
];

// Colores de los tulipanes
const coloresTulipan = {
  rojo:     { oscuro: "#9b1d2a", claro: "#e63946", frente: "#ff6b6b", halo: "255, 80, 90" },
  rosa:     { oscuro: "#a3195b", claro: "#f2559b", frente: "#ff8fc0", halo: "255, 110, 180" },
  amarillo: { oscuro: "#c77d00", claro: "#ffbe0b", frente: "#ffd60a", halo: "255, 210, 60" },
  morado:   { oscuro: "#5a189a", claro: "#9d4edd", frente: "#c77dff", halo: "180, 110, 255" }
};

// Ramitas de relleno: lavanda (botoncitos de un lado y otro) y helechos (hojitas en pares)
const ramas = [
  { tipo: "lavanda", dx: -120, dy: 615, color: "#c13cff", tallo: "#8e44ad", largo: 20, desde: 0.5,  paso: 0.06 },
  { tipo: "lavanda", dx: 130,  dy: 605, color: "#e05cff", tallo: "#8e44ad", largo: 20, desde: 0.5,  paso: 0.06 },
  { tipo: "lavanda", dx: -195, dy: 560, color: "#e05cff", tallo: "#8e44ad", largo: 19, desde: 0.55, paso: 0.06 },
  { tipo: "lavanda", dx: 200,  dy: 550, color: "#c13cff", tallo: "#8e44ad", largo: 19, desde: 0.55, paso: 0.06 },
  { tipo: "helecho", dx: -185, dy: 205, color: "#2a9d8f", tallo: "#2a9d8f", largo: 32, desde: 0.35, paso: 0.08 },
  { tipo: "helecho", dx: 190,  dy: 215, color: "#2a9d8f", tallo: "#2a9d8f", largo: 32, desde: 0.35, paso: 0.08 },
  { tipo: "helecho", dx: -60,  dy: 250, color: "#3a9d6a", tallo: "#3a7d44", largo: 26, desde: 0.45, paso: 0.09 },
  { tipo: "helecho", dx: 65,   dy: 245, color: "#3a9d6a", tallo: "#3a7d44", largo: 26, desde: 0.45, paso: 0.09 }
];

// Hojas grandes que salen detrás del ramo (ángulo en grados, -90 = hacia arriba)
const follaje = [
  { angulo: -150, largo: 150, color: "#2a9d8f" },
  { angulo: -125, largo: 200, color: "#3a7d44" },
  { angulo: -100, largo: 180, color: "#2f6f4e" },
  { angulo: -80,  largo: 185, color: "#2a9d8f" },
  { angulo: -55,  largo: 200, color: "#3a7d44" },
  { angulo: -30,  largo: 150, color: "#2f6f4e" }
];

// =====================================================
//  PREPARAR LA ESCENA (al inicio y si cambia el tamaño)
// =====================================================
function prepararEscena() {
  // Para que se vea nítido en celulares con pantallas de alta densidad
  const dpr = window.devicePixelRatio || 1;
  ancho = window.innerWidth;
  alto = window.innerHeight;

  canvas.width = ancho * dpr;
  canvas.height = alto * dpr;
  canvas.style.width = ancho + "px";
  canvas.style.height = alto + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // escala: qué tan grande se dibuja el ramo según la pantalla
  escala = Math.min(ancho / 620, alto / 820);
  baseX = ancho / 2;
  baseY = alto - 30 * escala;
  nudoY = baseY - 70 * escala;

  // Estrellas
  estrellas = [];
  for (let i = 0; i < 180; i++) {
    estrellas.push({
      x: Math.random() * ancho,
      y: Math.random() * alto,
      radio: Math.random() * 1.5 + 0.5,
      fase: Math.random() * Math.PI * 2
    });
  }

  // Pasto
  pasto = [];
  const cantidadPasto = Math.floor(ancho / 9);
  for (let i = 0; i < cantidadPasto; i++) {
    pasto.push({
      x: Math.random() * ancho,
      alto: (30 + Math.random() * 90) * escala,
      inclinacion: (Math.random() - 0.5) * 40 * escala,
      fase: Math.random() * Math.PI * 2,
      color: ["#2a1045", "#3d1a66", "#5b2a8f"][Math.floor(Math.random() * 3)]
    });
  }

  // Arbustos oscuros al pie del ramo (muchos círculos amontonados)
  arbustos = [];
  const centros = [
    { x: baseX - 150 * escala, r: 75 },
    { x: baseX + 160 * escala, r: 70 },
    { x: baseX, r: 60 },
    { x: ancho * 0.08, r: 55 },
    { x: ancho * 0.92, r: 55 }
  ];
  for (const centro of centros) {
    for (let i = 0; i < 14; i++) {
      const angulo = Math.random() * Math.PI;
      const distancia = Math.random() * centro.r * escala;
      arbustos.push({
        x: centro.x + Math.cos(angulo) * distancia,
        y: alto - Math.sin(angulo) * distancia * 0.8,
        radio: (18 + Math.random() * 14) * escala
      });
    }
  }

  // Lucecitas flotantes
  particulas = [];
  for (let i = 0; i < 40; i++) {
    particulas.push({
      x: Math.random() * ancho,
      y: Math.random() * alto,
      radio: 1 + Math.random() * 2,
      velocidad: 10 + Math.random() * 25,
      fase: Math.random() * Math.PI * 2,
      color: ["255, 214, 102", "255, 143, 192", "200, 160, 255"][Math.floor(Math.random() * 3)]
    });
  }
}

// =====================================================
//  AYUDANTES
// =====================================================
function limitar(valor) {
  // Deja el número entre 0 y 1
  return Math.max(0, Math.min(1, valor));
}

function suavizar(x) {
  // Empieza rápido y frena suave al final
  return 1 - Math.pow(1 - x, 3);
}

function rebote(x) {
  // Como suavizar, pero se pasa un poquito y regresa (efecto "boing")
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function puntoEnCurva(x1, y1, cx, cy, x2, y2, t) {
  const a = (1 - t) * (1 - t);
  const b = 2 * (1 - t) * t;
  const c = t * t;

  return {
    x: a * x1 + b * cx + c * x2,
    y: a * y1 + b * cy + c * y2
  };
}

// Hacia dónde "apunta" la curva en un punto (para acomodar hojitas a lo largo)
function direccionEnCurva(x1, y1, cx, cy, x2, y2, t) {
  const dx = 2 * (1 - t) * (cx - x1) + 2 * t * (x2 - cx);
  const dy = 2 * (1 - t) * (cy - y1) + 2 * t * (y2 - cy);
  return Math.atan2(dy, dx);
}

// =====================================================
//  FIGURAS BÁSICAS
// =====================================================
function dibujarCirculo(x, y, radio, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radio, 0, Math.PI * 2);
  ctx.fill();
}

// Un resplandor suave detrás de las cosas (el "glow" de tus referencias)
function dibujarHalo(x, y, radio, rgb, alfa) {
  const halo = ctx.createRadialGradient(x, y, 0, x, y, radio);
  halo.addColorStop(0, `rgba(${rgb}, ${alfa})`);
  halo.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, radio, 0, Math.PI * 2);
  ctx.fill();
}

// Hoja con punta (dos curvas) y una nervadura en el centro
function dibujarHoja(x, y, angulo, largo, color) {
  if (largo <= 0) return;
  const anchoHoja = largo * 0.4;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angulo);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(largo * 0.5, -anchoHoja, largo, 0);
  ctx.quadraticCurveTo(largo * 0.5, anchoHoja, 0, 0);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = Math.max(1, largo * 0.03);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(largo * 0.85, 0);
  ctx.stroke();

  ctx.restore();
}

// =====================================================
//  LAS FLORES
// =====================================================
function dibujarDaisy(x, y, tamano) {
  const cantidad = 17;

  dibujarHalo(x, y, tamano * 1.8, "255, 255, 255", 0.22);

  ctx.save();
  ctx.translate(x, y);

  // Pétalos
  for (let i = 0; i < cantidad; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 / cantidad) * i);

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#dcdcdc";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.ellipse(tamano * 0.6, 0, tamano * 0.6, tamano * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Centro
  const degradado = ctx.createRadialGradient(0, 0, 0, 0, 0, tamano * 0.35);
  degradado.addColorStop(0, "#ffe066");
  degradado.addColorStop(1, "#f4a300");

  ctx.fillStyle = degradado;
  ctx.beginPath();
  ctx.arc(0, 0, tamano * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function dibujarPeonia(x, y, tamano) {
  const capas = [
    { cantidad: 8, largo: 1.0, color: "#e75480" },
    { cantidad: 7, largo: 0.75, color: "#f06b9a" },
    { cantidad: 6, largo: 0.5, color: "#f78fb3" },
    { cantidad: 5, largo: 0.3, color: "#ffc2d6" }
  ];

  dibujarHalo(x, y, tamano * 1.7, "255, 120, 170", 0.3);

  ctx.save();
  ctx.translate(x, y);

  for (let c = 0; c < capas.length; c++) {
    const capa = capas[c];

    for (let i = 0; i < capa.cantidad; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 / capa.cantidad) * i + c * 0.4);

      ctx.fillStyle = capa.color;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1;

      const r = tamano * capa.largo * 0.5;
      ctx.beginPath();
      ctx.ellipse(r, 0, r, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  ctx.restore();
}

// giro: cuánto se inclina el tulipán para seguir a su tallo (0 = derecho)
function dibujarTulipan(x, y, tamano, nombreColor, giro) {
  const colores = coloresTulipan[nombreColor] || coloresTulipan.rojo;
  const w = tamano * 0.6;
  const h = tamano * 1.2;

  // El brillo va en el centro de la copa, que también está inclinada
  dibujarHalo(x + Math.sin(giro) * h * 0.5, y - Math.cos(giro) * h * 0.5,
    tamano * 1.6, colores.halo, 0.3);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(giro);

  // Pétalos de atrás (la copa con 3 puntas)
  const degradado = ctx.createLinearGradient(0, 0, 0, -h);
  degradado.addColorStop(0, colores.oscuro);
  degradado.addColorStop(1, colores.claro);
  ctx.fillStyle = degradado;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-w, -h * 0.1, -w, -h * 0.8, -w * 0.6, -h);
  ctx.lineTo(-w * 0.3, -h * 0.75);
  ctx.lineTo(0, -h);
  ctx.lineTo(w * 0.3, -h * 0.75);
  ctx.lineTo(w * 0.6, -h);
  ctx.bezierCurveTo(w, -h * 0.8, w, -h * 0.1, 0, 0);
  ctx.fill();

  // Pétalo de enfrente
  ctx.fillStyle = colores.frente;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-w * 0.6, -h * 0.3, -w * 0.4, -h * 0.8, 0, -h);
  ctx.bezierCurveTo(w * 0.4, -h * 0.8, w * 0.6, -h * 0.3, 0, 0);
  ctx.fill();

  ctx.restore();
}

// =====================================================
//  TALLOS, MOÑO Y FOLLAJE
// =====================================================

// ---- La forma del tallo: una curva con DOS imanes (bezier cúbica) ----
// Sale derecho hacia arriba (pasa por el moño), se abre hacia su lado
// y al final se vuelve a enderezar hacia arriba, como un ramo de verdad.
function formaTallo(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;   // negativo, porque la flor está más arriba
  return {
    a: { x: x1, y: y1 },                        // inicio (la base)
    b: { x: x1, y: y1 + dy * 0.35 },            // imán 1: derecho arriba de la base
    c: { x: x2 - dx * 0.3, y: y2 - dy * 0.35 }, // imán 2: debajo de la flor
    d: { x: x2, y: y2 }                         // final (la flor)
  };
}

function puntoCubico(f, t) {
  const u = 1 - t;
  return {
    x: u * u * u * f.a.x + 3 * u * u * t * f.b.x + 3 * u * t * t * f.c.x + t * t * t * f.d.x,
    y: u * u * u * f.a.y + 3 * u * u * t * f.b.y + 3 * u * t * t * f.c.y + t * t * t * f.d.y
  };
}

// Hacia dónde apunta el tallo en el punto t (0 = base, 1 = flor)
function direccionCubica(f, t) {
  const u = 1 - t;
  const dx = 3 * u * u * (f.b.x - f.a.x) + 6 * u * t * (f.c.x - f.b.x) + 3 * t * t * (f.d.x - f.c.x);
  const dy = 3 * u * u * (f.b.y - f.a.y) + 6 * u * t * (f.c.y - f.b.y) + 3 * t * t * (f.d.y - f.c.y);
  return Math.atan2(dy, dx);
}

// progreso va de 0 (no ha salido) a 1 (tallo completo)
function dibujarTallo(x1, y1, x2, y2, progreso) {
  if (progreso <= 0) return;
  const forma = formaTallo(x1, y1, x2, y2);

  // El tallo se dibuja en 30 pedacitos rectos, solo hasta donde va creciendo
  ctx.strokeStyle = "#3a7d44";
  ctx.lineWidth = Math.max(2, 4 * escala);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const pasos = 30;
  for (let i = 1; i <= pasos; i++) {
    const p = puntoCubico(forma, (i / pasos) * progreso);
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // Hojas: salen cuando el tallo ya pasó por su punto,
  // una hacia cada lado, siguiendo la dirección del tallo
  const hojas = [
    { t: 0.45, lado: -1 },
    { t: 0.62, lado: 1 }
  ];
  for (const hoja of hojas) {
    if (progreso > hoja.t) {
      const crecimiento = limitar((progreso - hoja.t) / 0.25);
      const p = puntoCubico(forma, hoja.t);
      const angulo = direccionCubica(forma, hoja.t) + hoja.lado * 0.8;
      dibujarHoja(p.x, p.y, angulo, 22 * escala * suavizar(crecimiento), "#4caf50");
    }
  }
}

// Ramita de lavanda o helecho que crece desde la base
function dibujarRama(rama, x1, y1, x2, y2, progreso) {
  if (progreso <= 0) return;
  const cx = x1;
  const cy = (y1 + y2) / 2;

  // El tallito
  ctx.strokeStyle = rama.tallo;
  ctx.lineWidth = Math.max(1.5, 2.5 * escala);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 1; i <= 30; i++) {
    const p = puntoEnCurva(x1, y1, cx, cy, x2, y2, (i / 30) * progreso);
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // Las hojitas, desde "rama.desde" hasta la punta
  let numero = 0;
  for (let t = rama.desde; t <= 1.001; t += rama.paso) {
    if (progreso < t) break;
    numero++;

    const p = puntoEnCurva(x1, y1, cx, cy, x2, y2, t);
    const direccion = direccionEnCurva(x1, y1, cx, cy, x2, y2, t);
    const crecimiento = suavizar(limitar((progreso - t) / 0.15));
    // Más pequeñas hacia la punta
    const largo = rama.largo * escala * (1 - (t - rama.desde) * 0.6) * crecimiento;

    if (rama.tipo === "lavanda") {
      const lado = numero % 2 === 0 ? 1 : -1;
      dibujarHoja(p.x, p.y, direccion + lado * 0.6, largo, rama.color);
    } else {
      dibujarHoja(p.x, p.y, direccion + 1.0, largo, rama.color);
      dibujarHoja(p.x, p.y, direccion - 1.0, largo, rama.color);
    }
  }
}

function dibujarMono(x, y, tamano) {
  if (tamano <= 0) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#ff4d9d";
  ctx.strokeStyle = "#c2185b";
  ctx.lineWidth = Math.max(1, 2 * escala);

  // Tiras que cuelgan
  ctx.beginPath();
  ctx.moveTo(-tamano * 0.1, 0);
  ctx.lineTo(-tamano * 0.6, tamano * 1.1);
  ctx.lineTo(-tamano * 0.3, tamano * 1.0);
  ctx.closePath();
  ctx.moveTo(tamano * 0.1, 0);
  ctx.lineTo(tamano * 0.6, tamano * 1.1);
  ctx.lineTo(tamano * 0.3, tamano * 1.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Las dos orejas del moño
  ctx.beginPath();
  ctx.ellipse(-tamano * 0.5, 0, tamano * 0.5, tamano * 0.28, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(tamano * 0.5, 0, tamano * 0.5, tamano * 0.28, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // El nudo
  ctx.fillStyle = "#e0157a";
  ctx.beginPath();
  ctx.arc(0, 0, tamano * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function dibujarFollaje(tiempo, progreso) {
  for (let i = 0; i < follaje.length; i++) {
    const hoja = follaje[i];
    const viento = Math.sin(tiempo / 1500 + i) * 0.04;
    const angulo = hoja.angulo * Math.PI / 180 + viento;
    dibujarHoja(baseX, nudoY, angulo, hoja.largo * escala * progreso, hoja.color);
  }
}

// =====================================================
//  EL RAMO COMPLETO (con su animación de crecimiento)
// =====================================================
// t = segundos desde que ella tocó el botón
function dibujarRamo(tiempo, t) {
  // 1. Hojas grandes de atrás
  dibujarFollaje(tiempo, suavizar(limitar(t / 1.5)));

  // Dónde está cada flor ahora (con un vaivén suave por el viento)
  // y hacia dónde apunta la punta de su tallo
  const posiciones = [];
  for (let i = 0; i < flores.length; i++) {
    const flor = flores[i];
    const viento = Math.sin(tiempo / 1600 + i) * 5 * escala;
    const x = baseX + flor.dx * escala + viento;
    const y = baseY - flor.dy * escala;
    const inicioX = baseX + (i - (flores.length - 1) / 2) * 2 * escala;
    const forma = formaTallo(inicioX, baseY, x, y);

    posiciones.push({
      x: x,
      y: y,
      inicioX: inicioX,
      // +90° porque las flores se dibujan "mirando hacia arriba"
      giro: direccionCubica(forma, 1) + Math.PI / 2
    });
  }

  // 2. Ramitas de relleno (lavanda y helechos)
  for (let i = 0; i < ramas.length; i++) {
    const rama = ramas[i];
    const progreso = suavizar(limitar((t - 0.5 - i * 0.15) / 1.8));
    const viento = Math.sin(tiempo / 1400 + i * 2) * 4 * escala;
    const inicioX = baseX + (i - (ramas.length - 1) / 2) * 1.5 * escala;
    dibujarRama(rama, inicioX, baseY,
      baseX + rama.dx * escala + viento, baseY - rama.dy * escala, progreso);
  }

  // 3. Tallos (cada flor empieza un poquito después que la anterior)
  for (let i = 0; i < flores.length; i++) {
    const retraso = 0.3 + i * 0.18;
    const progreso = suavizar(limitar((t - retraso) / 1.6));
    dibujarTallo(posiciones[i].inicioX, baseY, posiciones[i].x, posiciones[i].y, progreso);
  }

  // 4. El moño que amarra el ramo
  dibujarMono(baseX, nudoY, 34 * escala * rebote(limitar((t - 0.8) / 0.8)));

  // 5. Las flores se abren cuando su tallo ya casi llegó
  for (let i = 0; i < flores.length; i++) {
    const flor = flores[i];
    const retraso = 0.3 + i * 0.18;
    const apertura = limitar((t - retraso - 1.3) / 1.1);
    if (apertura <= 0) continue;

    const tamano = flor.tamano * escala * rebote(apertura);
    const { x, y, giro } = posiciones[i];

    if (flor.tipo === "daisy") {
      dibujarDaisy(x, y, tamano);
    } else if (flor.tipo === "peonia") {
      dibujarPeonia(x, y, tamano);
    } else if (flor.tipo === "tulipan") {
      dibujarTulipan(x, y, tamano, flor.color, giro);
    }
  }
}

// =====================================================
//  FONDO, ESTRELLAS, PASTO Y LUCECITAS
// =====================================================
function dibujarFondo() {
  // Cielo morado: casi negro arriba, violeta abajo
  const degradado = ctx.createLinearGradient(0, 0, 0, alto);
  degradado.addColorStop(0, "#0a0318");
  degradado.addColorStop(0.55, "#1c0938");
  degradado.addColorStop(1, "#38105e");
  ctx.fillStyle = degradado;
  ctx.fillRect(0, 0, ancho, alto);

  // Resplandor violeta detrás del ramo, y uno rosado más pequeño encima
  dibujarHalo(baseX, alto * 0.65, Math.max(ancho, alto) * 0.55, "160, 80, 255", 0.22);
  dibujarHalo(baseX, alto * 0.55, Math.max(ancho, alto) * 0.3, "255, 77, 157", 0.08);
}

function dibujarArbustos() {
  for (const hoja of arbustos) {
    const degradado = ctx.createRadialGradient(
      hoja.x - hoja.radio * 0.3, hoja.y - hoja.radio * 0.3, 0,
      hoja.x, hoja.y, hoja.radio
    );
    degradado.addColorStop(0, "#4a1d73");
    degradado.addColorStop(1, "#1c0833");
    ctx.fillStyle = degradado;
    ctx.beginPath();
    ctx.arc(hoja.x, hoja.y, hoja.radio, 0, Math.PI * 2);
    ctx.fill();
  }
}

function dibujarEstrellas(tiempo) {
  for (const estrella of estrellas) {
    const brillo = (Math.sin(tiempo / 500 + estrella.fase) + 1) / 2;
    ctx.globalAlpha = brillo;
    dibujarCirculo(estrella.x, estrella.y, estrella.radio, "white");
  }
  ctx.globalAlpha = 1;
}

function dibujarPasto(tiempo) {
  for (const brizna of pasto) {
    const viento = Math.sin(tiempo / 1200 + brizna.fase) * 6 * escala;
    const puntaX = brizna.x + brizna.inclinacion + viento;
    const puntaY = alto - brizna.alto;
    const grosor = 3 * escala + 1;

    ctx.fillStyle = brizna.color;
    ctx.beginPath();
    ctx.moveTo(brizna.x - grosor, alto);
    ctx.quadraticCurveTo(brizna.x - grosor * 0.5, alto - brizna.alto * 0.5, puntaX, puntaY);
    ctx.quadraticCurveTo(brizna.x + grosor * 0.5, alto - brizna.alto * 0.5, brizna.x + grosor, alto);
    ctx.fill();
  }
}

function dibujarParticulas(tiempo, dt) {
  for (const p of particulas) {
    // Suben despacito y se mecen de lado a lado
    p.y -= p.velocidad * dt;
    p.x += Math.sin(tiempo / 1000 + p.fase) * 0.3;

    // Cuando salen por arriba, vuelven a empezar desde abajo
    if (p.y < -10) {
      p.y = alto + 10;
      p.x = Math.random() * ancho;
    }

    const brillo = 0.5 + 0.5 * Math.sin(tiempo / 400 + p.fase);
    dibujarHalo(p.x, p.y, p.radio * 5, p.color, 0.45 * brillo);
    dibujarCirculo(p.x, p.y, p.radio * 0.8, `rgba(${p.color}, ${brillo})`);
  }
}

// =====================================================
//  ANIMACIÓN
// =====================================================
function animar(tiempo) {
  const dt = Math.min((tiempo - ultimoTiempo) / 1000, 0.05);
  ultimoTiempo = tiempo;

  dibujarFondo();
  dibujarEstrellas(tiempo);
  dibujarArbustos();
  dibujarPasto(tiempo);

  if (inicio !== null) {
    const t = (tiempo - inicio) / 1000;
    dibujarRamo(tiempo, t);

    // Cuando todas las flores se abrieron, aparece el mensaje
    if (!tituloMostrado && t > 5.2) {
      document.getElementById("titulo").classList.add("visible");
      tituloMostrado = true;
    }
  }

  dibujarParticulas(tiempo, dt);
  requestAnimationFrame(animar);
}

// =====================================================
//  ARRANQUE
// =====================================================
document.getElementById("boton").addEventListener("click", () => {
  document.getElementById("portada").classList.add("oculta");
  inicio = performance.now();
});

window.addEventListener("resize", prepararEscena);

prepararEscena();
requestAnimationFrame(animar);