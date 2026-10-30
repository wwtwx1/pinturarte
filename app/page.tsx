"use client";
import { useState, useEffect } from "react"; // Agregamos useEffect
import { motion, AnimatePresence } from "framer-motion";

const productos = [
  {
    id: 1,
    nombre: "Virgen María con Niño Jesús",
    descripcion: "Figura de yeso pintada a mano con detalles en dorado. Acabado brillante, ideal para regalo o colección religiosa.",
    precio: 15000,
    categoria: "Religiosos",
    imagen: "/img/virgen.jpg" 
  },
  {
    id: 2,
    nombre: "Pesebre Navideño",
    descripcion: "Lindo Pesebre Navideño pintado a mano, con detalles únicos para la decoración de tus fiestas.",
    precio: 12000,
    categoria: "Decoración / Religión",
    imagen: "/img/pesebre.jpg"
  },
  {
    id: 3,
    nombre: "Set Trío de Budas",
    descripcion: "Set de 3 figuras (Ver, Oír, Hablar) con acabados en dorado, plata y cobre. Ideal para decoración y buena energía.",
    precio: 25000,
    categoria: "Decoración",
    imagen: "/img/buda.jpg"
  },
  {
    id: 4,
    nombre: "Ángel San Miguel Arcángel",
    descripcion: "Figura de yeso con alas doradas y detalles en rojo y plata. Una pieza imponente para tu hogar.",
    precio: 18000,
    categoria: "Religiosos",
    imagen: "/img/angel.jpg"
  },
  {
    id: 5,
    nombre: "Nezuko Kamado",
    descripcion: "Estatua coleccionable de Nezuko con su icónico diseño de Demon Slayer. Alta calidad de detalle, ideal para fans y decoración friki.",
    precio: 10000,
    categoria: "Infantil / Anime",
    imagen: "/img/nezuko.jpg"
  }
];

