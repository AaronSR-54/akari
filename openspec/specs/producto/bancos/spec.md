# Producto · Bancos Specification

## Purpose

Define el catálogo local de bancos de akari, la asociación opcional de cuentas a un banco y la resolución del icono que identifica el origen de cada movimiento, sin depender de servicios remotos.

## Requirements

### Requirement: Catálogo local de bancos

La aplicación SHALL ofrecer un catálogo fijo de bancos con identificador, nombre e icono SVG servido desde la propia aplicación, e SHALL incluir las opciones especiales `Efectivo` y `Sin banco / Otro`. El catálogo MUST NOT descargar recursos de servicios externos en tiempo de ejecución.

#### Scenario: Selector de bancos

- **WHEN** se abre el selector de bancos
- **THEN** se muestran las entidades del catálogo junto a «Efectivo» y «Sin banco / Otro», cada una con su icono o distintivo

#### Scenario: Uso sin conexión

- **WHEN** la aplicación se usa sin conexión
- **THEN** los iconos del catálogo siguen mostrándose desde los recursos locales de la aplicación

#### Scenario: Opciones especiales

- **WHEN** se elige «Efectivo» o «Sin banco / Otro»
- **THEN** no se asigna ninguna entidad bancaria inventada y la opción elegida queda identificada de forma distinta

### Requirement: Asociación opcional de cuentas a un banco

La aplicación SHALL permitir guardar la asociación de una cuenta a un banco del catálogo como dato opcional y SHALL conservar el icono genérico en las cuentas sin banco. La asociación MUST NOT ser obligatoria para crear o editar una cuenta.

#### Scenario: Cuenta asociada

- **WHEN** se crea o edita una cuenta y se elige un banco del catálogo
- **THEN** la cuenta queda asociada a ese banco y el selector muestra el banco guardado al volver a abrir el formulario

#### Scenario: Cuenta sin banco

- **WHEN** no se elige banco o se elige «Sin banco / Otro»
- **THEN** la cuenta se guarda sin entidad bancaria y conserva el icono genérico en sus movimientos

#### Scenario: Cuentas existentes tras una actualización

- **WHEN** se abre una instalación con cuentas creadas antes de este cambio
- **THEN** las cuentas conservan todos sus datos y aparecen sin banco hasta que se editen

### Requirement: Icono del banco en los movimientos

La aplicación SHALL mostrar el icono del banco de la cuenta origen en los últimos movimientos del resumen, en los de una cuenta, en el listado y en la modal de detalle, en lugar del icono genérico. SHALL usar el icono genérico si la cuenta no tiene banco. Con el listado filtrado por cuenta, el detalle SHALL NOT repetir el icono.

#### Scenario: Movimiento de una cuenta con banco

- **WHEN** un movimiento pertenece a una cuenta con banco asignado
- **THEN** su fila muestra el icono de ese banco en el resumen, en la cuenta y en el listado, y su detalle muestra el mismo icono

#### Scenario: Movimiento de una cuenta sin banco

- **WHEN** un movimiento pertenece a una cuenta sin banco asignado
- **THEN** se muestra el icono genérico de movimiento en lugar de un icono de banco

#### Scenario: Detalle con filtro por cuenta

- **WHEN** se abre el detalle de un movimiento desde un listado filtrado por una cuenta
- **THEN** el detalle no muestra el icono del banco porque la cuenta ya está identificada en el filtro

#### Scenario: Cambio de banco de la cuenta

- **WHEN** se cambia el banco de una cuenta que ya tiene movimientos
- **THEN** esos movimientos muestran el icono del nuevo banco sin necesidad de editar cada movimiento
