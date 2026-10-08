# HAREMS — Prueba gratuita (Luna y Hana, 10 mensajes cada una) y descuento VIP

Este documento describe la implementación de los mensajes gratuitos por usuario **y** por personaje.
El mismo archivo vive en `haremapi` (backend) y en `haremsweb` (frontend).

## 0. Regla vigente (2026-10-08, segunda aclaración del cliente)

**PLAN GRATIS**
- **Luna** (`luna-valmont`): 10 mensajes gratis.
- **Hana** (`hana-mori`): 10 mensajes gratis.
- **Todos los demás personajes requieren un plan de pago.** Un usuario FREE que intente chatear con
  cualquier otro (aunque manipule la URL, el `characterSlug` o llame a la API a mano) recibe
  `403 FREE_CHARACTER_NOT_AVAILABLE` sin que se cree contador, se guarde historial ni se llame a la IA.
- Los contadores son independientes: no son 20 mensajes intercambiables ni 10 globales.
- Los planes de pago (Pase 3 días, Premium, VIP) conservan exactamente sus reglas anteriores.

**VIP**
- **10% de descuento en créditos de imagen.** Ya estaba implementado en el backend antes de este
  cambio (`CreditPricingService` + `ExtraCreditPackage.vipPriceMxn`), y el cobro de PayPal usa el
  precio final calculado ahí. Solo se agregó el beneficio a la tarjeta VIP y a los avisos de VIP.
  Aplica únicamente con VIP **activo** (plan efectivo VIP; un VIP vencido baja a FREE). Premium,
  Pase 3 días y FREE pagan precio completo. Precios: 10 créditos $59 → $53.10; 20 créditos $99 → $89.10.

**Dónde se cambia cada cosa**

| Qué | Backend (fuente de verdad) | Frontend (solo textos) |
|---|---|---|
| Personajes gratuitos | env `FREE_TRIAL_CHARACTERS` (slugs separados por coma; default `luna-valmont,hana-mori`) → `app.limits.free-trial-characters` en `application.yml` | `FREE_TRIAL_CHARACTER_IDS` en `haremsweb/lib/data.ts` |
| Mensajes por personaje | env `FREE_MESSAGES_PER_CHARACTER` (default 10) | `FREE_MESSAGES_PER_CHARACTER` en `haremsweb/lib/data.ts` |
| % descuento VIP | `VIP_DISCOUNT_MULTIPLIER` en `credit/ExtraCreditPackage.java` (`0.90` = 10%) | `VIP_IMAGE_CREDIT_DISCOUNT_PERCENT` en `haremsweb/lib/data.ts` |

Ejemplo: "ahora Luna, Hana y Kiara" → en Render `FREE_TRIAL_CHARACTERS=luna-valmont,hana-mori,kiara-blake`
y en el frontend agregar `"kiara-blake"` a `FREE_TRIAL_CHARACTER_IDS`. No hay que tocar lógica: las
tarjetas, el chat y los textos ("10 mensajes gratis con Luna, Hana y Kiara") se ajustan solos.

Los personajes se identifican por **slug** (`characters.slug`, columna única; es el mismo id que
usa el frontend y que viaja como `characterSlug`/`characterId`). No se usan ids numéricos.

> Las secciones siguientes describen el sistema de contadores (implementado el 2026-10-07). Donde
> hablen de la regla anterior ("todas las chicas excepto Victoria") manda la sección 0.

## 1. Resumen

- Cada usuario sin un plan que le dé acceso a un personaje **de la prueba (Luna y Hana)** tiene
  **10 mensajes gratis con ese personaje**. El contador es independiente por personaje: gastar los
  10 con Luna no toca los de Hana.
- Son conversaciones **reales**: mismo endpoint `/chat/send`, mismo modelo de OpenRouter, mismo
  prompt y personalidad de cada chica, mismo historial y mismo progreso de conexión. No existe un
  chat paralelo ni respuestas prefabricadas.
- El **backend es la fuente de verdad**: el frontend solo muestra el contador.
- Historial de la regla: primero Luna y Hana con 5 mensajes; el 2026-10-07/08 se abrió a todas
  las chicas excepto Victoria con 10; **hoy (2026-10-08) vuelve a ser solo Luna y Hana, con 10
  mensajes cada una** (aclaración del cliente).
