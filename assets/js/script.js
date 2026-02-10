// ========================================
// CONFIGURACION INICIAL
// ========================================

// Utilidades DOM
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const addClass = (el, ...classes) => el?.classList.add(...classes);
const removeClass = (el, ...classes) => el?.classList.remove(...classes);
const toggleClass = (el, className) => el?.classList.toggle(className);
const hasClass = (el, className) => el?.classList.contains(className);

// Utilidades de mensajes
const createMessage = (type, text) => {
    const colors = {
        error: 'color: #ef4444',
        success: 'color: #10b981; font-weight: bold',
        info: 'color: #6366f1'
    };
    return `<p style="${colors[type] || ''}">${text}</p>`;
};

// Esperar a que el DOM este completamente cargado
document.addEventListener('DOMContentLoaded', inicializarApp);

// Variables globales
let temaActual = localStorage.getItem('tema') || 'light';
let preguntaActualQuiz = 1;
let respuestasCorrectasQuiz = 0;
let pasoActualEjemplo = 0;
let intervaloAnimacion = null;

// ========================================
// INICIALIZACION
// ========================================

function inicializarApp() {
    configurarTema();
    configurarNavegacion();
    configurarAcordeon();
    configurarPestanas();
    configurarEjemplosInteractivos();
    configurarQuiz();
    configurarAnimacionesScroll();
}

// ========================================
// TEMA OSCURO/CLARO
// ========================================

function configurarTema() {
    const botonTema = document.getElementById('botonTema');
    const iconoSol = botonTema.querySelector('.icono-sol');
    const iconoLuna = botonTema.querySelector('.icono-luna');

    // Aplicar tema guardado
    if (temaActual === 'dark') {
        document.documentElement.classList.add('dark');
        if (iconoSol) iconoSol.classList.add('hidden');
        if (iconoLuna) iconoLuna.classList.remove('hidden');
    }

    // Evento para cambiar tema
    botonTema.addEventListener('click', () => {
        temaActual = temaActual === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('tema', temaActual);

        // Toggle iconos
        if (iconoSol) iconoSol.classList.toggle('hidden');
        if (iconoLuna) iconoLuna.classList.toggle('hidden');
    });
}

// ========================================
// NAVEGACION
// ========================================

function configurarNavegacion() {
    const menuHamburguesa = $('#menuHamburguesa');
    const menuNav = $('#menuNav');
    const navegacion = $('#navegacion');

    if (!menuHamburguesa || !menuNav) return;

    // Toggle menu movil con ARIA
    menuHamburguesa.addEventListener('click', () => {
        const isOpen = hasClass(menuNav, 'activo');
        toggleClass(menuNav, 'activo');
        toggleClass(menuHamburguesa, 'activo');
        menuHamburguesa.setAttribute('aria-expanded', !isOpen);
    });

    // Delegacion de eventos para cerrar menu al hacer clic en un enlace
    menuNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            removeClass(menuNav, 'activo');
            removeClass(menuHamburguesa, 'activo');
            menuHamburguesa.setAttribute('aria-expanded', 'false');
        }
    });

    // Efecto de navegacion al hacer scroll (throttled)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
            navegacion.style.boxShadow = window.scrollY > 100
                ? '0 4px 20px rgba(0, 0, 0, 0.15)'
                : '0 4px 6px rgba(0, 0, 0, 0.1)';
            scrollTimeout = null;
        }, 50);
    });
}

// ========================================
// ACORDEON
// ========================================

