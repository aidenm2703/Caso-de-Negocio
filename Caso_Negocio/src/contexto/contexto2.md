# Caso C · Sol de Casa — PARTE 2 (Sesión 2 · Reto 2)

> Contexto: Caso ficticio con fines educativos. Todas las cifras son mensuales y en dólares, salvo que se diga otra cosa.
> Esta Parte 2 se usa JUNTO con la Parte 1 del caso (de ahí salen cuánto deja cada venta y cuánto cuesta un cliente por anuncios). No modifica la Parte 1.
> Creado por FC Studio - Isidro Fernández C.

---

## 1. La historia sigue: «El ahorro que se comparte»

- Andrés Villalobos (Sol de Casa) no le hizo caso a la agencia y dejó el presupuesto como estaba.
- Paola (asesora) le cuenta que doña Marta de Curridabat vio el letrero en la casa de la vecina y ni preguntó el precio: solo quería saber cuándo le podían medir el techo.
- El letrero se puso solo en 20 casas.
- Cita de Andrés: «Una familia compra paneles una vez cada 15 o 20 años. Si dejo de pagar anuncios, no entra nadie».
- Paola: las 420 familias que ya tienen paneles los quieren, y nunca les pidieron nada.
- Datos: 75 % de los clientes no sabía cuánto ahorró el mes anterior; 40 % le enseñó su recibo de luz a un vecino o familiar; 0 mensajes recibe una familia después de la instalación.
- **Lo que pide Andrés:** «Que las familias vean su ahorro, lo compartan y traigan vecinos».
- Quiere un prototipo que funcione para probarlo con **50 clientes el mes que viene**, sin depender de que un vecino pase por casualidad frente a un letrero.

## 2. El proyecto

**Lo que van a construir:** Diseñen y construyan con Claude una experiencia digital para las familias que ya tienen paneles: que vean cuánto ahorran, que lo puedan compartir y que ese ahorro compartido traiga vecinos que agenden una visita. **Tiene que incluir lo que ve el vecino que recibe el ahorro compartido.**

### Cómo funciona hoy (las 420 familias)

| Lo que pasa | Familias |
|---|---|
| Tienen paneles instalados | 420 |
| Saben cuánto ahorraron el mes anterior (encuesta a 60 clientes) | 25 % |
| Le enseñaron su recibo de luz a un vecino o familiar (misma encuesta) | 40 % |
| Le refieren una familia a Sol de Casa cada año, sin que nadie se lo pida | 8 % |

**Otros datos de las familias**
- El inversor de cada casa manda datos de producción cada hora a una plataforma del fabricante, en inglés, que solo usan los técnicos. Sol de Casa puede sacar de ahí el ahorro de cada casa, mes por mes.
- Referidos: se les contacta casi siempre (**95 %**); el **85 %** de los contactados agenda la visita; se hace el **90 %** de las visitas agendadas; cierran el **45 %** de las visitas.
- Un letrero en el jardín «Esta casa ahorra con Sol de Casa», puesto en 20 casas de un mismo barrio, trajo **6 leads en 2 meses**.
- Plan de mantenimiento: **$12/mes**, incluye limpieza y revisión anual. Lo contrata el **25 %** de los clientes.

### Cómo funciona hoy la página web (alguien que llega por primera vez)

| Paso | Qué ve | Cuántos llegan |
|---|---|---|
| 1. La página | Fotos de instalaciones y botón «Cotice» | 100 visitas |
| 2. El formulario | 6 campos: nombre, teléfono, correo, dirección, tipo de techo y monto del recibo de luz | 14 lo abren |
| 3. La espera | «Una asesora lo llamará». Las asesoras tardan en promedio **31 horas** en llamar | 6 dejan sus datos |

**Otros datos**
- El cliente promedio pagaba **$110/mes** de luz antes de instalar y ahorra el **70 %** de su recibo.
- Una instalación promedio cuesta **$6.500**.
- No hay videos ni testimonios de clientes.
- Cada visita técnica cuesta **$60**. Entre los 2 técnicos pueden hacer como máximo **100 visitas al mes**.

## 3. El prototipo tiene que resolver esto

### El costo de las recompensas
- Una limpieza de paneles fuera del plan le cuesta a Sol de Casa **$60**, lo mismo que una visita.
- Un descuento cuesta lo que se descuenta.
- **Regla de Andrés:** sumando todas las recompensas, una venta que llega porque un cliente la refirió **no puede costar más de $300**, contando también las visitas que hace falta hacer para cerrarla.