- **Sin fotos en la prueba:** pedir fotos sigue siendo solo para planes de pago (el backend lo
  rechaza con 403 aunque el usuario tenga mensajes gratis con esa chica).

## 2. Quién usa el contador (free vs pagado)

La decisión se toma en `AccessControlService.planGrantsCharacterAccess(plan, personaje, usuario)`,
con el plan *efectivo* (`ProfileService.resolveEffectivePlan`, que baja a FREE un plan vencido):

| Plan efectivo   | Personajes FREE / PREMIUM          | Personaje VIP (Victoria)          |
|-----------------|------------------------------------|-----------------------------------|
| FREE            | Luna y Hana: prueba gratis (10 c/u); resto bloqueado — exige plan | bloqueada — exige VIP |
| TRIAL_3_DAYS    | acceso completo (reglas del pase)  | bloqueada — exige VIP             |
| PREMIUM         | acceso completo (tope 980/mes)     | bloqueada — exige VIP             |
| VIP             | acceso completo (tope 2000/mes)    | acceso completo                   |
| Rol ADMIN       | acceso completo                    | acceso completo                   |

- Solo entran en la prueba los slugs de `app.limits.free-trial-characters`
  (`AccessControlService.isIncludedInFreeTrial`). Para el resto, sin plan, el estado trae
  `requiredPlan: "PREMIUM"` (o `"VIP"` para Victoria), `canSendMessage: false`, y `/chat/send`
  responde 403 `FREE_CHARACTER_NOT_AVAILABLE` (con `freeUsage`) sin crear contador.
- Con un plan pagado que no cubre al personaje (Premium/Pase → Victoria) se mantiene el 403
  `CHARACTER_ACCESS_DENIED` de siempre.
- Filas de `usage_limits` de otras chicas que quedaron de la regla anterior **no se borran**:
  simplemente ya no dan acceso gratuito (si el usuario compra un plan, no importan).
- Con acceso completo se aplican exactamente las reglas que ya existían (tope mensual de cuenta de
  Premium/VIP). No cambió ningún precio ni nada de PayPal.
- Si un plan vence, en la siguiente petición vuelve a aplicarse la prueba gratis con lo que quede
  de cada personaje.

## 3. Base de datos y migración

No se creó una tabla nueva: se reutilizó `usage_limits`, que ya era un contador por
`(user_id, character_id)` con índice único.

Columnas nuevas en `usage_limits`:

| Columna              | Tipo      | Notas                                                          |
|----------------------|-----------|----------------------------------------------------------------|
| `free_messages_used` | integer   | nullable; mensajes consumidos de la prueba con ese personaje   |
| `created_at`         | timestamp | nullable                                                       |
| `updated_at`         | timestamp | nullable                                                       |

Columna e índice nuevos en `messages`:

| Columna             | Tipo         | Notas                                                          |
|---------------------|--------------|----------------------------------------------------------------|
| `client_message_id` | varchar(64)  | nullable; id por envío para idempotencia                       |
| índice `idx_messages_conversation_client_id` | (conversation_id, client_message_id) | |

**Sistema de migraciones:** el proyecto usa `spring.jpa.hibernate.ddl-auto: update` (no hay
Flyway/Liquibase). Hibernate agrega estas columnas e índice al arrancar. Todas son *nullable*,
así que el ALTER es seguro con tablas llenas. No se borra ni modifica ningún dato existente.

**Migración de datos (usuarios existentes):** `FreeMessageBackfill` (ApplicationRunner,
idempotente) ejecuta al arrancar:

```sql
UPDATE usage_limits SET free_messages_used = messages_used WHERE free_messages_used IS NULL;
```

Así cada usuario conserva lo que ya gastó: alguien que usó 5 de 5 con Luna ahora tiene 5 de 10.
Mientras la fila no se migre, el código trata `NULL` como `messages_used`
(`UsageLimit.getEffectiveFreeMessagesUsed`), de modo que el resultado es el mismo aunque el
backfill fallara. No se tocan conversaciones, historial, cuentas, perfiles, compras ni suscripciones.

