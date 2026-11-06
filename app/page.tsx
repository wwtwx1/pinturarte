"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabase";

const formatearPrecio = (precio: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(precio);
};

const SUPER_ADMIN = "chikyrxn@hotmail.com"; 

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
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  
  const [carrito, setCarrito] = useState<any[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [vistaActual, setVistaActual] = useState("inicio");
  
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [vistaAuth, setVistaAuth] = useState("login"); 
  const [mostrarBotonArriba, setMostrarBotonArriba] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorAuth, setErrorAuth] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [contactoData, setContactoData] = useState({ nombre: "", email: "", motivo: "Compra de una figura", mensaje: "" });
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [mensajeEnviado, setMensajeEnviado] = useState(false);

  const [adminTab, setAdminTab] = useState("productos");
  
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", descripcion: "", precio: "", categoria: "Anime", posicion: 1, stock: 10 });
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any>(null);
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(null);
  
  const [nuevoAdminEmail, setNuevoAdminEmail] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  
  const [mostrarModalRespuesta, setMostrarModalRespuesta] = useState(false);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);

  const [mostrarCheckout, setMostrarCheckout] = useState(false);
  const [metodoPago, setMetodoPago] = useState("Tarjeta");
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [numeroOrden, setNumeroOrden] = useState("");

  const cargarProductos = async () => {
    const { data } = await supabase.from('productos').select('*').order('posicion', { ascending: true });
    if (data) setProductos(data);
  };

  const cargarMensajes = async () => {
    const { data } = await supabase.from('mensajes_soporte').select('*').order('created_at', { ascending: false });
    if (data) setMensajes(data);
  };

  const cargarAdmins = async () => {
    const { data } = await supabase.from('admins').select('*');
    if (data) setAdminsList(data);
  };

  useEffect(() => {
    cargarProductos();
    cargarAdmins();
    
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

  const esAdmin = usuario?.email?.toLowerCase() === SUPER_ADMIN.toLowerCase() || 
                  adminsList.some(a => a.email?.toLowerCase() === usuario?.email?.toLowerCase());

  useEffect(() => {
    if (esAdmin) {
      cargarMensajes();
    }
  }, [usuario, vistaActual, esAdmin]);

  useEffect(() => {
    if (!esAdmin) return;

    const channel = supabase
      .channel('realtime-soporte')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mensajes_soporte' },
        (payload) => {
          if (payload.eventType === 'DELETE' && selectedMessage && payload.old.id === selectedMessage.id) {
            setSelectedMessage(null);
          }
          cargarMensajes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [esAdmin, selectedMessage]);

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
      else setMensajeExito("¡Cuenta creada! Revisa tu correo electrónico para confirmar.");
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
    setMenuAbierto(false);
    setSelectedMessage(null);
  };

  const enviarFormularioContacto = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviandoMensaje(true);
    const { error } = await supabase.from('mensajes_soporte').insert([contactoData]);
    
    if (!error) {
      setMensajeEnviado(true);
      setContactoData({ nombre: "", email: "", motivo: "Compra de una figura", mensaje: "" });
    } else {
      alert("Error al enviar el mensaje. Intenta de nuevo.");
    }
    setEnviandoMensaje(false);
  };

  const marcarMensajeLeido = async (id: number, estadoActual: boolean) => {
    await supabase.from('mensajes_soporte').update({ leido: !estadoActual }).eq('id', id);
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage({ ...selectedMessage, leido: !estadoActual });
    }
  };

  const eliminarMensaje = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este mensaje de soporte?")) {
      const { error } = await supabase.from('mensajes_soporte').delete().eq('id', id);
      if (error) {
        alert("Error al eliminar: " + error.message);
      } else {
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
      }
    }
  };

  const enviarCorreoRespuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !textoRespuesta) return;
    setEnviandoCorreo(true);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedMessage.email,
          subject: `Respuesta a tu consulta: ${selectedMessage.motivo}`,
          message: textoRespuesta
        })
      });

      if (response.ok) {
        alert("¡Correo enviado exitosamente!");
        setMostrarModalRespuesta(false);
        setTextoRespuesta("");
        if (!selectedMessage.leido) marcarMensajeLeido(selectedMessage.id, false);
      } else {
        alert("Hubo un error al enviar el correo.");
      }
    } catch (error) {
      alert("Error de red al enviar el correo.");
    } finally {
      setEnviandoCorreo(false);
    }
  };

  const procesarPagoSimulado = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesandoPago(true);
    
    for (const item of carrito) {
      const productoDB = productos.find(p => p.id === item.id);
      if (productoDB) {
        const nuevoStock = Math.max(0, productoDB.stock - 1); 
        await supabase.from('productos').update({ stock: nuevoStock }).eq('id', item.id);
      }
    }

    setTimeout(() => {
      setProcesandoPago(false);
      setPagoExitoso(true);
      setNumeroOrden(`PT-${Math.floor(100000 + Math.random() * 900000)}`);
      setCarrito([]); 
      cargarProductos(); 
    }, 2000);
  };

  const cerrarCheckout = () => {
    setMostrarCheckout(false);
    setPagoExitoso(false);
    setProcesandoPago(false);
  };

  const agregarAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoAdminEmail) return;
    const { error } = await supabase.from('admins').insert([{ email: nuevoAdminEmail.toLowerCase().trim() }]);
    if (error) alert("Error: " + error.message);
    else {
      setNuevoAdminEmail("");
      cargarAdmins();
      alert("Administrador agregado correctamente.");
    }
  };

  const eliminarAdmin = async (emailToDelete: string) => {
    if (emailToDelete.toLowerCase() === SUPER_ADMIN.toLowerCase()) {
      alert("No puedes eliminar al Súper Administrador principal.");
      return;
    }
    if (confirm(`¿Estás seguro de quitarle el acceso de administrador a ${emailToDelete}?`)) {
      const { error } = await supabase.from('admins').delete().eq('email', emailToDelete);
      if (error) alert("Error: " + error.message);
      else cargarAdmins();
    }
  };

  const subirImagen = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('productos').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = await supabase.storage.from('productos').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const crearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubiendo(true);
    let urlImagen = "/img/goku.jpg"; 

    try {
      if (imagenFile) urlImagen = await subirImagen(imagenFile);
      const { error } = await supabase.from('productos').insert([{
        nombre: nuevoProducto.nombre,
        descripcion: nuevoProducto.descripcion,
        precio: Number(nuevoProducto.precio),
        categoria: nuevoProducto.categoria,
        posicion: Number(nuevoProducto.posicion),
        stock: Number(nuevoProducto.stock),
        imagen: urlImagen
      }]);
      if (error) throw error;
      alert("Producto creado exitosamente");
      setNuevoProducto({ nombre: "", descripcion: "", precio: "", categoria: "Anime", posicion: 1, stock: 10 });
      setImagenFile(null);
      cargarProductos();
    } catch (error: any) {
      alert("Error al crear: " + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  const actualizarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoEditando) return;
    setSubiendo(true);

    try {
      let urlImagen = productoEditando.imagen;
      if (imagenFile) urlImagen = await subirImagen(imagenFile);

      const { error } = await supabase.from('productos').update({
        nombre: productoEditando.nombre,
        descripcion: productoEditando.descripcion,
        precio: Number(productoEditando.precio),
        categoria: productoEditando.categoria,
        posicion: Number(productoEditando.posicion),
        stock: Number(productoEditando.stock),
        imagen: urlImagen
      }).eq('id', productoEditando.id);

      if (error) throw error;
      alert("Producto actualizado");
      setProductoEditando(null);
      setImagenFile(null);
      cargarProductos();
    } catch (error: any) {
      alert("Error al editar: " + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  const eliminarProducto = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (error) alert("Error al eliminar: " + error.message);
      else cargarProductos();
    }
  };

  const moverPosicion = async (prod: any, direccion: 'subir' | 'bajar') => {
    const nuevaPosicion = direccion === 'subir' ? prod.posicion - 1 : prod.posicion + 1;
    await supabase.from('productos').update({ posicion: nuevaPosicion }).eq('id', prod.id);
    cargarProductos();
  };

  const volverArriba = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const agregarAlCarrito = (producto: any) => {
    if (producto.stock <= 0) return; 
    setCarrito([...carrito, producto]); 
    setMostrarCarrito(true); 
  };
  
  const eliminarDelCarrito = (indexAEliminar: number) => setCarrito(carrito.filter((_, index) => index !== indexAEliminar));
  const total = carrito.reduce((sum, item) => sum + Number(item.precio), 0);
  
  const cambiarVista = (vista: string) => {
    setVistaActual(vista);
    setMensajeEnviado(false);
    setMenuAbierto(false);
    setSelectedMessage(null); 
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nombreMostrar = usuario?.user_metadata?.nombre_completo?.split(' ')[0] || usuario?.email?.split('@')[0] || 'Cliente';
  const mensajesNoLeidos = mensajes.filter(m => !m.leido).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col overflow-hidden relative">
      
      {/* BOTONES FLOTANTES */}
      <a href="https://www.instagram.com/pinturartestudio" target="_blank" rel="noreferrer" className="fixed bottom-24 left-4 md:left-8 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white p-3 md:p-4 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.6)] hover:scale-110 transition z-50 flex items-center justify-center" title="Instagram">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      </a>
      <a href="https://wa.me/573147376561" target="_blank" rel="noreferrer" className="fixed bottom-6 left-4 md:bottom-8 md:left-8 bg-green-500 text-white p-3 md:p-4 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:bg-green-400 hover:scale-110 transition z-50 flex items-center justify-center" title="WhatsApp">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-6 h-6 md:w-7 md:h-7"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
      </a>

      {/* NAVBAR RESPONSIVO */}
      <nav className="bg-black p-2 md:p-4 border-b border-yellow-600/30 sticky top-0 z-40 shadow-lg">
        <div className="flex justify-between items-center w-full">
          <img src="/img/logo.png" alt="Pinturarte Studio" className="h-12 md:h-20 w-auto object-contain cursor-pointer hover:scale-105 transition" onClick={() => cambiarVista("inicio")} />
          
          <div className="hidden md:flex gap-3 md:gap-5 items-center text-sm md:text-base pr-2">
            <button onClick={() => cambiarVista("inicio")} className={`${vistaActual === 'inicio' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition`}>Inicio</button>
            <button onClick={() => cambiarVista("catalogo")} className={`${vistaActual === 'catalogo' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition`}>Catálogo</button>
            <button onClick={() => cambiarVista("nosotros")} className={`${vistaActual === 'nosotros' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition`}>Nosotros</button>
            <button onClick={() => cambiarVista("contacto")} className={`${vistaActual === 'contacto' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition`}>Contacto</button>
            <button onClick={() => cambiarVista("curso")} className={`${vistaActual === 'curso' ? 'text-yellow-500 font-bold' : 'hover:text-yellow-500 text-gray-300'} transition`}>Curso</button>
            
            {esAdmin && (
              <button onClick={() => cambiarVista("admin")} className={`relative ${vistaActual === 'admin' ? 'text-red-500 font-bold' : 'hover:text-red-500 text-red-400'} transition border border-red-500/30 px-2 rounded flex items-center gap-1`}>
                Admin
                {mensajesNoLeidos > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">{mensajesNoLeidos}</span>
                )}
              </button>
            )}

            {usuario ? (
              <div className="flex items-center gap-3 border-l border-zinc-700 pl-3">
                <span className="text-yellow-500 text-xs">Hola, {nombreMostrar}</span>
                <button onClick={cerrarSesion} className="hover:text-red-500 transition font-bold text-xs">Salir</button>
              </div>
            ) : (
              <button onClick={() => { setMostrarLogin(true); setMostrarCarrito(false); setVistaAuth("login"); setErrorAuth(""); setMensajeExito(""); }} className="hover:text-yellow-500 transition font-bold border-l border-zinc-700 pl-3 text-sm">Mi Cuenta</button>
            )}

            <button onClick={() => { setMostrarCarrito(!mostrarCarrito); setMostrarLogin(false); }} className="bg-yellow-600 text-black px-4 py-2 rounded font-bold hover:bg-yellow-500 transition">Carrito ({carrito.length})</button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => { setMostrarCarrito(!mostrarCarrito); setMostrarLogin(false); }} className="bg-yellow-600 text-black px-3 py-1 text-xs rounded font-bold">Carrito ({carrito.length})</button>
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="text-white p-2 relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                {menuAbierto ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
              </svg>
              {esAdmin && mensajesNoLeidos > 0 && <span className="absolute top-1 right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-black animate-pulse"></span>}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuAbierto && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 bg-zinc-900 rounded-lg overflow-hidden flex flex-col border border-zinc-800">
              <button onClick={() => cambiarVista("inicio")} className="p-3 text-left border-b border-zinc-800 hover:bg-zinc-800">Inicio</button>
              <button onClick={() => cambiarVista("catalogo")} className="p-3 text-left border-b border-zinc-800 hover:bg-zinc-800">Catálogo</button>
              <button onClick={() => cambiarVista("nosotros")} className="p-3 text-left border-b border-zinc-800 hover:bg-zinc-800">Nosotros</button>
              <button onClick={() => cambiarVista("contacto")} className="p-3 text-left border-b border-zinc-800 hover:bg-zinc-800">Contacto</button>
              <button onClick={() => cambiarVista("curso")} className="p-3 text-left border-b border-zinc-800 hover:bg-zinc-800">Curso</button>
              
              {esAdmin && (
                <button onClick={() => cambiarVista("admin")} className="p-3 text-left border-b border-zinc-800 text-red-400 font-bold hover:bg-zinc-800 flex justify-between items-center">
                  Panel Admin
                  {mensajesNoLeidos > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{mensajesNoLeidos}</span>}
                </button>
              )}
              
              {usuario ? (
                <div className="flex flex-col p-3 bg-black">
                  <span className="text-yellow-500 text-sm mb-2">Hola, {nombreMostrar}</span>
                  <button onClick={cerrarSesion} className="text-left text-red-400 font-bold hover:text-red-300">Cerrar Sesión</button>
                </div>
              ) : (
                <button onClick={() => { setMostrarLogin(true); setMenuAbierto(false); setVistaAuth("login"); setErrorAuth(""); setMensajeExito(""); }} className="p-3 text-left bg-black font-bold text-yellow-500 hover:text-yellow-400">Mi Cuenta / Ingresar</button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* MODALES */}
      {mostrarLogin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-yellow-600 p-6 rounded-lg shadow-2xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-yellow-500">{vistaAuth === "login" ? "Iniciar Sesión" : vistaAuth === "registro" ? "Crear Cuenta" : "Recuperar Contraseña"}</h3>
            {errorAuth && <div className="bg-red-500/20 text-red-400 p-2 rounded mb-3 text-xs">{errorAuth}</div>}
            {mensajeExito && <div className="bg-green-500/20 text-green-400 p-2 rounded mb-3 text-xs">{mensajeExito}</div>}
            <form onSubmit={manejarAuth} className="flex flex-col gap-3 mb-4">
              {vistaAuth === "registro" && <input type="text" placeholder="Nombre completo" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" />}
              <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" />
              {vistaAuth !== "recuperar" && <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" />}
              <button type="submit" disabled={cargando} className="w-full bg-yellow-600 text-black py-2 rounded font-bold hover:bg-yellow-500 transition disabled:opacity-50 mt-2">{cargando ? "Procesando..." : vistaAuth === "login" ? "Ingresar" : vistaAuth === "registro" ? "Registrarse" : "Enviar Enlace"}</button>
            </form>
            <div className="flex flex-col gap-2 text-xs text-gray-400">
              {vistaAuth === "login" && (
                <>
                  <button onClick={() => { setVistaAuth("registro"); setErrorAuth(""); setMensajeExito(""); }} className="hover:text-white transition underline text-left">¿No tienes cuenta? Regístrate aquí</button>
                  <button onClick={() => { setVistaAuth("recuperar"); setErrorAuth(""); setMensajeExito(""); }} className="hover:text-white transition underline text-left">Olvidé mi contraseña</button>
                </>
              )}
              {vistaAuth !== "login" && <button onClick={() => { setVistaAuth("login"); setErrorAuth(""); setMensajeExito(""); }} className="hover:text-white transition underline text-left">Volver al inicio de sesión</button>}
              <button onClick={() => setMostrarLogin(false)} className="mt-2 text-center text-gray-500 hover:text-white">Cerrar ventana</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PRODUCTO */}
      {productoEditando && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-yellow-600 p-6 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-yellow-500">Editar Producto</h3>
            <form onSubmit={actualizarProducto} className="flex flex-col gap-4">
              
              <div>
                <label className="block text-sm text-gray-400 mb-1 font-bold">Nombre del producto</label>
                <input type="text" placeholder="Ej: Figura de Goku" value={productoEditando.nombre} onChange={(e) => setProductoEditando({...productoEditando, nombre: e.target.value})} required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1 font-bold">Precio (COP)</label>
                <input type="number" placeholder="Ej: 140000" value={productoEditando.precio} onChange={(e) => setProductoEditando({...productoEditando, precio: e.target.value})} required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1 font-bold">Categoría</label>
                <input type="text" placeholder="Ej: Anime, Religioso..." value={productoEditando.categoria} onChange={(e) => setProductoEditando({...productoEditando, categoria: e.target.value})} required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1 font-bold">Posición en el catálogo</label>
                  <input type="number" placeholder="Ej: 1" value={productoEditando.posicion} onChange={(e) => setProductoEditando({...productoEditando, posicion: e.target.value})} required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white" />
                  <span className="text-xs text-gray-500 mt-1 block">El 1 aparece primero.</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1 font-bold">Cantidad en Stock</label>
                  <input type="number" placeholder="Ej: 10" value={productoEditando.stock} onChange={(e) => setProductoEditando({...productoEditando, stock: e.target.value})} required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white" />
                  <span className="text-xs text-gray-500 mt-1 block">Unidades disponibles.</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1 font-bold">Descripción</label>
                <textarea placeholder="Describe la figura..." value={productoEditando.descripcion} onChange={(e) => setProductoEditando({...productoEditando, descripcion: e.target.value})} required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white" rows={3}></textarea>
              </div>

              <div className="border-t border-zinc-700 pt-4 mt-2">
                <label className="block text-sm text-gray-400 mb-1 font-bold">Imagen del producto</label>
                <p className="text-xs text-gray-500 mb-2">Deja este campo vacío si no quieres cambiar la foto actual.</p>
                <input type="file" accept="image/*" onChange={(e) => setImagenFile(e.target.files ? e.target.files[0] : null)} className="p-2 bg-zinc-800 border border-zinc-700 rounded text-white w-full text-sm" />
              </div>

              <div className="flex gap-2 mt-4">
                <button type="submit" disabled={subiendo} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition">{subiendo ? "Guardando..." : "Guardar Cambios"}</button>
                <button type="button" onClick={() => { setProductoEditando(null); setImagenFile(null); }} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded transition">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-yellow-600 p-6 rounded-lg shadow-2xl w-full max-w-sm">
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
            <button onClick={() => { setMostrarCarrito(false); setMostrarCheckout(true); }} disabled={carrito.length === 0} className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold transition disabled:opacity-50">
              Ir a Pagar
            </button>
            <button onClick={() => setMostrarCarrito(false)} className="w-full mt-2 text-xs text-gray-400 hover:text-white">Cerrar</button>
          </div>
        </div>
      )}

      {/* SANDBOX DE PAGO */}
      {mostrarCheckout && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            
            {pagoExitoso ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8 text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">¡Pago Exitoso!</h3>
                <p className="text-gray-400 mb-6">Tu pedido ha sido procesado correctamente.</p>
                
                <div className="bg-black/50 p-4 rounded-lg mb-6 inline-block text-left">
                  <p className="text-xs text-gray-500 mb-1">Número de orden</p>
                  <p className="text-xl font-mono text-yellow-500 font-bold tracking-wider">{numeroOrden}</p>
                </div>

                <button onClick={cerrarCheckout} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg transition">
                  Volver a la tienda
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                  <h3 className="text-xl font-bold text-white">Pasarela de Pago <span className="text-xs font-normal text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 ml-2">MODO SANDBOX</span></h3>
                  <button onClick={cerrarCheckout} className="text-gray-500 hover:text-white text-xl">✕</button>
                </div>

                <div className="flex justify-between items-center mb-6 bg-black/30 p-3 rounded-lg border border-zinc-800">
                  <span className="text-gray-400">Total a pagar:</span>
                  <span className="text-2xl font-bold text-yellow-500">{formatearPrecio(total)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {['Tarjeta', 'PSE', 'Nequi', 'Efecty'].map((metodo) => (
                    <button 
                      key={metodo}
                      onClick={() => setMetodoPago(metodo)}
                      className={`py-2 px-3 rounded-lg border text-sm font-bold transition text-center ${metodoPago === metodo ? 'bg-yellow-600 border-yellow-600 text-black' : 'bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700'}`}
                    >
                      {metodo}
                    </button>
                  ))}
                </div>

                <form onSubmit={procesarPagoSimulado} className="flex flex-col gap-4">
                  {metodoPago === "Tarjeta" && (
                    <>
                      <input type="text" placeholder="Número de tarjeta (16 dígitos)" required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white font-mono" maxLength={16} />
                      <div className="flex gap-2">
                        <input type="text" placeholder="MM/YY" required className="w-1/2 p-3 bg-zinc-800 border border-zinc-700 rounded text-white text-center" maxLength={5} />
                        <input type="password" placeholder="CVV" required className="w-1/2 p-3 bg-zinc-800 border border-zinc-700 rounded text-white text-center" maxLength={3} />
                      </div>
                      <input type="text" placeholder="Nombre del titular" required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white uppercase" />
                    </>
                  )}

                  {metodoPago === "PSE" && (
                    <>
                      <select required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white">
                        <option value="">Selecciona tu banco...</option>
                        <option value="bancolombia">Bancolombia</option>
                        <option value="davivienda">Davivienda</option>
                        <option value="bogota">Banco de Bogotá</option>
                        <option value="colpatria">Scotiabank Colpatria</option>
                        <option value="nequi">Nequi</option>
                        <option value="daviplata">Daviplata</option>
                      </select>
                      <select required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white">
                        <option value="cc">Cédula de Ciudadanía</option>
                        <option value="ce">Cédula de Extranjería</option>
                        <option value="nit">NIT</option>
                      </select>
                      <input type="text" placeholder="Número de documento" required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white" />
                    </>
                  )}

                  {metodoPago === "Nequi" && (
                    <>
                      <input type="tel" placeholder="Número de celular (10 dígitos)" required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white text-center text-lg tracking-widest" maxLength={10} />
                      <p className="text-xs text-gray-400 text-center">Recibirás una notificación en tu app de Nequi para aprobar el pago.</p>
                    </>
                  )}

                  {metodoPago === "Efecty" && (
                    <>
                      <input type="text" placeholder="Nombre completo" required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white" />
                      <input type="text" placeholder="Número de cédula" required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white" />
                      <p className="text-xs text-gray-400 text-center">Se generará un código de recaudo para pagar en cualquier punto Efecty.</p>
                    </>
                  )}

                  <button type="submit" disabled={procesandoPago} className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex justify-center items-center gap-2">
                    {procesandoPago ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Procesando pago...
                      </>
                    ) : (
                      `Pagar ${formatearPrecio(total)}`
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* VISTAS */}
      <main className="flex-grow flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div key={vistaActual} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="flex-grow flex flex-col w-full">
            
            {vistaActual === "inicio" && (
              <div className="min-h-[85vh] flex flex-col justify-center items-center text-center px-4 bg-gradient-to-b from-black to-zinc-900 py-12">
                <motion.img initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} src="/img/hero.png" alt="Pinturarte Studio" className="w-48 md:w-64 mb-6 drop-shadow-[0_0_15px_rgba(202,138,4,0.3)]" />
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }} className="flex flex-col items-center max-w-3xl">
                  <h3 className="text-white tracking-[0.2em] font-semibold mb-2 text-sm md:text-base uppercase">Bienvenidos a</h3>
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 tracking-wide">PINTURARTE STUDIO</h2>
                  <div className="w-48 h-px bg-zinc-700 mb-8"></div>
                  <p className="text-2xl md:text-4xl font-extrabold text-purple-300 mb-6 leading-tight drop-shadow-md">Pequeñas figuras, grandes historias llenas de color.</p>
                  <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed font-light">Descubre un mundo donde la creatividad cobra vida y cada detalle se transforma en arte.</p>
                  <p className="text-xl md:text-2xl font-bold text-yellow-500 mb-10 flex items-center gap-2">Donde el color se convierte en magia. ✨</p>
                  <button onClick={() => cambiarVista("catalogo")} className="bg-yellow-600 text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-500 transition transform hover:scale-105 shadow-[0_0_15px_rgba(202,138,4,0.5)]">Ver Catálogo Completo</button>
                </motion.div>
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
                          <img src={prod.imagen} alt={prod.nombre} className={`w-full h-full object-cover transition duration-500 ${prod.stock <= 0 ? 'grayscale opacity-50' : 'group-hover:scale-110'}`} />
                        </div>
                        <div className="p-6 md:w-2/3 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">{prod.categoria}</span>
                              {/* ETIQUETA DE STOCK AJUSTADA A > 3 */}
                              {prod.stock > 3 ? (
                                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">En stock: {prod.stock}</span>
                              ) : prod.stock > 0 ? (
                                <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded animate-pulse">¡Últimas {prod.stock} unidades!</span>
                              ) : (
                                <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">Agotado</span>
                              )}
                            </div>
                            <h3 className="text-2xl font-bold mt-1 mb-3">{prod.nombre}</h3>
                            <p className="text-gray-400 mb-4">{prod.descripcion}</p>
                          </div>
                          <div className="flex justify-between items-center mt-4 border-t border-zinc-800 pt-4">
                            <span className="text-3xl font-bold text-yellow-500">{formatearPrecio(prod.precio)}</span>
                            <button 
                              onClick={() => agregarAlCarrito(prod)} 
                              disabled={prod.stock <= 0}
                              className={`px-6 py-2 rounded font-bold transition ${prod.stock <= 0 ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}
                            >
                              {prod.stock <= 0 ? "Agotado" : "Agregar al Carrito"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {vistaActual === "nosotros" && (
              <section className="py-20 px-4 max-w-3xl mx-auto w-full">
                <h2 className="text-4xl font-bold mb-12 text-center text-yellow-500">Sobre Nosotros</h2>
                <div className="flex flex-col gap-4">
                  {seccionesNosotros.map((seccion) => (
                    <div key={seccion.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg hover:border-yellow-600/30 transition">
                      <button onClick={() => setSeccionAbierta(seccionAbierta === seccion.id ? null : seccion.id)} className="w-full p-6 text-left flex justify-between items-center bg-zinc-900 hover:bg-zinc-800/50 transition">
                        <h3 className="text-2xl font-bold text-yellow-500">{seccion.titulo}</h3>
                        <motion.div animate={{ rotate: seccionAbierta === seccion.id ? 180 : 0 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {seccionAbierta === seccion.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-6 pt-0 text-gray-300 leading-relaxed whitespace-pre-line border-t border-zinc-800/50 mt-2">{seccion.contenido}</div>
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
                    <form onSubmit={enviarFormularioContacto} className="flex flex-col gap-4 text-left">
                      <div><label className="block text-sm text-gray-400 mb-1">Nombre completo</label><input required type="text" value={contactoData.nombre} onChange={(e) => setContactoData({...contactoData, nombre: e.target.value})} className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" placeholder="Tu nombre" /></div>
                      <div><label className="block text-sm text-gray-400 mb-1">Correo Electrónico</label><input required type="email" value={contactoData.email} onChange={(e) => setContactoData({...contactoData, email: e.target.value})} className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" placeholder="tu@email.com" /></div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">¿Nos contactas para?</label>
                        <select value={contactoData.motivo} onChange={(e) => setContactoData({...contactoData, motivo: e.target.value})} className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500">
                          <option value="Compra de una figura">Compra de una figura</option>
                          <option value="Cotizar clases de taller">Cotizar clases de taller</option>
                          <option value="Pedido al por mayor">Pedido al por mayor</option>
                          <option value="Restauración de una pieza">Restauración de una pieza</option>
                          <option value="Otro motivo">Otro motivo</option>
                        </select>
                      </div>
                      <div><label className="block text-sm text-gray-400 mb-1">Mensaje</label><textarea required rows={4} value={contactoData.mensaje} onChange={(e) => setContactoData({...contactoData, mensaje: e.target.value})} className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-yellow-500" placeholder="¿En qué te podemos ayudar?"></textarea></div>
                      <button type="submit" disabled={enviandoMensaje} className="bg-yellow-600 text-black py-3 rounded font-bold hover:bg-yellow-500 transition mt-2 disabled:opacity-50">{enviandoMensaje ? "Enviando..." : "Enviar Mensaje"}</button>
                    </form>
                  )}
                </div>
              </section>
            )}

            {vistaActual === "curso" && (
              <section className="py-20 px-4 max-w-4xl mx-auto text-center w-full flex-grow flex flex-col">
                <h2 className="text-4xl font-bold mb-6 text-yellow-500">Nuestros Cursos y Talleres</h2>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">¡Aprende el arte de la pintura en yeso! Déjanos tus datos en el siguiente formulario para inscribirte y te contactaremos pronto.</p>
                <div className="w-full bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800 p-2">
                  <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdM_LerAvp8_YcIXyLxVDjlwUK1hu5ucyZBNR94rncKFBsScA/viewform?usp=publish-editor" className="w-full min-h-[600px] md:min-h-[800px] rounded-lg bg-white" frameBorder="0" marginHeight={0} marginWidth={0}>Cargando formulario...</iframe>
                </div>
              </section>
            )}

            {/* ADMIN CON ETIQUETAS CLARAS */}
            {vistaActual === "admin" && esAdmin && (
              <section className="py-12 px-4 max-w-7xl mx-auto w-full">
                <h2 className="text-3xl font-bold mb-8 text-red-500">Panel de Administrador</h2>
                
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-64 flex flex-col gap-2">
                    <button onClick={() => setAdminTab("productos")} className={`p-4 text-left rounded-lg font-bold transition flex items-center gap-3 ${adminTab === 'productos' ? 'bg-yellow-600 text-black' : 'bg-zinc-900 text-gray-300 hover:bg-zinc-800'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                      Productos
                    </button>
                    
                    <button onClick={() => { setAdminTab("soporte"); setSelectedMessage(null); }} className={`p-4 text-left rounded-lg font-bold transition flex items-center justify-between ${adminTab === 'soporte' ? 'bg-yellow-600 text-black' : 'bg-zinc-900 text-gray-300 hover:bg-zinc-800'}`}>
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        Soporte
                      </div>
                      {mensajesNoLeidos > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold animate-pulse ${adminTab === 'soporte' ? 'bg-black text-yellow-500' : 'bg-red-500 text-white'}`}>
                          {mensajesNoLeidos}
                        </span>
                      )}
                    </button>
                    
                    <button onClick={() => setAdminTab("usuarios")} className={`p-4 text-left rounded-lg font-bold transition flex items-center gap-3 ${adminTab === 'usuarios' ? 'bg-yellow-600 text-black' : 'bg-zinc-900 text-gray-300 hover:bg-zinc-800'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                      Usuarios
                    </button>
                  </div>

                  <div className="flex-1 bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg min-h-[60vh] overflow-hidden">
                    {adminTab === "productos" && (
                      <div>
                        <h3 className="text-2xl font-bold mb-6 text-yellow-500 border-b border-zinc-800 pb-2">Gestión de Productos</h3>
                        
                        <div className="bg-black/30 p-6 rounded-lg mb-10 border border-zinc-800">
                          <h4 className="text-xl font-bold mb-4 text-white">Agregar Nuevo Producto</h4>
                          <form onSubmit={crearProducto} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            
                            <div className="md:col-span-2">
                              <label className="block text-sm text-gray-400 mb-1 font-bold">Nombre del producto</label>
                              <input type="text" placeholder="Ej: Figura de Goku" value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-yellow-500 outline-none" />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-400 mb-1 font-bold">Precio (COP)</label>
                              <input type="number" placeholder="Ej: 140000" value={nuevoProducto.precio} onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})} required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-yellow-500 outline-none" />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-400 mb-1 font-bold">Categoría</label>
                              <input type="text" placeholder="Ej: Anime, Religioso..." value={nuevoProducto.categoria} onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-yellow-500 outline-none" />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-400 mb-1 font-bold">Posición en el catálogo</label>
                              <input type="number" placeholder="Ej: 1" value={nuevoProducto.posicion} onChange={(e) => setNuevoProducto({...nuevoProducto, posicion: Number(e.target.value)})} required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-yellow-500 outline-none" />
                              <span className="text-xs text-gray-500 mt-1 block">El 1 aparece primero en la tienda.</span>
                            </div>

                            <div>
                              <label className="block text-sm text-gray-400 mb-1 font-bold">Cantidad en Stock</label>
                              <input type="number" placeholder="Ej: 10" value={nuevoProducto.stock} onChange={(e) => setNuevoProducto({...nuevoProducto, stock: Number(e.target.value)})} required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-yellow-500 outline-none" />
                              <span className="text-xs text-gray-500 mt-1 block">Unidades disponibles para vender.</span>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm text-gray-400 mb-1 font-bold">Descripción</label>
                              <textarea placeholder="Describe los detalles de la figura..." value={nuevoProducto.descripcion} onChange={(e) => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-yellow-500 outline-none" rows={3}></textarea>
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="block text-sm text-gray-400 mb-1 font-bold">Imagen del producto</label>
                              <input type="file" accept="image/*" onChange={(e) => setImagenFile(e.target.files ? e.target.files[0] : null)} required className="p-2 bg-zinc-800 border border-zinc-700 rounded text-white w-full text-sm" />
                            </div>
                            
                            <button type="submit" disabled={subiendo} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded md:col-span-2 transition text-lg mt-2">{subiendo ? "Subiendo..." : "Guardar Producto"}</button>
                          </form>
                        </div>

                        <div className="border-t border-zinc-800 pt-6">
                          <h4 className="text-xl font-bold mb-4 text-white">Listado de Productos (Para Editar o Eliminar)</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-black text-yellow-500 border-b border-zinc-800 text-sm">
                                  <th className="p-3">Orden</th>
                                  <th className="p-3 hidden md:table-cell">Imagen</th>
                                  <th className="p-3">Nombre</th>
                                  <th className="p-3 hidden md:table-cell">Precio</th>
                                  <th className="p-3">Stock</th>
                                  <th className="p-3 text-right">Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {productos.map((prod) => (
                                  <tr key={prod.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                    <td className="p-3">
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-400 w-6">{prod.posicion}</span>
                                        <div className="flex flex-col">
                                          <button onClick={() => moverPosicion(prod, 'subir')} className="text-gray-500 hover:text-white text-xs">▲</button>
                                          <button onClick={() => moverPosicion(prod, 'bajar')} className="text-gray-500 hover:text-white text-xs">▼</button>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3 hidden md:table-cell"><img src={prod.imagen} alt={prod.nombre} className="w-12 h-12 object-cover rounded" /></td>
                                    <td className="p-3">{prod.nombre} <div className="md:hidden text-yellow-500 font-bold text-sm mt-1">{formatearPrecio(prod.precio)}</div></td>
                                    <td className="p-3 hidden md:table-cell"><span className="text-yellow-500 font-bold">{formatearPrecio(prod.precio)}</span></td>
                                    <td className="p-3">
                                      {/* ETIQUETA DE STOCK ADMIN AJUSTADA A > 3 */}
                                      <span className={`font-bold px-2 py-1 rounded text-sm ${prod.stock > 3 ? 'text-green-400 bg-green-400/10' : prod.stock > 0 ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                        {prod.stock}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right flex flex-col md:flex-row items-end md:items-center justify-end gap-2">
                                      <button onClick={() => setProductoEditando(prod)} className="text-blue-400 hover:text-blue-300 text-sm font-bold">Editar</button>
                                      <button onClick={() => eliminarProducto(prod.id)} className="text-red-500 hover:text-red-400 text-sm font-bold">Eliminar</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {adminTab === "soporte" && (
                      <div>
                        {selectedMessage ? (
                          <div>
                            <button onClick={() => setSelectedMessage(null)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition font-bold">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                              Volver a la lista
                            </button>

                            <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6 shadow-xl">
                              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4 border-b border-zinc-700 pb-4">
                                <div>
                                  <h3 className="text-2xl font-bold text-white">{selectedMessage.nombre}</h3>
                                  <a href={`mailto:${selectedMessage.email}`} className="text-yellow-500 hover:underline text-sm">{selectedMessage.email}</a>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-yellow-500 bg-black px-3 py-1 rounded">{selectedMessage.motivo}</span>
                                  <span className="text-xs text-gray-500">Recibido el {new Date(selectedMessage.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              <div className="mb-8">
                                <h4 className="text-sm font-bold text-gray-400 mb-2">Mensaje del cliente:</h4>
                                <p className="text-gray-200 whitespace-pre-wrap break-words bg-black/30 p-4 rounded-lg leading-relaxed">
                                  {selectedMessage.mensaje}
                                </p>
                              </div>

                              <div className="flex flex-col md:flex-row justify-end gap-3">
                                <button onClick={() => eliminarMensaje(selectedMessage.id)} className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded font-bold transition text-sm">
                                  Eliminar Mensaje
                                </button>
                                <button onClick={() => marcarMensajeLeido(selectedMessage.id, selectedMessage.leido)} className={`px-4 py-2 rounded font-bold transition text-sm ${selectedMessage.leido ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600' : 'bg-yellow-600 text-black hover:bg-yellow-500'}`}>
                                  {selectedMessage.leido ? "Marcar como no leído" : "Marcar como leído"}
                                </button>
                                <button onClick={() => setMostrarModalRespuesta(true)} className="px-6 py-2 bg-green-600 text-white hover:bg-green-500 rounded font-bold transition text-sm flex items-center justify-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                                  Responder por Correo
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-2xl font-bold mb-6 text-yellow-500 border-b border-zinc-800 pb-2 flex items-center gap-2">
                              Bandeja de Soporte
                              {mensajesNoLeidos > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">{mensajesNoLeidos} nuevos</span>}
                            </h3>
                            
                            {mensajes.length === 0 ? (
                              <p className="text-gray-400 text-center py-10">No hay mensajes de soporte por ahora.</p>
                            ) : (
                              <div className="flex flex-col gap-3">
                                {mensajes.map((msg) => (
                                  <div key={msg.id} onClick={() => setSelectedMessage(msg)} className={`p-4 rounded-xl border cursor-pointer transition hover:scale-[1.01] ${msg.leido ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600' : 'bg-zinc-800 border-yellow-600/50 shadow-lg hover:border-yellow-500'}`}>
                                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-2">
                                      <div className="flex items-center gap-3">
                                        <span className="font-bold text-white">{msg.nombre}</span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-black bg-yellow-500 px-2 py-0.5 rounded">{msg.motivo}</span>
                                      </div>
                                      <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                                    </div>
                                    
                                    <p className="text-gray-400 text-sm line-clamp-2 break-words mb-3">
                                      {msg.mensaje}
                                    </p>

                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-blue-400 hover:text-blue-300 font-bold">Ver detalle completo &rarr;</span>
                                      <button onClick={(e) => { e.stopPropagation(); eliminarMensaje(msg.id); }} className="text-red-500 hover:text-red-400 text-xs font-bold px-2 py-1 bg-black/30 rounded">
                                        Eliminar
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {adminTab === "usuarios" && (
                      <div>
                        <h3 className="text-2xl font-bold mb-6 text-yellow-500 border-b border-zinc-800 pb-2">Administrar Usuarios (Rangos)</h3>
                        
                        <div className="bg-black/30 p-4 rounded-lg mb-8">
                          <h4 className="text-lg font-bold mb-4 text-white">Dar rango de Administrador</h4>
                          <p className="text-sm text-gray-400 mb-4">Ingresa el correo exacto del usuario registrado para darle acceso al panel de administrador.</p>
                          <form onSubmit={agregarAdmin} className="flex flex-col md:flex-row gap-3">
                            <input type="email" placeholder="correo@ejemplo.com" value={nuevoAdminEmail} onChange={(e) => setNuevoAdminEmail(e.target.value)} required className="p-3 bg-zinc-800 border border-zinc-700 rounded text-white flex-1" />
                            <button type="submit" className="bg-yellow-600 text-black font-bold py-3 px-6 rounded hover:bg-yellow-500 transition">Agregar Admin</button>
                          </form>
                        </div>

                        <h4 className="text-lg font-bold mb-4 text-white">Lista de Administradores</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-black text-yellow-500 border-b border-zinc-800">
                                <th className="p-3">Correo Electrónico</th>
                                <th className="p-3 text-right">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {adminsList.map((admin, index) => (
                                <tr key={index} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                  <td className="p-3 font-medium">{admin.email}</td>
                                  <td className="p-3 text-right">
                                    <button onClick={() => eliminarAdmin(admin.email)} className="text-red-500 hover:text-red-400 text-sm font-bold">Quitar Rango</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
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
          <motion.button initial={{ opacity: 0, scale: 0, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0, y: 50 }} transition={{ duration: 0.3 }} onClick={volverArriba} className="fixed bottom-8 right-8 bg-yellow-600 text-black p-4 rounded-full shadow-[0_0_15px_rgba(202,138,4,0.6)] hover:bg-yellow-500 hover:scale-110 transition z-40 flex items-center justify-center" title="Volver arriba">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}