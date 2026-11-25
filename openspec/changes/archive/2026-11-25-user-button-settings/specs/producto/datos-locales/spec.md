# Spec Delta

## ADDED Requirements

### Requirement: Nombre del perfil persistente

La aplicación SHALL guardar el nombre editable del perfil en los ajustes locales del dispositivo y SHALL reutilizarlo en el panel y en el shell tras recargar. El nombre MUST NOT enviarse a ningún servidor ni requerir autenticación.

#### Scenario: Guardado y persistencia

- **WHEN** se guarda un nombre válido desde el panel de ajustes
- **THEN** el nombre se escribe en los ajustes locales y sigue visible en `/ajustes` y en el avatar del shell después de recargar

#### Scenario: Validación del nombre

- **WHEN** se intenta guardar un nombre vacío o que supera la longitud permitida
- **THEN** el cambio se rechaza con un mensaje comprensible y el nombre guardado permanece intacto

#### Scenario: Dato existente sin nombre

- **WHEN** se abre una instalación creada antes de que existiera este campo
- **THEN** se usa el nombre por defecto sin borrar ni alterar los ajustes ya guardados