Equivalente SQL manual (solo como referencia; **no hace falta ejecutarlo**, Hibernate lo hace):

```sql
ALTER TABLE usage_limits ADD COLUMN IF NOT EXISTS free_messages_used integer;
ALTER TABLE usage_limits ADD COLUMN IF NOT EXISTS created_at timestamp(6);
ALTER TABLE usage_limits ADD COLUMN IF NOT EXISTS updated_at timestamp(6);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS client_message_id varchar(64);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_client_id ON messages (conversation_id, client_message_id);
UPDATE usage_limits SET free_messages_used = messages_used WHERE free_messages_used IS NULL;
```

## 4. Endpoints

### `GET /api/characters/{slug}/free-message-status`
Público (`/characters/**` ya lo era). Con token devuelve el estado real; sin token, el cupo inicial.

```json
{
  "characterId": "luna-valmont",
  "characterName": "Luna Valmont",
  "limit": 10,
  "used": 4,
  "remaining": 6,
  "hasPaidAccess": false,
  "freeTrialApplies": true,
  "canSendMessage": true,
  "authenticated": true,
  "requiredPlan": null
}
```

Para un personaje fuera de la prueba sin plan: `requiredPlan: "PREMIUM"` (Victoria: `"VIP"`),
`limit/used/remaining: 0`, `canSendMessage: false`.
404 si el personaje no existe o está inactivo ("Muy pronto").

### `GET /api/characters/free-message-status`
Lo mismo para todos los personajes activos en una sola consulta (tarjetas y selector del chat).

### `POST /api/chat/send` (existente, extendido)
Request — se agregó `clientMessageId` opcional (`[A-Za-z0-9_-]`, máx. 64) y un máximo de 4000
caracteres por mensaje:

```json
{ "characterSlug": "luna-valmont", "message": "hola", "clientMessageId": "6f1c…" }
```

Response — se agregó `freeUsage` (mismo formato que arriba) para actualizar el contador sin recargar.
Se conservan todos los campos anteriores (`messagesUsed`/`messagesLimit` siguen existiendo).

```json
{
  "conversationId": 12, "reply": "…", "messagesUsed": 5, "messagesLimit": 10,
  "connectionLevel": 1, "relationshipStatus": "CURIOSA", "connectionLeveledUp": false,
  "freeUsage": { "limit": 10, "used": 5, "remaining": 5, "…": "…" }
}
```

### Errores con código de negocio

| Caso                                 | HTTP | `code`                          |
|--------------------------------------|------|---------------------------------|
| Prueba agotada con ese personaje     | 403  | `FREE_MESSAGE_LIMIT_REACHED` (+ `freeUsage`) |
| Tope mensual Premium/VIP alcanzado   | 403  | `MONTHLY_MESSAGE_LIMIT_REACHED` |
| IA no respondió (mensaje de prueba)  | 503  | `AI_UNAVAILABLE`                |
| Usuario FREE + personaje fuera de la prueba | 403 | `FREE_CHARACTER_NOT_AVAILABLE` (+ `freeUsage` con `requiredPlan`) |
| Plan pagado sin acceso (Victoria sin VIP) / fotos sin plan | 403  | `CHARACTER_ACCESS_DENIED` |
| Rate limit (ya existía, 40/min)      | 429  | —                               |

## 5. Lógica del límite (backend)

`ChatService.sendMessage` corre en **una sola transacción**:

1. Identifica al usuario (JWT; el chat sigue requiriendo sesión, no se abrió chat anónimo).
2. Busca el personaje y exige que esté activo (`getActiveCharacterEntityBySlug`).
3. `AccessControlService.reserveChatMessage`:
   - resuelve el plan efectivo y si aplica la prueba gratis;
   - crea la fila `usage_limits` si no existe (`INSERT … ON CONFLICT DO NOTHING`, sin carreras);
   - **bloquea la fila** con `SELECT … FOR UPDATE` hasta el commit — dos envíos simultáneos del
     mismo usuario al mismo personaje se procesan uno tras otro;
   - si la prueba aplica y `remaining == 0` → `FREE_MESSAGE_LIMIT_REACHED` (no se llama a la IA);
   - si hay plan → valida el tope mensual como antes.
   - **No consume nada todavía.**
