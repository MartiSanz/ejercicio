"use strict";

let urlTarea = "https://60c006e4b8d3670017554142.mockapi.io/api/tarea";
let urlCarpetas = "https://60c006e4b8d3670017554142.mockapi.io/api/carpeta";
let idCarpeta;
let nombreCarpeta;

 
document.addEventListener('DOMContentLoaded', (event) => {
    obtenerCarpetas();
 });


// -------------------INICIAR Y CERRAR SESION -----------------------//

let formIngreso = document.querySelector(".form-ingreso");

    formIngreso.addEventListener("submit", function (e) {
        iniciarSesion(e); 
    });

async function iniciarSesion(e){

    e.preventDefault();

    let urlUsuario= "https://60c006e4b8d3670017554142.mockapi.io/api/usuarios";
    
    let formIngreso = document.querySelector(".form-ingreso");
    let formData = new FormData(formIngreso);

    let usuario= formData.get('usuario');
    let clave= formData.get('clave');

    try{
        let res= await fetch(urlUsuario); 
        let user= await res.json();  
        
        console.log(user[0].usuario);
        if((user[0].usuario == usuario) && (user[0].clave == clave)){
            let listaCarpetas = document.querySelector("#lista-carpetas");
            let formIngreso = document.querySelector(".form-ingreso");
            
            listaCarpetas.setAttribute("class", "visible");
            formIngreso.setAttribute("class", "oculto");
        }
        else{
            let mensaje = document.querySelector("#mensaje");
            mensaje.innerHTML= "Incorrecto! Intente de nuevo"
        }
       
    } 
        catch(error){
        console.log(error);
    }

    limpiarInputs();
}

let btnCerrarSesion = document.querySelector("#btn-cerrarSesion")
btnCerrarSesion.addEventListener("click", cerrarSesion);

function cerrarSesion(){
    let inputEditar = document.querySelector("#inputEditar");
    let listTareas = document.querySelector("#list-tareas");
    let listaCarpetas = document.querySelector("#lista-carpetas");
    let ingreso = document.querySelector("#ingresoId"); 


    
    listaCarpetas.setAttribute("class", "oculto");
    inputEditar.setAttribute("class", "oculto");
    listTareas.setAttribute("class", "oculto");
    ingreso.setAttribute("class", "form-ingreso");

}

// ------------------- TAREAS -----------------------//

// ----------------- IMPRIMIR TODAS LAS TAREAS --------------

async function obtenerDatos(){

    //----------- titular
    let mensajeh2 = document.querySelector("#h2-tareas");
    let h2Contenido = "Folders > " + nombreCarpeta;
    mensajeh2.innerHTML = h2Contenido;
     

    let lista = document.querySelector("#lista");
    lista.innerHTML= "";

    try{
        let res= await fetch(urlTarea); 
        let tareas= await res.json();  
        lista.innerHTML= "";
        for(const tarea of tareas){
            if(tarea.clave == idCarpeta){
                let fila = crearFila(tarea);
                lista.appendChild(fila);
            }
        };
    }  catch(error){
        console.log(error);
    }
}


// ------------------- CREAR FILA DE TAREA

function crearFila(tarea){
   
    // ---------- tarea
    let nombre = tarea.nombre; 
    let label = document.createElement("label");
    label.setAttribute("class", "label-tarea");

    if(tarea.realizada == true){
        label.innerHTML = `<input class="check" type="checkbox" checked='checked'>${nombre}</input>`;
    }
    else{
        label.innerHTML = `<input class="check" type="checkbox">${nombre}</input>`;
    }
    
    label.dataset.tareaClave = tarea.clave;
    label.dataset.tareaId = tarea.id;
    label.dataset.tareaNombre = tarea.nombre;
    label.addEventListener("change", marcar);

    // ---------- boton editar
    let btnEditar = document.createElement("input");
    btnEditar.value = "Edit";
    btnEditar.type = "button";
    btnEditar.setAttribute("id", "btn-editar");
    btnEditar.addEventListener("click", editar);
    btnEditar.dataset.tareaId= tarea.id;
    btnEditar.dataset.nombreTarea= tarea.nombre;
    
    // ---------- boton eliminar
    let btnEliminar= document.createElement("input");
    btnEliminar.value = "Delete";
    btnEliminar.type = "button";
    btnEliminar.setAttribute("id", "btn-eliminar");
    btnEliminar.addEventListener("click", eliminar);
    btnEliminar.dataset.tareaId= tarea.id;
    btnEliminar.dataset.nombreTarea= tarea.nombre;

    // ------ filas y columnas
    let fila = document.createElement("tr");
    fila.setAttribute("class", "fila-tarea");
    fila.dataset.tareaId= tarea.id;

    let col1 = document.createElement("td");
    col1.appendChild(label);

    let col2 = document.createElement("td");
    col2.appendChild(btnEditar);

    let col3 = document.createElement("td");
    col3.appendChild(btnEliminar);

    fila.appendChild(col1);
    fila.appendChild(col2);
    fila.appendChild(col3);
 
    return fila;
}

