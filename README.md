#  Base de Batos 🕵🏻‍♂️ — Gestión para la generación automática de planes de entrenamiento

> Proyecto integrador de **Bases de Datos II** e **Ingeniería de Software**  
> Curso 2026–2027 | Carrera: Ciencia de la Computación | Universidad de La Habana  
> Estado: **En desarrollo** 🚧

---

## 📑 Tabla de contenidos

- [Descripción del proyecto](#-descripción-del-proyecto)
- [Equipo](#-equipo)
- [Objetivos](#-objetivos)
- [Funcionalidades principales](#-funcionalidades-principales)
- [Modelo de datos preliminar](#-modelo-de-datos-preliminar)
- [Arquitectura y tecnologías](#-arquitectura-y-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación y ejecución](#-instalación-y-ejecución)
- [Pruebas](#-pruebas)
- [Estructura del repositorio](#-estructura-del-repositorio)
- [Buenas prácticas y Git](#-buenas-prácticas-y-git)
- [Documentación](#-documentación)
- [Evaluación](#-evaluación)
- [Bibliografía](#-bibliografía)
- [Licencia](#-licencia)

---

## 📌 Descripción del proyecto

El proyecto consiste en una **aplicación web** para la **gestión y generación automática de planes de entrenamiento** en un gimnasio. El sistema debe administrar:

- Ejercicios disponibles.
- Programas de entrenamiento.
- Grupos musculares y tipos de ejercicio.
- Entrenadores encargados de crear y validar rutinas.
- Clientes que ejecutan dichas rutinas.
- Sesiones de entrenamiento y reportes de progreso.

Las rutinas deben adaptarse a criterios como nivel de intensidad, tipo de ejercicio y distribución de grupos musculares durante el ciclo de entrenamiento. Además, el sistema debe permitir la generación automática de rutinas, su validación por parte del jefe de sala, la asignación a clientes y el registro de cada sesión ejecutada.

Este proyecto se desarrolla de forma conjunta para las asignaturas **Bases de Datos II** e **Ingeniería de Software**, manteniendo la unidad lógica de cada materia y evitando la duplicación de contenidos.

---

## 👥 Equipo

**Nombre del equipo:** Base de Batos 🕵🏻‍♂️

| Integrante | Grupo | Telegram | GitHub |
|------------|-------|----------|--------|
| Bryan Ernesto Moya Aquino | C312 | [@BM0ya](https://t.me/BM0ya) | [el-M0ya](https://github.com/el-M0ya) |
| Héctor Duarte Vázquez | C311 | [@hduartev](https://t.me/hduartev) | [HectorDuarte911](https://github.com/HectorDuarte911) |
| Fabio Hernández Piloto | C311 | [@FabioPilot](https://t.me/FabioPilot) | [Fabio-Pilot](https://github.com/Fabio-Pilot) |
| Gabriel Pérez Suárez | C312 | [@GabrielPS1016](https://t.me/GabrielPS1016) | [GaboPS1016](https://github.com/GaboPS1016) |
| Alex Leonardo Cuervo Grillo | C311 | [@cuervogrillo](https://t.me/cuervogrillo) | [AlexCuervo](https://github.com/AlexCuervo) |

**Repositorio:** `https://github.com/el-M0ya/Proyecto_Conjunto_de_Bases_de_Datos_II_e_Ingenier-a_de_Software`  

---

## 🎯 Objetivos

- Consolidar y profundizar los conceptos, métodos y herramientas esenciales abordados en **Bases de Datos I**.
- Diseñar, implementar, reingenierizar y/o mantener un **Sistema de Bases de Datos** acorde al estado del arte.
- Desarrollar una aplicación que permita a los usuarios finales el intercambio efectivo de información de forma intuitiva y amigable.
- Aplicar buenas prácticas de **Ingeniería de Software**: control de versiones, planificación, arquitectura desacoplada, pruebas unitarias y patrones de diseño.
- Trabajar en equipos multidisciplinarios, integrando los problemas de aplicación en un solo proyecto conjunto.

---

## ⚙️ Funcionalidades principales

### Administrador
- Evitar la existencia de ejercicios duplicados.
- Impedir la asignación doble de rutinas a los clientes.
- Gestionar usuarios, roles y permisos.

### Entrenador
- Ingresar ejercicios al banco existente.
- Clasificar ejercicios por grupo muscular y tipo (fuerza, cardio o flexibilidad).
- Otorgar nivel de intensidad (bajo, medio o alto).
- Generar rutinas de forma automática a partir de ejercicios seleccionados.
- Ver rutinas de otros entrenadores que atienden el mismo programa de entrenamiento.
- Consultar reportes de progreso de los clientes.

### Jefe de sala
- Revisar y aprobar las rutinas generadas.
- Indicar la confección de otra rutina bajo sus criterios.
- Registrar observaciones y fechas de validación.

### Cliente
- Acceder a las rutinas que le son asignadas.
- Registrar cada sesión de entrenamiento ejecutada.
- Consultar reportes de progreso.
- Solicitar de forma virtual un ajuste de rutina y especificar el entrenador que ejecutará esta tarea.

### Sistema
- Generar rutinas automáticamente según parámetros configurables: proporción de ejercicios por tipo, cobertura de grupos musculares, cantidad total de ejercicios, nivel de intensidad, etc.
- Almacenar la estructura variable de bloques de cada rutina (calentamiento, circuitos, series, descansos).
- Garantizar disponibilidad inmediata de la rutina activa del cliente durante la sesión.
- Generar reportes detallados:
  1. Listado de rutinas generadas automáticamente para un programa específico.
  2. Ejercicios más utilizados en rutinas finales, clasificados por intensidad y grupo muscular.
  3. Rutinas validadas por un revisor determinado, con fecha y observaciones.
  4. Reporte de desempeño de clientes en una rutina, por intensidad y tasas de finalización.
  5. Comparación de rutinas entre programas, verificando equilibrio de grupos musculares e intensidades.
  6. Correlación entre nivel de intensidad y rendimiento promedio, incluyendo los 10 ejercicios con mayor tasa de abandono y comparación de ajustes manuales.
- Exportar la información mostrada a archivos **PDF**.
- Permitir ordenar cada columna de los resultados según intereses del usuario.

---

## 🗄️ Modelo de datos preliminar

Entidades principales identificadas:

- **Usuario** (Administrador, Entrenador, Jefe de Sala, Cliente)
- **ProgramaEntrenamiento**
- **Entrenador**
- **Cliente**
- **Ejercicio**
- **GrupoMuscular**
- **TipoEjercicio**
- **NivelIntensidad**
- **Rutina**
- **BloqueRutina** / **EstructuraRutina**
- **SesionEntrenamiento**
- **SolicitudAjuste**
- **ValidacionRutina**
- **ParametroRutina**
- **Sede**

> El diseño conceptual relacional extendido (MERX) se documentará en el informe de **Diseño de la base de datos** correspondiente a la semana 5.

---

## 🏗️ Arquitectura y tecnologías

> Las tecnologías definitivas se confirmarán durante el desarrollo. Propuesta inicial:

| Capa | Tecnología prevista |
|------|---------------------|
| Frontend | `          ` |
| Backend | `          ` |
| Base de datos | `          ` |
| ORM | `          ` |
| Contenedores | Docker / Docker Compose |
| Pruebas | `          ` |
| Control de versiones | Git + GitHub |

**Características arquitectónicas:**
- Aplicación desacoplada, extensible y mantenible.
- Implementación de al menos **dos patrones de diseño**.
- Pruebas unitarias tanto en back-end como en front-end.
- Uso de variables de entorno para credenciales y configuración sensible.

---

## 📋 Requisitos

- Docker y Docker Compose.
- Git.

---

## 🚀 Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/el-M0ya/Proyecto_Conjunto_de_Bases_de_Datos_II_e_Ingenier-a_de_Software
cd Proyecto_Conjunto_de_Bases_de_Datos_II_e_Ingenier-a_de_Software

```

---

## 📁 Estructura del repositorio
```text
.
├── backend/                # Código del servidor
├── frontend/               # Código de la aplicación web
├── db/                     # Scripts SQL, migraciones, respaldos
├── docs/                   # Informes, documentación técnica, diagramas
├── docker/                 # Dockerfiles y configuración de contenedores
├── tests/                  # Pruebas unitarias e integración
├── .env.example            # Variables de entorno de ejemplo
├── .gitignore              # Archivos excluidos del versionado
├── docker-compose.yml      # Orquestación de servicios
├── README.md               # Este archivo
└── ...
```
---
## 📖 Bibliografía
- García Hernández, L.; Montes de Oca Richardson, M. Sistemas de Bases de Datos: Modelación y Diseño. Editorial Félix Varela. Cuba, 2005.

- Date, C. J. Introduction to Database Systems. 7ª edición. Addison Wesley. EUA, 2000.

- Hansen, G. W.; Hansen, J. V. Database Management and Design. 2ª edición. Prentice Hall. Reino Unido, 1998.

- Conferencias y otros materiales de interés.

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

```text
MIT License

Copyright (c) 2025 CETED — Universidad de La Habana

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga
una copia de este software y de los archivos de documentación asociados...
```

---

## 📬 Contacto
Para dudas o sugerencias, contactar a cualquier integrante del equipo a través de Telegram o GitHub.