4. Si llegó un `clientMessageId` ya procesado, devuelve la respuesta ya guardada (no llama a la
   IA, no descuenta, no duplica historial).
5. Guarda el mensaje del usuario y llama a la IA (`AiChatService.generate`, mismo modelo y
   cadena de fallbacks de siempre).
6. Si la IA no respondió de verdad (todos los modelos fallaron) y el mensaje era de prueba →
   `AI_UNAVAILABLE` y **rollback**: no se guarda el mensaje y no se descuenta.
7. Guarda la respuesta y `commitChatMessage` incrementa el contador.

No se descuenta por: abrir el chat, recargar, mensajes vacíos (400), personaje inexistente (404),
errores de IA/timeout, doble envío, peticiones rechazadas, ni mensajes bloqueados por moderación
(que nunca llegan a la IA). Usuarios con plan conservan el comportamiento anterior ante fallos de
IA (respuesta local de respaldo).

## 6. Cambiar 10 → otra cantidad

Una sola variable de entorno en Render:

```
FREE_MESSAGES_PER_CHARACTER=15
```

(default `10` en `application.yml` → `app.limits.free-messages-per-character`). El límite no se
guarda por fila, así que aplica a todos los usuarios al reiniciar, conservando lo ya usado.

En el frontend los textos de marketing usan la constante `FREE_MESSAGES_PER_CHARACTER` de
`haremsweb/lib/data.ts`; cámbiala al mismo número. El contador dentro del chat y en las tarjetas
viene del backend, así que siempre es exacto.

No se agregó una pantalla de admin para este número: el panel actual no tiene una sección de
configuración y crearla implicaba construir un sistema nuevo de settings persistidos.

## 7. Frontend

- **Chat** (`app/chat/ChatClient.tsx`): línea discreta sobre el input con barra fina:
  "Prueba gratis: 10 mensajes con Luna" → "Te quedan 6 mensajes gratis con Luna (6/10)" →
  con 3 o menos en ámbar + enlace "Ver planes" → "Último mensaje gratuito con Luna".
  Al llegar a 0 el input se reemplaza por una tarjeta "Ya conociste a Luna ✨" con
  **[Ver planes]** (`/planes`) y **[Explorar otros personajes]** (`/personajes`). Sin popups.
  Se puede cambiar a otra chica que aún tenga mensajes. Al elegir a Victoria sin VIP aparece el
  aviso "Victoria es exclusiva VIP" con el CTA al plan VIP (si se abre por URL, el compositor
  muestra ese mismo aviso). Si el backend rechaza un envío, el mensaje
  optimista se retira y el texto vuelve al input. Doble Enter/click protegido (candado + `clientMessageId`).
- **Tarjetas / perfil** (`CharacterCard`, `CharacterDetailActions`): etiqueta "10 mensajes gratis",
  "6 mensajes restantes" o "Prueba finalizada"; botón "Probar gratis" en chicas fuera del plan.
- **Selector del chat (escritorio)**: el mismo texto debajo de cada chica.
- **Inicio con sesión**: recomienda también chicas con prueba disponible.
- **Soporte**: "Soporte: noe@harems.site" en el footer (columna Legal) y en "Mi cuenta"
  (el área privada no muestra footer). Fuente única: `lib/contact.ts`.
- **Copy** (vigente): plan Gratis, /planes, /personajes, registro, hero y sección de precios dicen
  "10 mensajes gratis con Luna y Hana" (generado desde `FREE_TRIAL_CHARACTER_IDS`), y que las fotos
  son de los planes de pago. Las demás chicas muestran "Disponible con plan" / "Desbloquear".

## 8. Analítica

No había herramienta de analítica instalada. Se agregó `lib/analytics.ts` (`trackEvent`), que envía
a `window.dataLayer` (GTM) o `gtag` **solo si existen**; si no, no hace nada. Eventos:
`free_chat_started`, `free_message_sent`, `free_messages_exhausted`, `plans_cta_clicked`,
`registration_completed`, `checkout_started`, `purchase_completed`, con `character_id`,
`character_name` y `remaining_free_messages` cuando aplica. El backend además deja logs
`[FREE_TRIAL] free_message_sent / free_messages_exhausted / ai_unavailable`.
No se construyó ningún dashboard.