// ------------ REGISTRAR TAREA REALIZADA / NO REALIZADA

async function marcar(){
    
    let check = this.querySelector(".check");
    
    let nuevaTarea;

    if (check.checked == true) {
        console.log("Checkbox is checked..")
        nuevaTarea = {
            "nombre": this.dataset.tareaNombre,
            "clave": this.dataset.tareaClave,
            "realizada": true,
            "id": this.dataset.tareaId
        }
    }

    if (check.checked == false) {
        console.log("Checkbox is checked..")
        nuevaTarea = {
            "nombre": this.dataset.tareaNombre,
            "clave": this.dataset.tareaClave,
            "realizada": false,
            "id": this.dataset.tareaId
        }

    };
    
    await editarDato(this.dataset.tareaId, nuevaTarea);
}


// --------------- ELIMINAR TAREA

async function eliminar(){

    let tareaId= this.dataset.tareaId;

    await eliminarDato(urlTarea, tareaId);

    obtenerDatos();
}

// -------------- EDITAR TAREA

function editar(){

    let tareaId = this.dataset.tareaId;
    let nombre =  this.dataset.nombreTarea;
    let mensajeh2 = document.querySelector("#h2-editing");
    let h2Contenido = "Editing Task '" + nombre + "' ";
    mensajeh2.innerHTML = h2Contenido;

    let mensajeInput = document.querySelector("#inputTareaEdit");
    mensajeInput.placeholder = nombre;
    
    let formEditar = document.querySelector("#form-edit-tareas");
        formEditar.dataset.btnId = tareaId; // guardo desde que boton lo llama

    formEditar.addEventListener("submit", function (e) {
        editarTarea(this.dataset.btnId, e); });

    let btnCancel = document.querySelector("#btn-cancelarCambio");  
    btnCancel.addEventListener("click", cancelar);
}

async function editarTarea(idTarea, e){

    e.preventDefault();
    let mensaje = document.querySelector("#mensajeEdit");
    mensaje.innerHTML = " ";

    let formTareas = document.querySelector("#form-edit-tareas");

    let formData = new FormData(formTareas);

    let nombre= formData.get('tareaModificada');

    let nuevaTarea = {
        "nombre": nombre,
        "clave": idCarpeta 
    }    

    await editarDato(idTarea, nuevaTarea);
    let mensajeInput = document.querySelector("#inputTareaEdit");
        mensajeInput.placeholder = " ";
        let mensajeh2 = document.querySelector("#h2-editing");
        mensajeh2.innerHTML =  "Editing Task"; 
        obtenerDatos();
        
}

// ----------- CANCELAR EDICION DE TAREA

function cancelar(){
    let mensajeInput = document.querySelector("#inputTareaEdit");
    mensajeInput.placeholder = " ";
    
    let mensajeh2 = document.querySelector("#h2-editing");
    mensajeh2.innerHTML =  "Editing Task"; 
    
    limpiarInputs();
}


// --------------- AGREGAR TAREA --------------------

let formTareas = document.getElementById("form-tareas");
formTareas.addEventListener("submit", agregar); 

async function agregar(e){  
    await agregarTarea(e);
    limpiarInputs(); 
    obtenerDatos();
}

// -------------------- AGREGA NUEVA TAREA -------------------

async function agregarTarea(e){

    e.preventDefault();

    let formTareas = document.querySelector("#form-tareas");

    let formData = new FormData(formTareas);

    let nombre= formData.get('tareaNueva');

    let tarea = {
        "nombre": nombre,
        "clave": idCarpeta 
    }

    await agregarDato(urlTarea, tarea);

}


// -----------------------------------------------------------------------------------------//



//------------------------ CARPETAS ------------------------ //

// ----------------- IMPRIMIR TODAS LAS CARPETAS --------------

async function obtenerCarpetas(){

    let lista = document.querySelector("#tabla-carpetas");
    lista.innerHTML= "";

    try{
        let res= await fetch(urlCarpetas); 
        let carpetas= await res.json();  
        lista.innerHTML= "";
        for(const carpeta of carpetas){
            let fila = crearFilaCarpeta(carpeta);
            lista.appendChild(fila);
        };
    }  catch(error){
        console.log(error);
    }
}


// ------------------- CREAR FILA DE CARPETAS