### Las 5 piezas
1. **El ahorro a la vista.** Lo que ve la familia cada mes: cuánto ahorró, en plata, y cuánto lleva desde que instaló (pueden usar datos simulados con el 70 % de ahorro).
2. **Compartir.** Una tarjeta del ahorro lista para mandar por WhatsApp o publicar, con un link personal de la familia.
3. **La página del vecino.** Una calculadora de ahorro: pone cuánto paga de luz y ve cuánto se ahorraría y en cuántos años recupera la instalación. Desde ahí agenda la visita, y queda registrado quién lo refirió.
4. **El juego.** Lo que gana la familia que comparte (por ejemplo, cuando un vecino agenda y cuando un vecino firma), con una barra de avance que respete la regla de Andrés. Los niveles son opcionales.
5. **La medición.** Un panel para Andrés, con datos simulados, que muestre cuántas tarjetas se comparten, cuántos vecinos usan la calculadora, cuántos agendan y cuántos firman.

## 4. Lo que Andrés necesita saber (preguntas del reto)

1. Si nadie vuelve a comprar paneles, ¿qué quiere decir «retener» en este negocio? Propongan el número que Andrés debería mirar cada semana.
2. ¿Cuánto cuesta hoy una venta que llega por referido, contando las visitas, y cuánto puede gastar Andrés en recompensas sin pasar su regla? Armen la tabla de recompensas con esos números.
3. Dibujen el ciclo: cómo una familia que ahorra trae a la siguiente. ¿Qué lugar les queda a los anuncios y a los letreros en el plan de 90 días?
4. Las visitas ya están casi llenas con los anuncios (Parte 1). ¿Cuántos leads referidos hacen falta para llenar las 50 visitas de un técnico nuevo, y cuántas familias tendrían que compartir su ahorro si cada una trae lo mismo que un letrero (6 leads de 20 casas en 2 meses)?
5. Escriban el experimento con el que Andrés probaría la experiencia con 50 clientes (por ejemplo, 25 la reciben y 25 no): qué cambia, qué métrica tiene que mejorar, de cuánto a cuánto y qué métrica no puede empeorar.
6. Revisen su prototipo con las cuatro preguntas del cliente, una vez desde la familia que comparte y otra desde el vecino.

### Las cuatro preguntas del cliente (Fuente: Reforge)
- **¿Es para mí?** Lo primero que ve el cliente le dice que esto es para alguien como él.
- **¿Hace lo que quiero?** Cumple lo que prometió el anuncio, y lo muestra rápido.
- **¿Me importa ahora?** Le resuelve algo hoy, no dentro de dos semanas.
- **¿Sé cómo lograrlo?** Los pasos son pocos y claros, y nunca queda frente a una pantalla vacía.

---

# REGLAMENTO DEL RETO 2 (igual para todos los equipos)

**Sesión 2: ¿cómo crece un negocio sin pagar más por cada cliente?**
Esta vez no hay niveles. Cada equipo entrega un **prototipo completo**, que funcione de punta a punta, y una **ficha de growth** que explique con números por qué ese prototipo hace crecer el negocio.

## Las dos horas

| Minuto | Qué hacen |
|---|---|
| 0 a 15 | Leen la Parte 2 **sin IA**. Calculan en qué paso del flujo de hoy se pierde más gente y cuánto puede costar como máximo un cliente que llega por su ciclo (en Agendo, cuánto bajaría el CAC paid si cumplen su meta). La IA queda cerrada estos 15 minutos. |
| 15 a 35 | Diseñan en papel o pizarra: el ciclo dibujado, las pantallas en bocetos y la meta en números. Todavía sin construir. |
| 35 a 90 | Construyen el prototipo con Claude y llenan la ficha de growth. |
| 90 a 100 | Otro equipo usa su prototipo como si fuera un cliente y les dice dónde se trabó, con las cuatro preguntas del cliente. Ustedes hacen lo mismo con el de ellos. |
| 100 a 120 | Muestran el prototipo funcionando en salas, una por caso, 3 minutos por equipo. Cada sala elige un finalista que lo muestra a todos (sugerido: la dinámica la define el equipo del programa). |

## 1. El prototipo
Una página web o una app, hecha con Claude, que se ve bien en un celular. Cómo la construyen y dónde la publican lo deciden ustedes. Tiene que recorrerse de punta a punta como lo haría un cliente, y cumplir lo que pide la Parte 2 de su caso. El panel del dueño puede mostrar números fijos simulados.

