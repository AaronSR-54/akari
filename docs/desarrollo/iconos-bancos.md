# Iconos de bancos

Los distintivos se sirven desde `apps/web/public/banks/<id>.png` y se recortan con un fondo circular en `BankIcon`. El catálogo de identificadores vive en `packages/domain/src/banks.ts`.

En lugar del logotipo alargado de escritorio se usa el **icono oficial de la app móvil** de cada entidad, que es cuadrado y se ve bien dentro de un círculo. Las imágenes se obtuvieron de la iTunes Search API (App Store de España, campo `artworkUrl512`), se convirtieron a PNG de 256 × 256 px y se versionan en el repositorio. No se hotlinkea: la app solo sirve sus propios archivos.

| App de origen | Archivo | Fuente |
| --- | --- | --- |
| BBVA España · Banca Online | `bbva.png` | [App Store ES](https://apps.apple.com/es/app/bbva-espa%C3%B1a-banca-online/id325813155?uo=4) |
| Santander España | `santander.png` | [App Store ES](https://apps.apple.com/es/app/santander-espa%C3%B1a/id408043474?uo=4) |
| CaixaBankNow · Tu Banco móvil | `caixabank.png` | [App Store ES](https://apps.apple.com/es/app/caixabanknow-tu-banco-m%C3%B3vil/id318806094?uo=4) |
| App Banco Sabadell | `sabadell.png` | [App Store ES](https://apps.apple.com/es/app/app-banco-sabadell/id347887638?uo=4) |
| Bankinter Móvil | `bankinter.png` | [App Store ES](https://apps.apple.com/es/app/bankinter-m%C3%B3vil/id356160865?uo=4) |
| Unicaja · Banca Online | `unicaja.png` | [App Store ES](https://apps.apple.com/es/app/unicaja-banca-online/id1467197366?uo=4) |
| Ibercaja | `ibercaja.png` | [App Store ES](https://apps.apple.com/es/app/ibercaja/id515972019?uo=4) |
| ABANCA · Banca Móvil | `abanca.png` | [App Store ES](https://apps.apple.com/es/app/abanca-banca-m%C3%B3vil/id1542078962?uo=4) |
| Kutxabank | `kutxabank.png` | [App Store ES](https://apps.apple.com/es/app/kutxabank/id820843957?uo=4) |
| imagin · Banco Móvil y Finanzas | `imagin.png` | [App Store ES](https://apps.apple.com/es/app/imagin-banco-m%C3%B3vil-y-finanzas/id1069665204?uo=4) |
| Revolut — Más que un banco | `revolut.png` | [App Store ES](https://apps.apple.com/es/app/revolut-m%C3%A1s-que-un-banco/id932493382?uo=4) |
| Pibank | `pibank.png` | [App Store ES](https://apps.apple.com/es/app/pibank/id6752624386?uo=4) |
| Trade Republic · Broker y Banco | `trade-republic.png` | [App Store ES](https://apps.apple.com/es/app/trade-republic-broker-y-banco/id1410703839?uo=4) |

La prueba `apps/web/src/components/bank-icon.test.tsx` comprueba que existe un PNG cuadrado por banco, que la documentación cubre todos y que el componente los dibuja dentro de un contenedor `rounded-full`.

`Efectivo` y `Sin banco / Otro` no tienen archivo: el primero se dibuja en código y el segundo usa el icono genérico de movimiento, ambos sobre el mismo fondo circular.

Las marcas pertenecen a sus respectivas entidades; su uso es identificativo y no implica relación con akari. Al añadir un banco nuevo, incorporar su icono de app, su fila en esta tabla y su entrada en el catálogo.