function crearFilaCarpeta(carpeta){ // invocada por obtenerCarpetas
   
    // ---------- carpeta
    let h5 = document.createElement("h5");
    h5.setAttribute("id", "h5-carpeta");
    h5.innerHTML = "- " + carpeta.nombre;

    // ---------- boton ver tareas
    let btnVer = document.createElement("input");
    btnVer.value = "View items";
    btnVer.type = "button";
    btnVer.setAttribute("id", "btn-ver");
    btnVer.addEventListener("click", verTareas);
    btnVer.dataset.carpetaId= carpeta.id;
    btnVer.dataset.nombreCarpeta= carpeta.nombre;
 
    // ---------- boton eliminar
    let btnEliminar= document.createElement("input");
    btnEliminar.value = "Delete";
    btnEliminar.type = "button";
    btnEliminar.setAttribute("id", "btn-eliminarCarpeta");
    btnEliminar.addEventListener("click", eliminarCarpeta);
    btnEliminar.dataset.carpetaId= carpeta.id;
    btnEliminar.dataset.nombreCarpeta= carpeta.nombre;

    // ------ filas y columnas
    let fila = document.createElement("tr");
    fila.setAttribute("id", "fila-carpeta");
    fila.dataset.carpetaId= carpeta.id;
    
    let col1 = document.createElement("td");
    col1.appendChild(h5);
    
    let col2 = document.createElement("td");
    col2.appendChild(btnVer);
    
    let col3 = document.createElement("td");
    col3.appendChild(btnEliminar);
    
    fila.appendChild(col1);
    fila.appendChild(col2);
    fila.appendChild(col3);
 
    return fila;
}

// --------------- ELIMINAR CARPETA

async function eliminarCarpeta(){
    let carpetaId= this.dataset.carpetaId;

    eliminarTareas();

    await eliminarDato(urlCarpetas, carpetaId);

    obtenerCarpetas();
    cerrarCarpeta();
}

// -------------- ELIMINAR TODAS LAS TAREAS PERTENECIENTES A UNA CARPETA

async function eliminarTareas(){
    
    let label = document.querySelectorAll("label");

    try{
        for(let i=0; i < label.length; i++){
            if(label[i].dataset.tareaClave == idCarpeta){
                await eliminarDato(urlTarea, label[i].dataset.tareaId);
            }
        }
        
    } catch (error){
        console.log(error);
    }
}

// -------------- CERRAR TAREAS DE CARPETA

let btnCerrar = document.querySelector("#btn-cerrarCarpeta")
btnCerrar.addEventListener("click", cerrarCarpeta);

function cerrarCarpeta(){
    let inputEditar = document.querySelector("#inputEditar");
    let listTareas = document.querySelector("#list-tareas");
    
    inputEditar.setAttribute("class", "oculto");
    listTareas.setAttribute("class", "oculto");
}

// -------------- VER TAREAS 

function verTareas(){

    let inputEditar = document.querySelector("#inputEditar");
    let listTareas = document.querySelector("#list-tareas");
    
    inputEditar.setAttribute("class", "visible");
    listTareas.setAttribute("class", "visible");

    idCarpeta = this.dataset.carpetaId;
    nombreCarpeta = this.dataset.nombreCarpeta;

    obtenerDatos();

}

// --------------- AGREGAR NUEVA CARPETA --------------------

let formCarpetas = document.getElementById("form-carpetas");
formCarpetas.addEventListener("submit", agregarCarpeta); 

async function agregarCarpeta(e){  
    await agregarNuevaCarpeta(e);
    limpiarInputs(); 
    obtenerCarpetas();
}

async function agregarNuevaCarpeta(e){

    e.preventDefault();

    let formCarpetas = document.querySelector("#form-carpetas");
    let formData = new FormData(formCarpetas);
    let nombre= formData.get('carpetaNueva');

    let carpeta = {
        "nombre": nombre 
    }

    await agregarDato(urlCarpetas, carpeta);

}


// ------------- FUNCIONES ELIMINAR, AGREGAR Y EDITAR

async function eliminarDato(url, id){

    try{
        let res = await fetch(url + "/" + id, {
        "method": "DELETE",
        });

        if(res.status === 200){
            console.log("eliminado!");
        }

        limpiarInputs();
        
    } catch (error){
        console.log(error);
    }
}


async function editarDato(id, nuevo){
    try{
        let res = await fetch(urlTarea + "/" + id, {
        "method": "PUT",
        "headers": {"Content-type": "application/json"},
        "body": JSON.stringify(nuevo) 
        });

        if(res.status === 200){
            console.log("Editado!");
        }

        let mensajeInput = document.querySelector("#inputTareaEdit");
        mensajeInput.placeholder = " ";
        let mensajeh2 = document.querySelector("#h2-editing");
        mensajeh2.innerHTML =  "Editing Task"; 
        obtenerDatos();
        limpiarInputs();

    } catch (error){
        console.log(error);
    }
}

async function agregarDato(url, elemento){

    try{
        let res = await fetch(url, {
            "method": "POST",
            "headers": {"Content-Type" : "application/JSON"},
            "body": JSON.stringify(elemento)            
        });

        if(res.status === 201){
            console.log("cargo carpeta");
        }

        obtenerDatos();
        limpiarInputs();
        
    } catch(error){
        console.log(error);
    }
}

// --------------- LIMPIAR INPUTS -------------

function limpiarInputs(){

    let inputs = document.getElementsByClassName("inputT");
    
    for(let item of inputs){
        item.value ="";
    } 
}