function configurarAcordeon() {
    const contenedorAcordeon = $('#conceptos');
    if (!contenedorAcordeon) return;

    // Delegacion de eventos para acordeon
    contenedorAcordeon.addEventListener('click', (e) => {
        const cabecera = e.target.closest('.cabecera-acordeon');
        if (!cabecera) return;

        const itemAcordeon = cabecera.parentElement;
        const contenido = itemAcordeon.querySelector('.contenido-acordeon');
        const icono = cabecera.querySelector('.icono-acordeon');
        const estaAbierto = !hasClass(contenido, 'hidden');

        // Cerrar todos los acordeones primero
        $$('.contenido-acordeon').forEach(c => {
            addClass(c, 'hidden');
            c.style.maxHeight = '0';
        });
        $$('.cabecera-acordeon').forEach(c => {
            c.setAttribute('aria-expanded', 'false');
        });
        $$('.icono-acordeon').forEach(i => {
            i.style.transform = 'rotate(0deg)';
        });

        // Abrir el acordeon clickeado si no estaba abierto
        if (!estaAbierto) {
            removeClass(contenido, 'hidden');
            contenido.style.maxHeight = contenido.scrollHeight + 'px';
            cabecera.setAttribute('aria-expanded', 'true');
            if (icono) {
                icono.style.transform = 'rotate(180deg)';
            }
        }
    });

    // Inicializar ARIA en todas las cabeceras
    $$('.cabecera-acordeon').forEach(cabecera => {
        cabecera.setAttribute('aria-expanded', 'false');
    });
}

// ========================================
// PESTAÑAS DE EJEMPLOS
// ========================================

function configurarPestanas() {
    const pestanas = document.querySelectorAll('.pestana');
    const contenidosPestana = document.querySelectorAll('.contenido-pestana');

    pestanas.forEach(pestana => {
        pestana.addEventListener('click', () => {
            const ejemploId = pestana.getAttribute('data-ejemplo');

            // Remover clase activa de todas las pestañas y contenidos
            pestanas.forEach(p => {
                p.classList.remove('bg-edu-accent', 'text-white', 'shadow-md');
                p.classList.add('bg-edu-paper', 'dark:bg-edu-dark-surface', 'text-edu-secondary', 'dark:text-gray-300');
            });
            contenidosPestana.forEach(c => {
                c.classList.add('hidden');
                c.classList.remove('activo');
            });

            // Activar pestaña y contenido seleccionados
            pestana.classList.remove('bg-edu-paper', 'dark:bg-edu-dark-surface', 'text-edu-secondary', 'dark:text-gray-300');
            pestana.classList.add('bg-edu-accent', 'text-white', 'shadow-md');

            const contenidoActivo = document.getElementById(ejemploId);
            if (contenidoActivo) {
                contenidoActivo.classList.remove('hidden');
                contenidoActivo.classList.add('activo');
            }
        });
    });
}

// ========================================
// EJEMPLOS INTERACTIVOS
// ========================================

function configurarEjemplosInteractivos() {
    // Área de círculo
    const botonEjecutarArea = document.getElementById('ejecutar-area');
    const botonReiniciarArea = document.getElementById('reiniciar-area');

    if (botonEjecutarArea) {
        botonEjecutarArea.addEventListener('click', ejecutarEjemploArea);
    }

    if (botonReiniciarArea) {
        botonReiniciarArea.addEventListener('click', reiniciarEjemploArea);
    }

    // Par o Impar
    const botonParImpar = document.getElementById('ejecutar-par-impar');
    if (botonParImpar) {
        botonParImpar.addEventListener('click', ejecutarEjemploParImpar);
    }

    // Suma 1-100
    const botonSuma = document.getElementById('ejecutar-suma');
    if (botonSuma) {
        botonSuma.addEventListener('click', ejecutarEjemploSuma);
    }

    // Mayor de 3
    const botonMayor = document.getElementById('ejecutar-mayor');
    if (botonMayor) {
        botonMayor.addEventListener('click', ejecutarEjemploMayor);
    }

    // Tabla de multiplicar
    const botonTabla = document.getElementById('ejecutar-tabla');
    if (botonTabla) {
        botonTabla.addEventListener('click', ejecutarEjemploTabla);
    }

    // Botones de animación de estructuras
    const botonesAnimar = document.querySelectorAll('.boton-animar');
    botonesAnimar.forEach(boton => {
        boton.addEventListener('click', () => {
            const estructura = boton.getAttribute('data-estructura');
            animarEstructura(estructura, boton);
        });
    });
}

