"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const productos = [
  {
    id: 1,
    nombre: "Virgen María con Niño Jesús",
    descripcion: "Figura de yeso pintada a mano con detalles en dorado. Acabado brillante, ideal para regalo o colección religiosa.",
    precio: 15000, // Poné los números sin puntos acá
    categoria: "Religiosos",
    imagen: "/img/virgen.jpg" 
  },
  {
    id: 2,
    nombre: "Pesebre Navideño",
    descripcion: "Lindo Pesebre Navideño pintado a mano, con detalles únicos para la decoración de tus fiestas.",
    precio: 400000,
    categoria: "Infantil / Religión",
    imagen: "/img/pesebre.jpg"
  },
  {
    id: 3,
    nombre: "Set Trío de Budas",
    descripcion: "Set de 3 figuras (Ver, Oír, Hablar) con acabados en dorado, plata y cobre. Ideal para decoración y buena energía.",
    precio: 150000,
    categoria: "Decoración",
    imagen: "/img/buda.jpg"
  },
  {
    id: 4,
    nombre: "Ángel San Miguel Arcángel",
    descripcion: "Figura de yeso con alas doradas y detalles en rojo y plata. Una pieza imponente para tu hogar.",
    precio: 180000, // EJEMPLO: Acá va el precio sin puntos
    categoria: "Religiosos",
    imagen: "/img/angel.jpg"
  },
  {
    id: 5,
    nombre: "Nezuko Kamado",
    descripcion: "Estatua coleccionable de Nezuko con su icónico diseño de Demon Slayer. Alta calidad de detalle, ideal para fans y decoración friki.",
    precio: 60000,
    categoria: "Infantil / Anime",
    imagen: "/img/nezuko.jpg"
  }
];

// Función para formatear precios con puntos de miles
const formatearPrecio = (precio: number) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precio);
};