## 9. Archivos modificados

Backend (`haremapi`):
- `usage/AccessControlService.java` — lógica de prueba, reserva/commit con bloqueo, estados.
- `usage/UsageLimit.java`, `usage/UsageLimitRepository.java` — columnas, lock, insert idempotente.
- `usage/UsageLimitInitializer.java`, `usage/FreeMessageBackfill.java`, `usage/FreeMessageStatus.java` — nuevos.
- `message/ChatService.java`, `message/Message.java`, `message/MessageRepository.java`,
  `message/dto/ChatRequest.java`, `message/dto/ChatResponse.java`.
- `ai/AiChatService.java`, `ai/AiReply.java` (nuevo) — origen de la respuesta.
- `character/CharacterController.java`, `character/CharacterService.java` — endpoints y personaje activo.
- `common/exception/GlobalExceptionHandler.java`, `FreeMessageLimitReachedException.java`,
  `AiUnavailableException.java` (nuevos).
- `src/main/resources/application.yml` — `FREE_MESSAGES_PER_CHARACTER` (default 10).
- Tests: `usage/FreeMessageTrialTest.java`, `message/ChatServiceFreeTrialTest.java` (nuevos),
  `usage/AccessControlServiceTest.java` (constructor).

Frontend (`haremsweb`):
- `app/chat/ChatClient.tsx`, `components/CharacterCard.tsx`, `components/CharacterDetailActions.tsx`,
  `components/AuthenticatedHome.tsx`, `components/Footer.tsx`, `components/AccountSettings.tsx`,
  `components/UpgradeModal.tsx`, `components/AuthCard.tsx`, `components/Hero.tsx`,
  `components/PricingSection.tsx`, `app/planes/page.tsx`, `app/personajes/page.tsx`,
  `app/registro/page.tsx`, `app/checkout/page.tsx`, `app/subscription/success/SuccessClient.tsx`,
  `app/creditos/success/CreditosSuccessClient.tsx`, `lib/api.ts`, `lib/data.ts`.
- Nuevos: `lib/useFreeMessages.ts`, `lib/analytics.ts`, `lib/contact.ts`.

## 10. Cómo probar

Automático (backend): `./mvnw test` — `FreeMessageTrialTest` (escenarios A–G, filas heredadas,
cambio de límite) y `ChatServiceFreeTrialTest` (H: fallo de IA, doble envío, moderación, límite).

Se verificó además de punta a punta contra Postgres local, con la API real (38/38 comprobaciones,
incluidas Victoria bloqueada para FREE/Premium y fotos rechazadas para FREE):
A (10→9), B (mensaje 11 → 403 y no queda en historial), C (Luna 0, Hana 10, Kiara usable),
D/E/F (Premium, VIP, Pase 3 días), G (plan vencido vuelve a la prueba), H (IA caída → 503 y no
descuenta), I/J (persistencia tras recargar y re-login), L (16 envíos simultáneos → exactamente 10
aceptados, también con la fila ya existente), mensajes vacíos, personaje inexistente o inactivo,
doble envío con el mismo `clientMessageId`. UI revisada a 375, 390, 430 px y escritorio sin
overflow horizontal.

Manual en staging/producción:
1. Usuario nuevo → `/personajes`: Luna y Hana muestran "10 mensajes gratis"; el resto "Disponible con plan".
2. Abrir Luna → "Prueba gratis: 10 mensajes con Luna"; enviar → "Te quedan 9…".
3. Enviar hasta 0 → tarjeta "Ya conociste a Luna ✨"; abrir Hana → sigue en 10.
4. Cerrar sesión, entrar de nuevo / otro navegador → mismos números.
5. Abrir Kiara (o cualquier otra) con cuenta gratis → "Kiara está disponible con plan" + [Ver planes],
   sin poder enviar. Victoria → "exclusiva VIP".
5b. Con VIP activo, `/creditos` muestra 10 créditos a $53.10 y 20 a $89.10; con Premium, $59 y $99.
6. Asignar Premium desde el panel admin → Luna sin contador; Victoria sigue pidiendo VIP.