// Ejemplo: Área de círculo con animación paso a paso
function ejecutarEjemploArea() {
    const radio = parseFloat(document.getElementById('input-radio').value);
    const salida = document.getElementById('salida-area');
    const pasos = document.querySelectorAll('#area-circulo .paso-diagrama');

    if (isNaN(radio) || radio <= 0) {
        salida.innerHTML = '<p style="color: #ef4444;">[Error] Por favor ingrese un radio valido (mayor a 0)</p>';
        return;
    }

    pasoActualEjemplo = 0;
    salida.innerHTML = '<p>[Ejecutando] Iniciando ejecucion paso a paso...</p>';

    // Limpiar pasos anteriores
    pasos.forEach(paso => paso.classList.remove('activo'));

    const mensajesPasos = [
        'Paso 1: Inicio del algoritmo',
        'Paso 2: Flujo hacia lectura de datos',
        `Paso 3: Leer radio = ${radio}`,
        'Paso 4: Flujo hacia calculo',
        `Paso 5: Calcular area = 3.1416 x ${radio} x ${radio}`,
        'Paso 6: Flujo hacia salida',
        `Paso 7: Mostrar area = ${(3.1416 * radio * radio).toFixed(2)}`,
        'Paso 8: Flujo hacia fin',
        'Paso 9: Fin del algoritmo'
    ];

    let pasoIndex = 0;

    intervaloAnimacion = setInterval(() => {
        if (pasoIndex < pasos.length) {
            pasos[pasoIndex].classList.add('activo');
            salida.innerHTML += `<p>${mensajesPasos[pasoIndex]}</p>`;
            salida.scrollTop = salida.scrollHeight;
            pasoIndex++;
        } else {
            clearInterval(intervaloAnimacion);
            salida.innerHTML += `<p style="color: #10b981; font-weight: bold;">[Resultado] El area del circulo es ${(3.1416 * radio * radio).toFixed(2)} unidades cuadradas</p>`;
        }
    }, 800);
}

function reiniciarEjemploArea() {
    if (intervaloAnimacion) {
        clearInterval(intervaloAnimacion);
    }
    const pasos = document.querySelectorAll('#area-circulo .paso-diagrama');
    pasos.forEach(paso => paso.classList.remove('activo'));
    document.getElementById('salida-area').innerHTML = '<p class="text-gray-500">Presiona "Ejecutar" para comenzar la simulacion</p>';
}

// Ejemplo: Par o Impar
let intervaloParImpar;
function ejecutarEjemploParImpar() {
    const numero = parseInt(document.getElementById('input-numero').value);
    const salida = document.getElementById('salida-par-impar');
    const contenedor = document.getElementById('par-impar');

    if (isNaN(numero)) {
        salida.innerHTML = '<p style="color: #ef4444;">[Error] Por favor ingrese un numero valido</p>';
        return;
    }

    // Limpiar animacion anterior
    if (intervaloParImpar) clearInterval(intervaloParImpar);
    contenedor.querySelectorAll('.paso-diagrama').forEach(p => p.classList.remove('activo'));

    const resto = numero % 2;
    const esPar = resto === 0;
    const rama = esPar ? 'par' : 'impar';

    salida.innerHTML = '<p>[Ejecutando] Iniciando ejecucion paso a paso...</p>';

    const pasos = [
        { paso: '1', msg: 'Paso 1: Inicio del algoritmo' },
        { paso: '2', msg: 'Paso 2: Flujo hacia entrada' },
        { paso: '3', msg: `Paso 3: Leer num = ${numero}` },
        { paso: '4', msg: 'Paso 4: Flujo hacia decision' },
        { paso: '5', msg: `Paso 5: num % 2 = ${resto}. Es igual a 0? ${esPar ? 'Si' : 'No'}` },
        { paso: `6-${rama}`, msg: `Paso 6: Rama ${esPar ? 'Verdadera' : 'Falsa'}` },
        { paso: `7-${rama}`, msg: `Paso 7: Mostrar "${esPar ? 'PAR' : 'IMPAR'}"` },
        { paso: '8', msg: 'Paso 8: Fin del algoritmo' }
    ];

    let i = 0;
    intervaloParImpar = setInterval(() => {
        if (i < pasos.length) {
            const p = pasos[i];
            contenedor.querySelectorAll(`[data-paso="${p.paso}"]`).forEach(el => el.classList.add('activo'));
            salida.innerHTML += `<p>${p.msg}</p>`;
            salida.scrollTop = salida.scrollHeight;
            i++;
        } else {
            clearInterval(intervaloParImpar);
            salida.innerHTML += `<p style="color: ${esPar ? '#10b981' : '#f59e0b'}; font-weight: bold; font-size: 1.2rem;">[Resultado] El numero ${numero} es ${esPar ? 'PAR' : 'IMPAR'}</p>`;
        }
    }, 700);
}