export default function Home() {
  const [carrito, setCarrito] = useState<any[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [vistaActual, setVistaActual] = useState("inicio");
  const [esRegistro, setEsRegistro] = useState(false);
  
  // ESTADO PARA EL BOTÓN DE VOLVER ARRIBA
  const [mostrarBotonArriba, setMostrarBotonArriba] = useState(false);

  // EFECTO PARA DETECTAR EL SCROLL
  useEffect(() => {
    const manejarScroll = () => {
      // Si bajamos más de 300 píxeles, muestra el botón
      if (window.scrollY > 300) {
        setMostrarBotonArriba(true);
      } else {
        setMostrarBotonArriba(false);
      }
    };
    window.addEventListener("scroll", manejarScroll);
    return () => window.removeEventListener("scroll", manejarScroll);
  }, []);

  // FUNCIÓN PARA VOLVER ARRIBA SUAVEMENTE
  const volverArriba = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const agregarAlCarrito = (producto: any) => {
    setCarrito([...carrito, producto]);
    setMostrarCarrito(true);
  };

  const eliminarDelCarrito = (indexAEliminar: number) => {
    const nuevoCarrito = carrito.filter((_, index) => index !== indexAEliminar);
    setCarrito(nuevoCarrito);
  };

  const total = carrito.reduce((sum, item) => sum + item.precio, 0);

  const cambiarVista = (vista: string) => {
    setVistaActual(vista);
    // Hacemos scroll al tope cada vez que cambiamos de página para que no quede a mitad de camino
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col overflow-hidden relative">
      {/* NAVBAR CON LOGO EN IMAGEN */}
      <nav className="bg-black p-2 md:p-4 flex justify-between items-center border-b border-yellow-600/30 sticky top-0 z-50 shadow-lg">
        
        <img 
          src="/img/logo.png" 
          alt="Pinturarte Studio" 
          className="h-16 md:h-20 w-auto object-contain cursor-pointer hover:scale-105 transition"
          onClick={() => cambiarVista("inicio")} 
        />
        
        <div className="flex gap-3 md:gap-6 items-center text-sm md:text-base pr-2">
          <button onClick={() => cambiarVista("inicio")} className={`${vistaActual === 'inicio' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition hidden sm:block`}>Inicio</button>
          <button onClick={() => cambiarVista("catalogo")} className={`${vistaActual === 'catalogo' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition`}>Catálogo</button>
          <button onClick={() => cambiarVista("nosotros")} className={`${vistaActual === 'nosotros' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition hidden sm:block`}>Nosotros</button>
          
          <button 
            onClick={() => { setMostrarLogin(!mostrarLogin); setMostrarCarrito(false); setEsRegistro(false); }}
            className="hover:text-yellow-500 transition font-bold border-l border-zinc-700 pl-3 md:pl-4"
          >
            Mi Cuenta
          </button>

          <button 
            onClick={() => { setMostrarCarrito(!mostrarCarrito); setMostrarLogin(false); }}
            className="bg-yellow-600 text-black px-3 md:px-4 py-2 rounded font-bold hover:bg-yellow-500 transition text-sm md:text-base"
          >
            Carrito ({carrito.length})
          </button>
        </div>
      </nav>

      {/* MODAL DE LOGIN Y REGISTRO */}
      {mostrarLogin && (
        <div className="absolute right-4 top-24 bg-zinc-900 border border-yellow-600 p-6 rounded-lg shadow-2xl w-80 z-50 animate-fade-in">
          <h3 className="text-xl font-bold mb-4 text-yellow-500">
            {esRegistro ? "Crear Cuenta" : "Iniciar Sesión"}
          </h3>
          
          <div className="flex flex-col gap-3 mb-4">
            {esRegistro && (
              <input type="text" placeholder="Nombre completo" className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" />
            )}
            <input type="email" placeholder="Correo electrónico" className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" />
            <input type="password" placeholder="Contraseña" className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" />
          </div>

          <button 
            className="w-full bg-yellow-600 text-black py-2 rounded font-bold hover:bg-yellow-500 transition mb-3" 
            onClick={() => setMostrarLogin(false)}
          >
            {esRegistro ? "Registrarse" : "Ingresar"}
          </button>
          
          <button 
            onClick={() => setEsRegistro(!esRegistro)} 
            className="w-full text-xs text-gray-400 hover:text-white transition underline"
          >
            {esRegistro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate aquí"}
          </button>
        </div>
      )}

      {/* MODAL DEL CARRITO */}
      {mostrarCarrito && (
        <div className="absolute right-4 top-24 bg-zinc-900 border border-yellow-600 p-6 rounded-lg shadow-2xl w-80 z-50 animate-fade-in">
          <h3 className="text-xl font-bold mb-4 text-yellow-500">Tu Carrito</h3>
          {carrito.length === 0 ? (
            <p className="text-gray-400">El carrito está vacío.</p>
          ) : (
            <ul className="mb-4 max-h-60 overflow-y-auto pr-2">
              {carrito.map((item, index) => (
                <li key={index} className="flex justify-between items-center text-sm mb-2 border-b border-zinc-800 pb-2">
                  <span className="w-1/2 truncate">{item.nombre}</span>
                  <span>${item.precio}</span>
                  <button onClick={() => eliminarDelCarrito(index)} className="text-red-500 hover:text-red-400 font-bold ml-2">✕</button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between font-bold text-lg mb-4 text-yellow-500 border-t border-zinc-700 pt-2">
            <span>Total:</span>
            <span>${total}</span>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold transition">Finalizar Compra</button>
          <button onClick={() => setMostrarCarrito(false)} className="w-full mt-2 text-xs text-gray-400 hover:text-white">Cerrar</button>
        </div>
      )}

      {/* CONTENEDOR DE VISTAS CON ANIMACIÓN GLOBAL */}
      <main className="flex-grow flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={vistaActual}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex-grow flex flex-col w-full"
          >
            {/* VISTA: INICIO */}
            {vistaActual === "inicio" && (
              <div className="h-[80vh] flex flex-col justify-center items-center text-center px-4 bg-gradient-to-b from-black to-zinc-900">
                <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Arte en Yeso Pintado a Mano
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">
                  Descubre nuestra colección exclusiva de figuras religiosas, decorativas y de colección. Hechas con dedicación y detalle para darle vida a tus espacios.
                </p>
                <button onClick={() => cambiarVista("catalogo")} className="bg-yellow-600 text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-500 transition transform hover:scale-105 shadow-[0_0_15px_rgba(202,138,4,0.5)]">
                  Ver Catálogo Completo
                </button>
              </div>
            )}

            {/* VISTA: CATÁLOGO */}
            {vistaActual === "catalogo" && (
              <section className="py-12 px-4 max-w-6xl mx-auto w-full">
                <h2 className="text-4xl font-bold text-center mb-12 text-yellow-500">Nuestro Catálogo</h2>
                <div className="flex flex-col gap-8">
                  {productos.map((prod) => (
                    <div key={prod.id} className="flex flex-col md:flex-row bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-yellow-600/50 transition shadow-lg group">
                      <div className="md:w-1/3 h-64 md:h-auto overflow-hidden">
                        <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      </div>
                      <div className="p-6 md:w-2/3 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">{prod.categoria}</span>
                          <h3 className="text-2xl font-bold mt-1 mb-3">{prod.nombre}</h3>
                          <p className="text-gray-400 mb-4">{prod.descripcion}</p>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-3xl font-bold text-yellow-500">${prod.precio}</span>
                          <button onClick={() => agregarAlCarrito(prod)} className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200 transition">
                            Añadir al Carrito
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* VISTA: NOSOTROS */}
            {vistaActual === "nosotros" && (
              <section className="py-20 px-4 max-w-4xl mx-auto text-center w-full">
                <h2 className="text-4xl font-bold mb-8 text-yellow-500">Sobre Pinturarte Studio</h2>
                <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-lg">
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    En <strong className="text-white">Pinturarte Studio</strong> nos apasiona el arte de crear. Cada figura de yeso es moldeada y pintada a mano con dedicación, buscando que cada pieza sea única y de la más alta calidad para decorar tus espacios o regalar en ocasiones especiales.
                  </p>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Atendemos a clientes de todo el país. Si buscas una pieza individual para tu hogar, o si representas a un local, event planner o comercio y necesitas una cotización especial por cantidad, ¡no dudes en contactarnos! Adaptamos nuestros servicios a lo que necesitas.
                  </p>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-black py-8 text-center border-t border-zinc-800 mt-auto z-10">
        <p className="text-gray-500">© 2026 Pinturarte Studio. Todos los derechos reservados.</p>
        <div className="mt-2 flex justify-center gap-4">
          <a href="https://www.instagram.com/pinturartestudio" target="_blank" rel="noreferrer" className="text-yellow-500 hover:text-white transition">Instagram</a>
        </div>
      </footer>

      {/* BOTÓN VOLVER ARRIBA CON ANIMACIÓN */}
      <AnimatePresence>
        {mostrarBotonArriba && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            onClick={volverArriba}
            className="fixed bottom-8 right-8 bg-yellow-600 text-black p-4 rounded-full shadow-[0_0_15px_rgba(202,138,4,0.6)] hover:bg-yellow-500 hover:scale-110 transition z-50 flex items-center justify-center"
            title="Volver arriba"
          >
            {/* Ícono de flecha hacia arriba */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}