## 11. Producción

- **Variables nuevas:** solo `FREE_MESSAGES_PER_CHARACTER` (opcional, default 10).
- No se cambió PayPal, dominios, CORS, precios ni infraestructura.
- Al desplegar el backend, Hibernate agrega las columnas y el backfill corre una vez (log
  `[FREE_TRIAL] backfill free_messages_used: N filas migradas`). Recomendado: respaldo de la BD
  antes de desplegar, como en cualquier cambio de esquema.
- Desplegar **primero el backend** y luego el frontend. El frontend anterior sigue funcionando con
  el backend nuevo (los campos viejos se conservan).
- Costo de IA: el máximo gratis por cuenta es 10 × personajes de la prueba (hoy 2 → 20 mensajes). El rate limit existente (40 mensajes/min por usuario) sigue activo. Crear muchas
  cuentas sigue siendo posible, igual que antes; si se vuelve un problema, la siguiente medida
  sería exigir correo verificado para usar la prueba.
- El bloqueo de fila requiere PostgreSQL (lo que ya usa el proyecto).

## 12. Cambio 2026-10-08: solo Luna y Hana + beneficio VIP visible

Backend (`haremapi`):
- `usage/AccessControlService.java` — `isIncludedInFreeTrial` usa la lista configurable de slugs;
  usuario FREE fuera de la prueba → `FreeCharacterNotAvailableException`.
- `common/exception/FreeCharacterNotAvailableException.java` (nuevo) y `GlobalExceptionHandler.java`
  — 403 `FREE_CHARACTER_NOT_AVAILABLE` con `freeUsage`.
- `usage/FreeMessageStatus.java` — `notInFreeTrial(..., requiredPlan)` (`"PREMIUM"` o `"VIP"`).
- `application.yml` — `app.limits.free-trial-characters: ${FREE_TRIAL_CHARACTERS:luna-valmont,hana-mori}`.
- Tests: `FreeMessageTrialTest` (solo Luna/Hana, contadores independientes, bloqueo con código,
  filas heredadas, lista configurable, Premium/VIP/Pase sin cambios, plan vencido) y
  `CreditPricingServiceTest` (Pase 3 días sin descuento, VIP vencido sin descuento con la lógica real).
- Sin migración: no hay columnas ni tablas nuevas; se reutiliza `usage_limits`.

Frontend (`haremsweb`):
- `lib/data.ts` — `FREE_TRIAL_CHARACTER_IDS`, `FREE_TRIAL_NAMES_TEXT`, `VIP_IMAGE_CREDIT_DISCOUNT_PERCENT`;
  tarjeta Gratis ("10 mensajes gratis con Luna" / "… con Hana"); tarjeta VIP con
  "10% de descuento en créditos de imagen" (resaltado en dorado, sin agregar filas).
- `components/PricingSection.tsx` — resalta `accentFeatures`; copy "Prueba gratis a Luna y Hana".
- `lib/api.ts` — `requiredPlan: "VIP" | "PREMIUM" | null`, constante `FREE_CHARACTER_NOT_AVAILABLE`.
- `lib/useFreeMessages.ts` — etiqueta "Disponible con plan" / "Exclusiva VIP".
- `app/chat/ChatClient.tsx` — compositor bloqueado "X está disponible con plan" + [Ver planes],
  manejo del 403 `FREE_CHARACTER_NOT_AVAILABLE`, modal al elegir una chica bloqueada, descuento VIP
  en los avisos de VIP.
- Copy: `components/Hero.tsx`, `app/personajes/page.tsx`, `app/planes/page.tsx`,
  `app/registro/page.tsx`, `components/CharacterCard.tsx` (comentario), `app/creditos/CreditosClient.tsx`.

Verificación: `./mvnw test` (los 33 fallos de `ImagePromptBuilderTest` /
`CharacterVisualIdentitiesAuditTest` ya existían y no tienen relación), E2E local contra Postgres
con IA simulada (34/34: casos 1–11 del requerimiento), `tsc`, `eslint` (3 avisos previos sin
cambios), `next build`, y revisión visual sin overflow horizontal a 375, 390, 430 px y escritorio.