// Ejemplo: Suma 1-100
let intervaloSuma;
function ejecutarEjemploSuma() {
    const salida = document.getElementById('salida-suma');
    const progreso = document.getElementById('progreso-suma');
    const contenedor = document.getElementById('suma-1-100');

    // Limpiar animacion anterior
    if (intervaloSuma) clearInterval(intervaloSuma);
    contenedor.querySelectorAll('.paso-diagrama').forEach(p => p.classList.remove('activo'));

    salida.innerHTML = '<p>Paso 1: Iniciando suma de 1 a 100...</p>';
    progreso.innerHTML = '';

    // Primero animar pasos iniciales
    const pasosIniciales = ['1', '2', '3', '4', '5', '6', '7'];
    let pasoIdx = 0;

    const animarInicio = setInterval(() => {
        if (pasoIdx < 5) {
            contenedor.querySelectorAll(`[data-paso="${pasosIniciales[pasoIdx]}"]`).forEach(el => el.classList.add('activo'));
            if (pasoIdx === 0) salida.innerHTML += '<p>Paso 2: Inicio del algoritmo</p>';
            if (pasoIdx === 1) salida.innerHTML += '<p>Paso 3: suma = 0</p>';
            if (pasoIdx === 2) salida.innerHTML += '<p>Paso 4: FOR: i = 1 hasta 100</p>';
            pasoIdx++;
        } else {
            clearInterval(animarInicio);
            // Ahora hacer el bucle
            let suma = 0;
            let i = 1;
            contenedor.querySelectorAll('[data-paso="6"]').forEach(el => el.classList.add('activo'));
            contenedor.querySelectorAll('[data-paso="7"]').forEach(el => el.classList.add('activo'));
            contenedor.querySelectorAll('[data-paso="8"]').forEach(el => el.classList.add('activo'));

            intervaloSuma = setInterval(() => {
                if (i <= 100) {
                    suma += i;
                    if (i % 10 === 0 || i === 1) {
                        salida.innerHTML += `<p>[Iteracion ${i}] suma = ${suma}</p>`;
                        salida.scrollTop = salida.scrollHeight;
                    }
                    progreso.innerHTML = `<p>Progreso: ${i}/100 | Suma actual: ${suma}</p>`;
                    i++;
                } else {
                    clearInterval(intervaloSuma);
                    contenedor.querySelectorAll('[data-paso="9"]').forEach(el => el.classList.add('activo'));
                    contenedor.querySelectorAll('[data-paso="10"]').forEach(el => el.classList.add('activo'));
                    contenedor.querySelectorAll('[data-paso="11"]').forEach(el => el.classList.add('activo'));
                    salida.innerHTML += '<p>Paso 5: Salida: suma = 5050</p>';
                    salida.innerHTML += `<p style="color: #10b981; font-weight: bold; font-size: 1.2rem;">[Resultado] La suma de 1 a 100 es ${suma}</p>`;
                    progreso.innerHTML = '<p style="color: #10b981;">[Completado] Proceso finalizado</p>';
                }
            }, 30);
        }
    }, 500);
}