**Reglas del prototipo**
- Usa los datos del caso, y lo que inventen para la demostración (nombres, pedidos, ahorros de ejemplo) lleva la palabra **«simulado»**.
- Arranca por lo que prometió el anuncio o el mensaje que trajo al cliente.
- Pasa las cuatro preguntas del cliente: ¿es para mí?, ¿hace lo que quiero?, ¿me importa ahora?, ¿sé cómo lograrlo?
- Tiene pocos pasos, y cada paso pide solo lo que hace falta en ese momento.
- Trae un panel para el dueño, con datos simulados, que muestra cuántos clientes llegan a cada paso.
- Las recompensas, si las hay, respetan la regla de plata del caso.

## 2. La ficha de growth
Una página, en Google Docs o Google Sheets, con:
- El ciclo dibujado: de dónde sale cada cliente nuevo y cómo trae al siguiente.
- El paso del flujo de hoy donde más gente se pierde, con su porcentaje, y cómo lo arregla su diseño.
- La meta en números (de cuánto a cuánto) y lo que esa meta le cambia al negocio, por ejemplo cuánto cuesta un cliente que llega por el ciclo frente a uno de anuncios.
- El número que el dueño debería mirar cada semana.
- La matriz de canales a 90 días, con los anuncios en su cuadrante.
- El experimento con el que el dueño lo probaría, si se puede como prueba A/B (la mitad de los clientes ve lo nuevo y la otra mitad lo de hoy): «Si hacemos [el cambio], entonces [la métrica] pasa de [hoy] a [la meta], y vigilamos que [la contramétrica] no empeore».
- La tabla de recompensas con su costo, si su caso las tiene.
- La sección «En qué se equivocó o nos confundió la IA», con por lo menos un ejemplo concreto.

## 3. La demostración
Tres minutos: qué problema ataca, el prototipo funcionando en vivo, qué número mueve y qué harían si el experimento sale mal.

## Roles (equipos de 3 o 4 personas; conviene rotar los roles de la Sesión 1)

| Rol | Qué hace |
|---|---|
| Diseñador/a | Dibuja las pantallas y el recorrido, y cuida que cada paso pase las cuatro preguntas. |
| Constructor/a | Le pide el prototipo a Claude, lo prueba y lo corrige hasta que funcione de punta a punta. |
| Analista | Hace las cuentas del caso, la meta, el costo de las recompensas y el experimento, y lleva la lista de errores de la IA. |
| Presentador/a | Arma la demostración de 3 minutos y la cuenta en vivo. |

En los equipos de 3, la persona analista también presenta. Todos tienen que poder explicar el ciclo y los números.

## Reglas para usar la IA
1. La IA construye y ustedes deciden qué construir y por qué. El diseño en papel va antes que el primer prompt.
2. Verifiquen las cuentas. El porcentaje que pierde cada paso, el costo de las recompensas y la meta se calculan a mano o en una hoja, y se escriben en la ficha.
3. Cada supuesto va escrito. Si la IA trae un dato que el caso no da (una tasa de referidos «típica», un porcentaje de conversión), lo marcan como supuesto y dicen de dónde sale.
4. Construyan por partes. Primero una pantalla que funcione, después la siguiente. Si piden todo de una vez, la IA entrega algo lindo que no funciona.
5. Prueben como cliente. Antes de mostrarlo, alguien que no lo construyó lo recorre desde el celular.

## Rúbrica (100 puntos)

| Criterio | Puntos | Qué se mira |
|---|---|---|
| Criterio de growth | 30 | El prototipo ataca el paso donde más gente se pierde según los datos, el ciclo está claro y la meta tiene números |
| Experiencia | 25 | Pasa las cuatro preguntas, tiene pocos pasos, se usa bien desde el celular y arranca por lo que prometió el anuncio |
| Funciona | 20 | Se recorre de punta a punta, usa los datos del caso y marca lo simulado |
| Medición y plata | 15 | Panel con el embudo, experimento con métrica y contramétrica, recompensas dentro de la regla del caso |
| Uso de la IA | 10 | Diseñaron antes de construir, corrigieron a la IA y anotaron sus errores |

Al final, el facilitador elige el mejor prototipo de cada caso: el que más claramente mueve el número que el caso necesita.
