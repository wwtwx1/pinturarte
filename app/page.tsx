"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabase";

const formatearPrecio = (precio: number) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precio);
};

// CORREO DEL ADMINISTRADOR
const ADMIN_EMAIL = "xpipeyt@gmail.com"; 

// DATOS DE LA SECCIÓN NOSOTROS
const seccionesNosotros = [
  {
    id: "quienes",
    titulo: "¿Quiénes somos?",
    contenido: "En Pinturarte Studio creemos que el arte tiene el poder de transformar lo sencillo en algo extraordinario.\n\nSomos un emprendimiento creativo dedicado al arte y la pintura artesanal de figuras de yeso, donde cada pieza se convierte en una oportunidad para expresar imaginación, creatividad y emociones.\n\nNos apasiona dar vida a cada figura a través del color, los detalles y el trabajo hecho a mano. Creamos piezas únicas, personalizadas y llenas de encanto, pensadas para decorar, regalar, coleccionar y convertirse en recuerdos especiales.\n\nTambién nos dedicamos a la restauración artesanal, devolviéndoles vida y belleza a aquellas piezas que merecen una nueva oportunidad.\n\nMás que crear figuras, queremos ofrecer experiencias, despertar la creatividad y compartir la magia del arte hecho a mano.\n\nEn Pinturarte Studio, cada figura cuenta una historia pintada a mano. 🎨💜"
  },
  {
    id: "mision",
    titulo: "Nuestra Misión",
    contenido: "En Pinturarte Studio tenemos como misión transformar figuras de yeso en pequeñas obras de arte, a través de la creatividad, la dedicación y el amor por los detalles.\n\nBuscamos ofrecer productos artesanales, personalizados y de calidad que transmitan emociones, despierten la imaginación y permitan a cada persona disfrutar del arte de una manera especial.\n\nQueremos que cada creación lleve consigo algo más que color: una historia, un sentimiento y un recuerdo."
  },
  {
    id: "vision",
    titulo: "Nuestra Visión",
    contenido: "Ser una marca reconocida por su creatividad, calidad y pasión por el arte artesanal, convirtiéndonos en un referente en la pintura y personalización de figuras de yeso.\n\nAspiramos a crecer, innovar y llegar a más personas, llevando la magia del arte hecho a mano a nuevos espacios y creando experiencias que inspiren, conecten y permanezcan en el corazón de nuestros clientes.\n\nQueremos que Pinturarte Studio sea recordado no solo por sus creaciones, sino por las emociones y recuerdos que cada una representa."
  }
];