// Ejemplo: Mayor de 3 numeros
let intervaloMayor;
function ejecutarEjemploMayor() {
    const a = parseFloat(document.getElementById('input-a').value);
    const b = parseFloat(document.getElementById('input-b').value);
    const c = parseFloat(document.getElementById('input-c').value);
    const salida = document.getElementById('salida-mayor');
    const contenedor = document.getElementById('mayor-3');

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        salida.innerHTML = '<p style="color: #ef4444;">[Error] Por favor ingrese tres numeros validos</p>';
        return;
    }

    // Limpiar animacion anterior
    if (intervaloMayor) clearInterval(intervaloMayor);
    contenedor.querySelectorAll('.paso-diagrama').forEach(p => p.classList.remove('activo'));

    salida.innerHTML = '<p>[Ejecutando] Iniciando comparacion...</p>';

    // Determinar el camino y resultado
    let mayor, rama;
    if (a >= b && a >= c) {
        mayor = a;
        rama = 'a';
    } else if (b >= c) {
        mayor = b;
        rama = 'b';
    } else {
        mayor = c;
        rama = 'c';
    }

    const pasos = [
        { paso: '1', msg: 'Paso 1: Inicio del algoritmo' },
        { paso: '2', msg: 'Paso 2: Flujo hacia entrada' },
        { paso: '3', msg: `Paso 3: Leer A=${a}, B=${b}, C=${c}` },
        { paso: '4', msg: 'Paso 4: Flujo hacia decision' },
        { paso: '5', msg: `Paso 5: A >= B Y A >= C? ${rama === 'a' ? 'Si' : 'No'}` }
    ];

    if (rama === 'a') {
        pasos.push({ paso: '6-a', msg: 'Paso 6: Rama Verdadera' });
        pasos.push({ paso: '7-a', msg: 'Paso 7: mayor = A' });
        pasos.push({ paso: '8-a', msg: 'Paso 8: Hacia convergencia' });
    } else {
        pasos.push({ paso: '6-bc', msg: 'Paso 6: Rama Falsa' });
        pasos.push({ paso: '7-bc', msg: `Paso 7: B >= C? ${rama === 'b' ? 'Si' : 'No'}` });
        if (rama === 'b') {
            pasos.push({ paso: '8-b', msg: 'Paso 8: Rama Verdadera' });
            pasos.push({ paso: '9-b', msg: 'Paso 9: mayor = B' });
        } else {
            pasos.push({ paso: '8-c', msg: 'Paso 8: Rama Falsa' });
            pasos.push({ paso: '9-c', msg: 'Paso 9: mayor = C' });
        }
    }
    pasos.push({ paso: '10', msg: 'Paso 10: Convergencia' });
    pasos.push({ paso: '11', msg: `Paso 11: mayor = ${mayor}` });
    pasos.push({ paso: '12', msg: 'Paso 12: Flujo hacia fin' });
    pasos.push({ paso: '13', msg: 'Paso 13: Fin del algoritmo' });

    let i = 0;
    intervaloMayor = setInterval(() => {
        if (i < pasos.length) {
            const p = pasos[i];
            contenedor.querySelectorAll(`[data-paso="${p.paso}"]`).forEach(el => el.classList.add('activo'));
            salida.innerHTML += `<p>${p.msg}</p>`;
            salida.scrollTop = salida.scrollHeight;
            i++;
        } else {
            clearInterval(intervaloMayor);
            salida.innerHTML += `<p class="text-green-500 dark:text-green-400 font-bold text-xl">[Resultado] El numero mayor es: ${mayor}</p>`;
        }
    }, 600);
}