export default function Home() {
  const [carrito, setCarrito] = useState<any[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [vistaActual, setVistaActual] = useState("inicio");
  const [esRegistro, setEsRegistro] = useState(false);
  const [mostrarBotonArriba, setMostrarBotonArriba] = useState(false);
  
  // Estado para el formulario de contacto simulado
  const [mensajeEnviado, setMensajeEnviado] = useState(false);

  useEffect(() => {
    const manejarScroll = () => {
      if (window.scrollY > 300) setMostrarBotonArriba(true);
      else setMostrarBotonArriba(false);
    };
    window.addEventListener("scroll", manejarScroll);
    return () => window.removeEventListener("scroll", manejarScroll);
  }, []);

  const volverArriba = () => window.scrollTo({ top: 0, behavior: "smooth" });

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
    setMensajeEnviado(false); // Resetea el form al cambiar de pestaña
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col overflow-hidden relative">
      
      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <a 
        href="https://wa.me/573147376561" // CAMBIAR POR EL NÚMERO REAL (Código de país + área + número, sin 0 ni 15)
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-8 left-8 bg-green-500 text-white p-4 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:bg-green-400 hover:scale-110 transition z-50 flex items-center justify-center"
        title="Contactar por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-7 h-7">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>

      {/* NAVBAR CON LOGO EN IMAGEN */}
      <nav className="bg-black p-2 md:p-4 flex justify-between items-center border-b border-yellow-600/30 sticky top-0 z-40 shadow-lg">
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
          <button onClick={() => cambiarVista("contacto")} className={`${vistaActual === 'contacto' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition hidden sm:block`}>Contacto</button>
          
          <button 
            onClick={() => { setMostrarLogin(!mostrarLogin); setMostrarCarrito(false); setEsRegistro(false); }}
            className="hover:text-yellow-500 transition font-bold border-l border-zinc-700 pl-3 md:pl-4 text-xs sm:text-sm"
          >
            Mi Cuenta
          </button>

          <button 
            onClick={() => { setMostrarCarrito(!mostrarCarrito); setMostrarLogin(false); }}
            className="bg-yellow-600 text-black px-2 md:px-4 py-2 rounded font-bold hover:bg-yellow-500 transition text-xs md:text-base"
          >
            Carrito ({carrito.length})
          </button>
        </div>
      </nav>

      {/* MODAL DE LOGIN Y REGISTRO */}
      {mostrarLogin && (
        <div className="absolute right-4 top-24 bg-zinc-900 border border-yellow-600 p-6 rounded-lg shadow-2xl w-80 z-50 animate-fade-in">
          <h3 className="text-xl font-bold mb-4 text-yellow-500">{esRegistro ? "Crear Cuenta" : "Iniciar Sesión"}</h3>
          <div className="flex flex-col gap-3 mb-4">
            {esRegistro && <input type="text" placeholder="Nombre completo" className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" />}
            <input type="email" placeholder="Correo electrónico" className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" />
            <input type="password" placeholder="Contraseña" className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" />
          </div>
          <button className="w-full bg-yellow-600 text-black py-2 rounded font-bold hover:bg-yellow-500 transition mb-3" onClick={() => setMostrarLogin(false)}>
            {esRegistro ? "Registrarse" : "Ingresar"}
          </button>
          <button onClick={() => setEsRegistro(!esRegistro)} className="w-full text-xs text-gray-400 hover:text-white transition underline">
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
                  <span>{formatearPrecio(item.precio)}</span>
                  <button onClick={() => eliminarDelCarrito(index)} className="text-red-500 hover:text-red-400 font-bold ml-2">✕</button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between font-bold text-lg mb-4 text-yellow-500 border-t border-zinc-700 pt-2">
            <span>Total:</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold transition">Finalizar Compra</button>
          <button onClick={() => setMostrarCarrito(false)} className="w-full mt-2 text-xs text-gray-400 hover:text-white">Cerrar</button>
        </div>
      )}

      {/* CONTENEDOR DE VISTAS */}
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
                <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Arte en Yeso Pintado a Mano</h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">Descubre nuestra colección exclusiva de figuras religiosas, decorativas, anime y de colección. Hechas con dedicación y detalle para darle vida a tus espacios.</p>
                <button onClick={() => cambiarVista("catalogo")} className="bg-yellow-600 text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-500 transition transform hover:scale-105 shadow-[0_0_15px_rgba(202,138,4,0.5)]">Ver Catálogo Completo</button>
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
                          <span className="text-3xl font-bold text-yellow-500">{formatearPrecio(prod.precio)}</span>
                          <button onClick={() => agregarAlCarrito(prod)} className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200 transition">Añadir al Carrito</button>
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
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">En <strong className="text-white">Pinturarte Studio</strong> nos apasiona el arte de crear. Cada figura de yeso es moldeada y pintada a mano con dedicación, buscando que cada pieza sea única y de la más alta calidad para decorar tus espacios o regalar en ocasiones especiales.</p>
                  <p className="text-gray-300 text-lg leading-relaxed">Atendemos a clientes de todo el país. Si buscas una pieza individual para tu hogar, o si representas a un local, event planner o comercio y necesitas una cotización especial por cantidad, ¡no dudes en contactarnos! Adaptamos nuestros servicios a lo que necesitas.</p>
                </div>
              </section>
            )}

            {/* VISTA: CONTACTO */}
            {vistaActual === "contacto" && (
              <section className="py-20 px-4 max-w-2xl mx-auto text-center w-full">
                <h2 className="text-4xl font-bold mb-8 text-yellow-500">Contacto</h2>
                <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-lg">
                  {mensajeEnviado ? (
                    <div className="text-center py-10">
                      <h3 className="text-2xl font-bold text-green-500 mb-2">¡Mensaje Enviado!</h3>
                      <p className="text-gray-400">Gracias por escribirnos. Nos pondremos en contacto a la brevedad.</p>
                      <button onClick={() => setMensajeEnviado(false)} className="mt-6 text-yellow-500 hover:text-white underline">Enviar otro mensaje</button>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); setMensajeEnviado(true); }} className="flex flex-col gap-4 text-left">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre completo</label>
                        <input required type="text" className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" placeholder="Tu nombre" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Correo Electrónico</label>
                        <input required type="email" className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" placeholder="tu@email.com" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Mensaje</label>
                        <textarea required rows={4} className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" placeholder="¿En qué te podemos ayudar?"></textarea>
                      </div>
                      <button type="submit" className="bg-yellow-600 text-black py-3 rounded font-bold hover:bg-yellow-500 transition mt-2">Enviar Mensaje</button>
                    </form>
                  )}
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

      {/* BOTÓN VOLVER ARRIBA */}
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}