export default function Home() {
  const [productos, setProductos] = useState<any[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  
  const [carrito, setCarrito] = useState<any[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [vistaActual, setVistaActual] = useState("inicio");
  
  const [vistaAuth, setVistaAuth] = useState("login"); 
  const [mostrarBotonArriba, setMostrarBotonArriba] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorAuth, setErrorAuth] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [mensajeEnviado, setMensajeEnviado] = useState(false);

  // Estados para el panel de administrador
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", descripcion: "", precio: "", categoria: "Religiosos", imagen: "/img/virgen.jpg" });
  const [editandoPrecio, setEditandoPrecio] = useState<{ id: number, precio: string } | null>(null);

  // Estado para el acordeón de "Nosotros" (Inicia en null para que esté cerrado)
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(null);

  const cargarProductos = async () => {
    const { data, error } = await supabase.from('productos').select('*').order('id');
    if (data) setProductos(data);
    if (error) console.error("Error cargando productos:", error);
  };

  useEffect(() => {
    cargarProductos();
    
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUsuario(session?.user || null);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const manejarScroll = () => {
      if (window.scrollY > 300) setMostrarBotonArriba(true);
      else setMostrarBotonArriba(false);
    };
    window.addEventListener("scroll", manejarScroll);
    return () => window.removeEventListener("scroll", manejarScroll);
  }, []);

  const manejarAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setErrorAuth("");
    setMensajeExito("");

    if (vistaAuth === "registro") {
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { nombre_completo: nombreCompleto } }
      });
      if (error) setErrorAuth(error.message);
      else {
        setMensajeExito("¡Cuenta creada! Revisa tu correo electrónico para confirmar.");
      }
    } else if (vistaAuth === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErrorAuth(error.message);
      else setMostrarLogin(false);
    } else if (vistaAuth === "recuperar") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setErrorAuth(error.message);
      else setMensajeExito("Te hemos enviado un correo para restablecer tu contraseña.");
    }
    setCargando(false);
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    if (vistaActual === "admin") setVistaActual("inicio");
  };

  const crearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('productos').insert([{
      nombre: nuevoProducto.nombre,
      descripcion: nuevoProducto.descripcion,
      precio: Number(nuevoProducto.precio),
      categoria: nuevoProducto.categoria,
      imagen: nuevoProducto.imagen
    }]);
    if (error) alert("Error al crear: " + error.message);
    else {
      alert("Producto creado exitosamente");
      setNuevoProducto({ nombre: "", descripcion: "", precio: "", categoria: "Religiosos", imagen: "/img/virgen.jpg" });
      cargarProductos();
    }
  };

  const actualizarPrecio = async (id: number, nuevoPrecio: string) => {
    const { error } = await supabase.from('productos').update({ precio: Number(nuevoPrecio) }).eq('id', id);
    if (error) alert("Error al actualizar: " + error.message);
    else {
      setEditandoPrecio(null);
      cargarProductos();
    }
  };

  const eliminarProducto = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (error) alert("Error al eliminar: " + error.message);
      else cargarProductos();
    }
  };

  const volverArriba = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const agregarAlCarrito = (producto: any) => {
    setCarrito([...carrito, producto]);
    setMostrarCarrito(true);
  };
  const eliminarDelCarrito = (indexAEliminar: number) => {
    setCarrito(carrito.filter((_, index) => index !== indexAEliminar));
  };
  const total = carrito.reduce((sum, item) => sum + Number(item.precio), 0);
  
  const cambiarVista = (vista: string) => {
    setVistaActual(vista);
    setMensajeEnviado(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const esAdmin = usuario?.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col overflow-hidden relative">
      
      {/* BOTONES FLOTANTES */}
      <a href="https://www.instagram.com/pinturartestudio" target="_blank" rel="noreferrer" className="fixed bottom-24 left-8 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white p-4 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.6)] hover:scale-110 transition z-50 flex items-center justify-center" title="Instagram">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      </a>
      <a href="https://wa.me/573147376561" target="_blank" rel="noreferrer" className="fixed bottom-8 left-8 bg-green-500 text-white p-4 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:bg-green-400 hover:scale-110 transition z-50 flex items-center justify-center" title="WhatsApp">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-7 h-7"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
      </a>

      {/* NAVBAR */}
      <nav className="bg-black p-2 md:p-4 flex justify-between items-center border-b border-yellow-600/30 sticky top-0 z-40 shadow-lg">
        <img src="/img/logo.png" alt="Pinturarte Studio" className="h-16 md:h-20 w-auto object-contain cursor-pointer hover:scale-105 transition" onClick={() => cambiarVista("inicio")} />
        
        <div className="flex gap-3 md:gap-6 items-center text-sm md:text-base pr-2">
          <button onClick={() => cambiarVista("inicio")} className={`${vistaActual === 'inicio' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition hidden sm:block`}>Inicio</button>
          <button onClick={() => cambiarVista("catalogo")} className={`${vistaActual === 'catalogo' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition`}>Catálogo</button>
          <button onClick={() => cambiarVista("nosotros")} className={`${vistaActual === 'nosotros' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition hidden sm:block`}>Nosotros</button>
          <button onClick={() => cambiarVista("contacto")} className={`${vistaActual === 'contacto' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition hidden sm:block`}>Contacto</button>
          
          {esAdmin && (
            <button onClick={() => cambiarVista("admin")} className={`${vistaActual === 'admin' ? 'text-red-500 font-bold' : 'hover:text-red-500 text-red-400'} transition hidden md:block border border-red-500/30 px-2 rounded`}>Admin</button>
          )}

          {usuario ? (
            <div className="flex items-center gap-3 border-l border-zinc-700 pl-3">
              <span className="text-yellow-500 text-xs hidden md:block">Hola, {usuario.user_metadata?.nombre_completo || 'Cliente'}</span>
              <button onClick={cerrarSesion} className="hover:text-red-500 transition font-bold text-xs sm:text-sm">Salir</button>
            </div>
          ) : (
            <button onClick={() => { setMostrarLogin(!mostrarLogin); setMostrarCarrito(false); setVistaAuth("login"); setErrorAuth(""); setMensajeExito(""); }} className="hover:text-yellow-500 transition font-bold border-l border-zinc-700 pl-3 md:pl-4 text-xs sm:text-sm">Mi Cuenta</button>
          )}

          <button onClick={() => { setMostrarCarrito(!mostrarCarrito); setMostrarLogin(false); }} className="bg-yellow-600 text-black px-2 md:px-4 py-2 rounded font-bold hover:bg-yellow-500 transition text-xs md:text-base">Carrito ({carrito.length})</button>
        </div>
      </nav>

      {/* MODAL DE AUTENTICACIÓN */}
      {mostrarLogin && (
        <div className="absolute right-4 top-24 bg-zinc-900 border border-yellow-600 p-6 rounded-lg shadow-2xl w-80 z-50 animate-fade-in">
          <h3 className="text-xl font-bold mb-4 text-yellow-500">
            {vistaAuth === "login" ? "Iniciar Sesión" : vistaAuth === "registro" ? "Crear Cuenta" : "Recuperar Contraseña"}
          </h3>
          
          {errorAuth && <div className="bg-red-500/20 text-red-400 p-2 rounded mb-3 text-xs">{errorAuth}</div>}
          {mensajeExito && <div className="bg-green-500/20 text-green-400 p-2 rounded mb-3 text-xs">{mensajeExito}</div>}

          <form onSubmit={manejarAuth} className="flex flex-col gap-3 mb-4">
            {vistaAuth === "registro" && (
              <input type="text" placeholder="Nombre completo" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" />
            )}
            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" />
            
            {vistaAuth !== "recuperar" && (
              <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" />
            )}
            
            <button type="submit" disabled={cargando} className="w-full bg-yellow-600 text-black py-2 rounded font-bold hover:bg-yellow-500 transition disabled:opacity-50 mt-2">
              {cargando ? "Procesando..." : vistaAuth === "login" ? "Ingresar" : vistaAuth === "registro" ? "Registrarse" : "Enviar Enlace"}
            </button>
          </form>
          
          <div className="flex flex-col gap-2 text-xs text-gray-400">
            {vistaAuth === "login" && (
              <>
                <button onClick={() => { setVistaAuth("registro"); setErrorAuth(""); setMensajeExito(""); }} className="hover:text-white transition underline text-left">¿No tienes cuenta? Regístrate aquí</button>
                <button onClick={() => { setVistaAuth("recuperar"); setErrorAuth(""); setMensajeExito(""); }} className="hover:text-white transition underline text-left">Olvidé mi contraseña</button>
              </>
            )}
            {vistaAuth !== "login" && (
              <button onClick={() => { setVistaAuth("login"); setErrorAuth(""); setMensajeExito(""); }} className="hover:text-white transition underline text-left">Volver al inicio de sesión</button>
            )}
          </div>
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
          <button onClick={() => alert("¡Próximamente pasarela de pagos!")} className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold transition">Finalizar Compra</button>
          <button onClick={() => setMostrarCarrito(false)} className="w-full mt-2 text-xs text-gray-400 hover:text-white">Cerrar</button>
        </div>
      )}

      {/* VISTAS */}
      <main className="flex-grow flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div key={vistaActual} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="flex-grow flex flex-col w-full">
            
            {vistaActual === "inicio" && (
              <div className="h-[80vh] flex flex-col justify-center items-center text-center px-4 bg-gradient-to-b from-black to-zinc-900">
                <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Arte en Yeso Pintado a Mano</h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">Descubre nuestra colección exclusiva de figuras religiosas, decorativas, anime y de colección. Hechas con dedicación y detalle para darle vida a tus espacios.</p>
                <button onClick={() => cambiarVista("catalogo")} className="bg-yellow-600 text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-500 transition transform hover:scale-105 shadow-[0_0_15px_rgba(202,138,4,0.5)]">Ver Catálogo Completo</button>
              </div>
            )}

            {vistaActual === "catalogo" && (
              <section className="py-12 px-4 max-w-6xl mx-auto w-full">
                <h2 className="text-4xl font-bold text-center mb-12 text-yellow-500">Nuestro Catálogo</h2>
                {productos.length === 0 ? (
                  <p className="text-center text-gray-400">Cargando productos...</p>
                ) : (
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
                            <button onClick={() => agregarAlCarrito(prod)} className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200 transition">Agregar al Carrito</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* VISTA: NOSOTROS CON DISEÑO ACORDEÓN */}
            {vistaActual === "nosotros" && (
              <section className="py-20 px-4 max-w-3xl mx-auto w-full">
                <h2 className="text-4xl font-bold mb-12 text-center text-yellow-500">Sobre Nosotros</h2>
                
                <div className="flex flex-col gap-4">
                  {seccionesNosotros.map((seccion) => (
                    <div key={seccion.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg hover:border-yellow-600/30 transition">
                      <button 
                        onClick={() => setSeccionAbierta(seccionAbierta === seccion.id ? null : seccion.id)}
                        className="w-full p-6 text-left flex justify-between items-center bg-zinc-900 hover:bg-zinc-800/50 transition"
                      >
                        <h3 className="text-2xl font-bold text-yellow-500">{seccion.titulo}</h3>
                        <motion.div animate={{ rotate: seccionAbierta === seccion.id ? 180 : 0 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-yellow-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {seccionAbierta === seccion.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: "auto", opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-0 text-gray-300 leading-relaxed whitespace-pre-line border-t border-zinc-800/50 mt-2">
                              {seccion.contenido}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
                      <div><label className="block text-sm text-gray-400 mb-1">Nombre completo</label><input required type="text" className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" placeholder="Tu nombre" /></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Correo Electrónico</label><input required type="email" className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" placeholder="tu@email.com" /></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Mensaje</label><textarea required rows={4} className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" placeholder="¿En qué te podemos ayudar?"></textarea></div>
                      <button type="submit" className="bg-yellow-600 text-black py-3 rounded font-bold hover:bg-yellow-500 transition mt-2">Enviar Mensaje</button>
                    </form>
                  )}
                </div>
              </section>
            )}

            {/* VISTA: PANEL DE ADMINISTRADOR */}
            {vistaActual === "admin" && esAdmin && (
              <section className="py-12 px-4 max-w-6xl mx-auto w-full">
                <h2 className="text-3xl font-bold mb-8 text-red-500">Panel de Administrador</h2>
                
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-10 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-white">Agregar Nuevo Producto</h3>
                  <form onSubmit={crearProducto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nombre del producto" value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required className="p-2 bg-zinc-800 border border-zinc-700 rounded text-white" />
                    <input type="number" placeholder="Precio (solo números)" value={nuevoProducto.precio} onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})} required className="p-2 bg-zinc-800 border border-zinc-700 rounded text-white" />
                    <input type="text" placeholder="Categoría" value={nuevoProducto.categoria} onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} required className="p-2 bg-zinc-800 border border-zinc-700 rounded text-white" />
                    <input type="text" placeholder="Ruta de la imagen (ej: /img/virgen.jpg)" value={nuevoProducto.imagen} onChange={(e) => setNuevoProducto({...nuevoProducto, imagen: e.target.value})} required className="p-2 bg-zinc-800 border border-zinc-700 rounded text-white" />
                    <textarea placeholder="Descripción" value={nuevoProducto.descripcion} onChange={(e) => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} required className="p-2 bg-zinc-800 border border-zinc-700 rounded text-white md:col-span-2" rows={2}></textarea>
                    <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded md:col-span-2 transition">Guardar Producto</button>
                  </form>
                </div>

                <h3 className="text-xl font-bold mb-4 text-white">Productos Existentes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black text-yellow-500 border-b border-zinc-800">
                        <th className="p-3">ID</th>
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Precio</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((prod) => (
                        <tr key={prod.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                          <td className="p-3 text-gray-400">{prod.id}</td>
                          <td className="p-3">{prod.nombre}</td>
                          <td className="p-3">
                            {editandoPrecio?.id === prod.id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  value={editandoPrecio.precio} 
                                  onChange={(e) => setEditandoPrecio({ id: prod.id, precio: e.target.value })} 
                                  className="w-24 p-1 bg-zinc-800 border border-zinc-700 rounded text-white" 
                                />
                                <button onClick={() => actualizarPrecio(prod.id, editandoPrecio.precio)} className="text-green-500 hover:text-green-400 text-sm font-bold">Guardar</button>
                              </div>
                            ) : (
                              <span className="text-yellow-500 font-bold">{formatearPrecio(prod.precio)}</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button onClick={() => setEditandoPrecio({ id: prod.id, precio: prod.precio.toString() })} className="text-blue-400 hover:text-blue-300 text-sm mr-4 font-bold">Editar Precio</button>
                            <button onClick={() => eliminarProducto(prod.id)} className="text-red-500 hover:text-red-400 text-sm font-bold">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-black py-8 text-center border-t border-zinc-800 mt-auto z-10">
        <p className="text-gray-500">© 2026 Pinturarte Studio. Todos los derechos reservados.</p>
      </footer>

      <AnimatePresence>
        {mostrarBotonArriba && (
          <motion.button initial={{ opacity: 0, scale: 0, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0, y: 50 }} transition={{ duration: 0.3 }} onClick={volverArriba} className="fixed bottom-8 right-8 bg-yellow-600 text-black p-4 rounded-full shadow-[0_0_15px_rgba(202,138,4,0.6)] hover:bg-yellow-500 hover:scale-110 transition z-50 flex items-center justify-center" title="Volver arriba">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}