// Ejemplo: Tabla de multiplicar
let intervaloTabla;
function ejecutarEjemploTabla() {
    const numero = parseInt(document.getElementById('input-tabla').value);
    const salida = document.getElementById('salida-tabla');
    const contenedor = document.getElementById('tabla-multiplicar');

    if (isNaN(numero) || numero < 1 || numero > 20) {
        salida.innerHTML = '<p class="text-red-500 dark:text-red-400">[Error] Por favor ingrese un numero entre 1 y 20</p>';
        return;
    }

    // Limpiar animacion anterior
    if (intervaloTabla) clearInterval(intervaloTabla);
    contenedor.querySelectorAll('.paso-diagrama').forEach(p => p.classList.remove('activo'));

    salida.innerHTML = '<p>Paso 1: Iniciando tabla de multiplicar...</p>';

    // Animar pasos iniciales
    const pasosIniciales = ['1', '2', '3', '4', '5'];
    let pasoIdx = 0;

    const animarInicio = setInterval(() => {
        if (pasoIdx < 5) {
            contenedor.querySelectorAll(`[data-paso="${pasosIniciales[pasoIdx]}"]`).forEach(el => el.classList.add('activo'));
            if (pasoIdx === 0) salida.innerHTML += '<p>Paso 2: Inicio del algoritmo</p>';
            if (pasoIdx === 2) salida.innerHTML += `<p>Paso 3: Leer numero = ${numero}</p>`;
            if (pasoIdx === 4) salida.innerHTML += '<p>Paso 4: FOR: i = 1 hasta 10</p>';
            pasoIdx++;
        } else {
            clearInterval(animarInicio);
            // Activar elementos del bucle
            contenedor.querySelectorAll('[data-paso="6"]').forEach(el => el.classList.add('activo'));
            contenedor.querySelectorAll('[data-paso="7"]').forEach(el => el.classList.add('activo'));
            contenedor.querySelectorAll('[data-paso="8"]').forEach(el => el.classList.add('activo'));
            contenedor.querySelectorAll('[data-paso="9"]').forEach(el => el.classList.add('activo'));
            contenedor.querySelectorAll('[data-paso="10"]').forEach(el => el.classList.add('activo'));

            salida.innerHTML += `<p class="font-bold text-indigo-500 dark:text-indigo-400">Tabla de multiplicar del ${numero}</p><p class="text-gray-500 dark:text-gray-400">------------------------</p>`;

            let i = 1;
            intervaloTabla = setInterval(() => {
                if (i <= 10) {
                    const resultado = numero * i;
                    salida.innerHTML += `<p>${numero} x ${i} = ${resultado}</p>`;
                    salida.scrollTop = salida.scrollHeight;
                    i++;
                } else {
                    clearInterval(intervaloTabla);
                    contenedor.querySelectorAll('[data-paso="11"]').forEach(el => el.classList.add('activo'));
                    salida.innerHTML += `<p class="text-gray-500 dark:text-gray-400">------------------------</p><p class="text-green-500 dark:text-green-400">Paso 5: Tabla finalizada</p>`;
                }
            }, 200);
        }
    }, 500);
}

// Animar estructuras de control
function animarEstructura(estructura, boton) {
    const textoOriginal = boton.textContent;
    boton.textContent = 'Animando...';
    boton.disabled = true;

    setTimeout(() => {
        boton.textContent = textoOriginal;
        boton.disabled = false;
        alert(`Animacion de ${estructura} completada. En una version completa, aqui se animaria el flujo del diagrama.`);
    }, 2000);
}

// ========================================
// QUIZ INTERACTIVO
// ========================================

function configurarQuiz() {
    const opcionesQuiz = document.querySelectorAll('.opcion-quiz');
    const botonSiguiente = document.querySelector('.boton-siguiente-quiz');
    const botonReiniciar = document.querySelector('.boton-reiniciar-quiz');

    // Deshabilitar botón siguiente inicialmente
    if (botonSiguiente) {
        botonSiguiente.disabled = true;
    }

    // Configurar opciones de respuesta
    opcionesQuiz.forEach(opcion => {
        opcion.addEventListener('click', () => {
            verificarRespuestaQuiz(opcion);
        });
    });

    // Botón siguiente
    if (botonSiguiente) {
        botonSiguiente.addEventListener('click', siguientePreguntaQuiz);
    }

    // Botón reiniciar
    if (botonReiniciar) {
        botonReiniciar.addEventListener('click', reiniciarQuiz);
    }
}

function verificarRespuestaQuiz(opcionSeleccionada) {
    const preguntaActual = document.querySelector('.pregunta-quiz.activa');
    const opciones = preguntaActual.querySelectorAll('.opcion-quiz');
    const retroalimentacion = preguntaActual.querySelector('.retroalimentacion-quiz');
    const botonSiguiente = document.querySelector('.boton-siguiente-quiz');
    const esCorrecta = opcionSeleccionada.getAttribute('data-correcta') === 'true';

    // Deshabilitar todas las opciones
    opciones.forEach(opcion => {
        opcion.disabled = true;

        // Mostrar respuesta correcta
        if (opcion.getAttribute('data-correcta') === 'true') {
            opcion.classList.add('bg-emerald-100', 'dark:bg-emerald-900/30', 'border-emerald-500', 'text-emerald-700', 'dark:text-emerald-300');
            opcion.classList.remove('border-gray-200', 'dark:border-gray-700');
        }
    });

    // Marcar respuesta seleccionada si es incorrecta
    if (!esCorrecta) {
        opcionSeleccionada.classList.add('bg-red-100', 'dark:bg-red-900/30', 'border-red-500', 'text-red-700', 'dark:text-red-300');
        opcionSeleccionada.classList.remove('border-gray-200', 'dark:border-gray-700');
        retroalimentacion.innerHTML = '<p class="text-red-600 dark:text-red-400 font-medium flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Incorrecto. La respuesta correcta está marcada en verde.</p>';
    } else {
        respuestasCorrectasQuiz++;
        retroalimentacion.innerHTML = '<p class="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ¡Correcto! Excelente respuesta.</p>';
    }

    // Habilitar botón siguiente
    botonSiguiente.disabled = false;
}

function siguientePreguntaQuiz() {
    const preguntaActual = document.querySelector('.pregunta-quiz.activa');
    const siguientePregunta = preguntaActual.nextElementSibling;
    const botonSiguiente = document.querySelector('.boton-siguiente-quiz');

    preguntaActual.classList.remove('activa');
    preguntaActual.classList.add('hidden');

    if (siguientePregunta && siguientePregunta.classList.contains('pregunta-quiz')) {
        siguientePregunta.classList.remove('hidden');
        siguientePregunta.classList.add('activa');
        botonSiguiente.disabled = true;
        preguntaActualQuiz++;
    } else {
        // Mostrar resultado final
        mostrarResultadoQuiz();
    }
}

function mostrarResultadoQuiz() {
    const navegacionQuiz = document.querySelector('.navegacion-quiz');
    const resultadoQuiz = document.querySelector('.resultado-quiz');
    const puntuacionFinal = document.querySelector('.puntuacion-final');

    navegacionQuiz.style.display = 'none';
    resultadoQuiz.classList.remove('hidden');
    resultadoQuiz.classList.add('activo');

    const porcentaje = (respuestasCorrectasQuiz / 5) * 100;
    let mensaje = '';
    let calificacion = '';

    if (porcentaje === 100) {
        mensaje = 'Excelente. Dominas completamente los diagramas de flujo.';
        calificacion = 'Sobresaliente';
    } else if (porcentaje >= 80) {
        mensaje = 'Muy bien. Tienes un excelente conocimiento.';
        calificacion = 'Notable';
    } else if (porcentaje >= 60) {
        mensaje = 'Buen trabajo, pero puedes mejorar.';
        calificacion = 'Aprobado';
    } else {
        mensaje = 'Sigue practicando para mejorar tus resultados.';
        calificacion = 'En progreso';
    }

    puntuacionFinal.innerHTML = `
        <p class="text-2xl font-bold text-edu-primary dark:text-white mb-4">${calificacion}</p>
        <p class="text-lg">Obtuviste <strong class="text-indigo-600 dark:text-indigo-400">${respuestasCorrectasQuiz} de 5</strong> respuestas correctas</p>
        <p class="text-lg">Puntuacion: <strong class="text-indigo-600 dark:text-indigo-400">${porcentaje}%</strong></p>
        <p class="mt-2 text-gray-600 dark:text-gray-300">${mensaje}</p>
    `;
}

function reiniciarQuiz() {
    // Reiniciar variables
    preguntaActualQuiz = 1;
    respuestasCorrectasQuiz = 0;

    // Ocultar resultado
    const resultadoQuiz = document.querySelector('.resultado-quiz');
    const navegacionQuiz = document.querySelector('.navegacion-quiz');
    resultadoQuiz.classList.remove('activo');
    resultadoQuiz.classList.add('hidden');
    navegacionQuiz.style.display = 'block';

    // Reiniciar preguntas
    const preguntas = document.querySelectorAll('.pregunta-quiz');
    preguntas.forEach((pregunta, index) => {
        const opciones = pregunta.querySelectorAll('.opcion-quiz');
        const retroalimentacion = pregunta.querySelector('.retroalimentacion-quiz');

        // Limpiar opciones
        opciones.forEach(opcion => {
            opcion.disabled = false;
            opcion.classList.remove('bg-emerald-100', 'dark:bg-emerald-900/30', 'border-emerald-500', 'text-emerald-700', 'dark:text-emerald-300', 'bg-red-100', 'dark:bg-red-900/30', 'border-red-500', 'text-red-700', 'dark:text-red-300');
            opcion.classList.add('border-gray-200', 'dark:border-gray-700');
        });

        // Limpiar retroalimentación
        retroalimentacion.innerHTML = '';

        // Mostrar primera pregunta
        if (index === 0) {
            pregunta.classList.add('activa');
            pregunta.classList.remove('hidden');
        } else {
            pregunta.classList.remove('activa');
            pregunta.classList.add('hidden');
        }
    });

    // Deshabilitar botón siguiente
    const botonSiguiente = document.querySelector('.boton-siguiente-quiz');
    botonSiguiente.disabled = true;
}

// ========================================
// ANIMACIONES AL HACER SCROLL
// ========================================

function configurarAnimacionesScroll() {
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.style.opacity = '1';
                entrada.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    // Observar tarjetas y elementos
    const elementos = document.querySelectorAll('.bg-edu-paper, .item-acordeon, .tarjeta-simbolo, .tarjeta-estructura');
    elementos.forEach(elemento => {
        elemento.style.opacity = '0';
        elemento.style.transform = 'translateY(30px)';
        elemento.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observador.observe(elemento);
    });
}

// ========================================
// UTILIDADES
// ========================================

// Función para scroll suave (fallback para navegadores antiguos)
function scrollSuave(objetivo) {
    const elemento = document.querySelector(objetivo);
    if (elemento) {
        elemento.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Detectar si el usuario prefiere modo oscuro
function detectarPreferenciaTema() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Inicializar tema basado en preferencia del sistema si no hay preferencia guardada
if (!localStorage.getItem('tema')) {
    temaActual = detectarPreferenciaTema();
    localStorage.setItem('tema', temaActual);
}

// Log de inicializacion
console.log('[DiagramasFlujo] Aplicacion inicializada correctamente');
console.log('[DiagramasFlujo] Tema actual:', temaActual);
console.log('[DiagramasFlujo] Todos los modulos cargados');
