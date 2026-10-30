# FÓRMULAS EXACTAS CELDA POR CELDA – GOOGLE SHEETS / EXCEL
## Libro: `sol-de-casa-calculadora.xlsx` (11 Pestañas Vivas)

Este documento contiene la transcripción exacta de cada fórmula y celda para su verificación manual o para cargarlas directamente en Google Sheets o Excel sin dependencias externas.

---

## 1. Pestaña: `Supuestos`
Contiene los parámetros de entrada del modelo. Las celdas sombreadas en amarillo pastel (`B5:B49`) son editables y al modificarlas se recalculan todas las demás pestañas.

| Celda | Parámetro | Valor / Entrada | Unidad | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **B5** | Precio Promedio Instalación | `6500` | USD | Precio cobrado al cliente |
| **B6** | Cobro al Firmar | `0.50` | % | 50% al momento de la firma |
| **B7** | Cobro al Instalar | `0.50` | % | 50% al mes siguiente |
| **B8** | Costo Equipos | `0.55` | % | 55% pagado mes de firma |
| **B9** | Costo Cuadrilla Instalación | `0.17` | % | 17% pagado mes siguiente |
| **B10** | Comisión Asesora | `0.03` | % | 3% pagado mes de firma |
| **B13** | Costo por Visita Realizada | `60` | USD | Transporte, viáticos y bono |
| **B14** | Capacidad Mensual Base | `100` | Visitas | 2 técnicos × 50 visitas máx |
| **B15** | Costo Mensual Técnico Extra | `1800` | USD/mes | Sueldo y cargas |
| **B16** | Capacidad Técnico Extra | `50` | Visitas/mes | Activo mes siguiente al contrato |
| **B19** | Tasa Contacto Meta Base | `0.55` | % | Leads contactados |
| **B20** | Tasa Agenda Meta Base | `0.30` | % | Contactados que agendan |
| **B21** | Tasa Visita Hecha Meta Base | `0.70` | % | Visitas completadas |
| **B22** | Tasa Cierre Meta Base | `0.18` | % | Visitas que firman |
| **B25** | Tasa Contacto Google Base | `0.85` | % | Leads contactados |
| **B26** | Tasa Agenda Google Base | `0.55` | % | Contactados que agendan |
| **B27** | Tasa Visita Hecha Google Base | `0.85` | % | Visitas completadas |
| **B28** | Tasa Cierre Google Base | `0.30` | % | Visitas que firman |
| **B31** | Activar Supuesto 7 (SI/NO) | `"SI"` | Texto | Interruptor condicional |
| **B32** | Factor Volumen Leads Meta S7 | `0.80` | % | -20% leads de Meta |
| **B33** | Tasa Contacto Meta S7 | `0.80` | % | Respuesta rápida < 5 min |
| **B34** | Tasa Agenda Meta S7 | `0.40` | % | Calificación previa |
| **B35** | Tasa Visita Hecha Meta S7 | `0.75` | % | Mayor seriedad |
| **B36** | Tasa Cierre Meta S7 | `0.22` | % | Cierre calificado |
| **B39** | Activar Batería (SI/NO) | `"NO"` | Texto | Interruptor upsell |
| **B40** | Precio Batería | `3000` | USD | Ticket batería |
| **B41** | Margen Bruto Batería | `0.20` | % | Margen proveedor |
| **B42** | Comisión Batería | `0.03` | % | Comisión asesora |
| **B43** | Tasa Adopción Batería | `0.15` | % | 3 de cada 20 clientes |
| **B46** | Saldo Inicial Banco | `12000` | USD | Caja inicio Mes 1 |
| **B47** | Piso de Seguridad | `5000` | USD | Mínimo tolerado por Sofía |
| **B48** | Costos Fijos Mensuales | `18000` | USD/mes | Estructura fija |
| **B49** | Ventas Mes 0 (Septiembre) | `22` | Unidades | Pagan 2da mitad en Mes 1 |

---

## 2. Pestaña: `Historial`
Tabla histórica de 12 meses y fórmulas de interpolación continua:

- **Tabla Histórica (`A5:F10`):**
  - `A5:A10`: `0`, `2000`, `4000`, `6000`, `8000`, `10000`
  - `B5:B10` (Meta): `0`, `280`, `500`, `680`, `840`, `960`
  - `C5:C10` (CPL Meta): `=IF(B5>0, A5/B5, 0)`
  - `D5:D10` (Google): `0`, `55`, `100`, `135`, `160`, `160`
  - `E5:E10` (CPL Google): `=IF(D5>0, A5/D5, 0)`
- **Fórmulas de Interpolación Lineal Continua:**
  - `B14`: Celda editable de Inversión a evaluar (ej. `$5.000`).
  - `B15` (Meta Interpolado):
    ```excel
    =IF(B14<=0, 0, FORECAST(B14, OFFSET(B5, MATCH(B14, A5:A10, 1)-1, 0, 2, 1), OFFSET(A5, MATCH(B14, A5:A10, 1)-1, 0, 2, 1)))
    ```
  - `B16` (Google Interpolado con tope de 160):
    ```excel
    =IF(B14<=0, 0, IF(B14>=8000, 160, FORECAST(B14, OFFSET(D5, MATCH(B14, A5:A10, 1)-1, 0, 2, 1), OFFSET(A5, MATCH(B14, A5:A10, 1)-1, 0, 2, 1))))
    ```

---

## 3. Pestaña: `Resultados`
Tres escenarios evaluados lado a lado con fórmulas dinámicas:

- **Escenario 1 (Hoy):** Columnas `B` (Meta), `C` (Google), `D` (Total)
- **Escenario 2 (Agencia):** Columnas `E` (Meta), `F` (Google), `G` (Total)
- **Escenario 3 (Propio):** Columnas `H` (Meta S7), `I` (Google), `J` (Total)

### Fórmulas del Escenario 1 (Hoy: $4.000 Meta + $4.000 Google):
| Fila | Concepto | Col B (Meta) | Col C (Google) | Col D (Total) |
| :--- | :--- | :--- | :--- | :--- |
| **6** | Inversión Publicitaria | `4000` | `4000` | `=B6+C6` |
| **7** | Leads Generados | `=IF(B6<=0,0,FORECAST(B6,OFFSET(Historial!B$5,MATCH(B6,Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(B6,Historial!A$5:A$10,1)-1,0,2,1)))` | `=IF(C6<=0,0,IF(C6>=8000,160,FORECAST(C6,OFFSET(Historial!D$5,MATCH(C6,Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(C6,Historial!A$5:A$10,1)-1,0,2,1))))` | `=B7+C7` |
| **8** | % Contacto | `=Supuestos!B19` | `=Supuestos!B25` | `=IF(D7>0,D9/D7,0)` |
| **9** | Leads Contactados | `=B7*B8` | `=C7*C8` | `=B9+C9` |
| **10** | % Agenda | `=Supuestos!B20` | `=Supuestos!B26` | `=IF(D9>0,D11/D9,0)` |
| **11** | Visitas Agendadas | `=B9*B10` | `=C9*C10` | `=B11+C11` |
| **12** | % Visita Realizada | `=Supuestos!B21` | `=Supuestos!B27` | `=IF(D11>0,D13/D11,0)` |
| **13** | Visitas Pedidas | `=B11*B12` | `=C11*C12` | `=B13+C13` |
| **14** | Capacidad Mensual | `=Supuestos!B14` | `=Supuestos!B14` | `=Supuestos!B14` |
| **15** | Visitas Hechas (Prioridad) | `=MIN(B13,MAX(0,D14-C15))` | `=MIN(C13,D14)` | `=B15+C15` |
| **16** | Visitas Perdidas | `=MAX(0,B13-B15)` | `=MAX(0,C13-C15)` | `=B16+C16` |
| **17** | % Uso Capacidad | `=IF(D14>0,B15/D14,0)` | `=IF(D14>0,C15/D14,0)` | `=IF(D14>0,D15/D14,0)` |
| **18** | % Cierre Ventas | `=Supuestos!B22` | `=Supuestos!B28` | `=IF(D15>0,D19/D15,0)` |
| **19** | Ventas Cerradas | `=B15*B18` | `=C15*C18` | `=B19+C19` |
| **20** | CPL | `=IF(B7>0,B6/B7,0)` | `=IF(C7>0,C6/C7,0)` | `=IF(D7>0,D6/D7,0)` |
| **21** | CAC de Anuncios | `=IF(B19>0,B6/B19,0)` | `=IF(C19>0,C6/C19,0)` | `=IF(D19>0,D6/D19,0)` |
| **22** | Costo Visitas ($60) | `=B15*Supuestos!B13` | `=C15*Supuestos!B13` | `=B22+C22` |
| **23** | CAC Real | `=IF(B19>0,(B6+B22)/B19,0)` | `=IF(C19>0,(C6+C22)/C19,0)` | `=IF(D19>0,(D6+D22)/D19,0)` |
| **24** | Contribución Unit. | `=Supuestos!B5*(Supuestos!B8-Supuestos!B10)+IF(Supuestos!B39="SI",Supuestos!B40*(Supuestos!B41-Supuestos!B42)*Supuestos!B43,0)` | `=B24` | `=B24` |
| **25** | LTV:CAC | `=IF(B23>0,B24/B23,0)` | `=IF(C23>0,C24/C23,0)` | `=IF(D23>0,D24/D23,0)` |
| **26** | Visitas por Venta | `=IF(B18>0,1/B18,0)` | `=IF(C18>0,1/C18,0)` | `=IF(D19>0,D15/D19,0)` |
| **27** | Valor de una Visita | `=B18*B24-Supuestos!B13` | `=C18*C24-Supuestos!B13` | `=D18*D24-Supuestos!B13` |

---

## 4. Pestaña: `Propuesta agencia`
Compara la cuenta simplista de la agencia ($8 fijo) contra la realidad del historial ($8.000 en Meta = 840 leads):

- `B5`: `=8000` | `C5`: `=8000` | `D5`: `=B5-C5`
- `B6`: `=8.00` | `C6`: `=C5/C7` | `D6`: `=B6-C6`
- `B7`: `=B5/8` (1.000 leads) | `C7`: `=Historial!B8` (840 leads) | `D7`: `=B7-C7` (-160 leads)
- `B8`: `=B7*Supuestos!B19*Supuestos!B20*Supuestos!B21` (115,5 visitas) | `C8`: `=C7*Supuestos!B19*Supuestos!B20*Supuestos!B21` (97,02 visitas)
- `B10`: `=MIN(B8,B9)` (100 visitas máx) | `C10`: `=MIN(C8,C9)` (97,02 visitas)
- `B12`: `=B10*Supuestos!B22` (18,00 ventas) | `C12`: `=C10*Supuestos!B22` (17,46 ventas)
- `B13`: `=(B5+B10*Supuestos!B13)/B12` ($777,78) | `C13`: `=(C5+C10*Supuestos!B13)/C12` ($791,33)
- `B14`: `=B12*Resultados!B24-B5-B10*Supuestos!B13` | `C14`: `=C12*Resultados!B24-C5-C10*Supuestos!B13`

---

## 5. Pestaña: `Verificado a mano`
Auditoría paso a paso del CAC Real:

- **Fila 5 (Meta):**
  - Inversión: `4000`
  - Leads: `500`
  - Visitas Hechas: `=500*0.55*0.30*0.70` (57,75)
  - Costo Visitas: `=D5*60` ($3.465,00)
  - Ventas: `=D5*0.18` (10,395)
  - CAC a Mano: `=(B5+E5)/F5` ($718,13)
  - CAC en Modelo: `=Resultados!B23` ($718,13)
  - Diferencia: `=H5-I5` ($0,0000)
  - Estado: `=IF(ABS(J5)<0.01, "EXACTO (VERIFICADO)", "DESCUADRE")`
- **Fila 6 (Google):**
  - Inversión: `4000`
  - Leads: `100`
  - Visitas Hechas: `=100*0.85*0.55*0.85` (39,7375)
  - Costo Visitas: `=D6*60` ($2.384,25)
  - Ventas: `=D6*0.30` (11,92125)
  - CAC a Mano: `=(B6+E6)/F6` ($535,54)
  - CAC en Modelo: `=Resultados!C23` ($535,54)
  - Diferencia: `=H6-I6` ($0,0000)
  - Estado: `=IF(ABS(J6)<0.01, "EXACTO (VERIFICADO)", "DESCUADRE")`

---

## 6. Pestaña: `Caja y payback`
Flujo por cliente individual:

- **Cobro Cliente:** Mes 0: `=Supuestos!B5*Supuestos!B6` (+$3.250) | Mes 1: `=Supuestos!B5*Supuestos!B7` (+$3.250)
- **Equipos Proveedor:** Mes 0: `=-Supuestos!B5*Supuestos!B8` (-$3.575) | Mes 1: `0`
- **Comisión Asesora:** Mes 0: `=-Supuestos!B5*Supuestos!B10` (-$195) | Mes 1: `0`
- **Cuadrilla Instalación:** Mes 0: `0` | Mes 1: `=-Supuestos!B5*Supuestos!B9` (-$1.105)
- **Flujo Operativo Neto:** Mes 0: `-$520,00` | Mes 1: `+$2.145,00` | Acumulado: `+$1.625,00`
- **Google con CAC Real ($535,54):**
  - Mes 0: `-$535,54 + (-$520,00) = -$1.055,54`
  - Mes 1: `-$1.055,54 + $2.145,00 = +$1.089,46` (**RECUPERADO EN MES 1**)
- **Meta con CAC Real ($718,13):**
  - Mes 0: `-$718,13 + (-$520,00) = -$1.238,13`
  - Mes 1: `-$1.238,13 + $2.145,00 = +$906,87` (**RECUPERADO EN MES 1**)

---

## 7. Pestaña: `Simulador 24 meses`
Fórmulas de cada mes $m$ (fila $r = 4 + m$, desde fila 5 a fila 28):

- **Inversión Total ($):** `=B5+C5` (Columna D)
- **Leads:**
  ```excel
  =IF(B5<=0,0,FORECAST(B5,OFFSET(Historial!B$5,MATCH(B5,Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(B5,Historial!A$5:A$10,1)-1,0,2,1)))+IF(C5<=0,0,IF(C5>=8000,160,FORECAST(C5,OFFSET(Historial!D$5,MATCH(C5,Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(C5,Historial!A$5:A$10,1)-1,0,2,1))))
  ```
- **Capacidad de Visitas (Col H):**
  - Mes 1 (fila 5): `=Supuestos!B14`
  - Mes 2 en adelante: `=Supuestos!B14+(G4*Supuestos!B16)` (donde `G4` son los técnicos contratados el mes anterior).
- **Visitas Hechas (Col I):** `=MIN(F5,H5)`
- **Ventas Mes (Col J):**
  ```excel
  =(MIN(VisitasGoogle,H5)*Supuestos!B28)+(MIN(VisitasMeta,MAX(0,H5-VisitasGoogleHechas))*Supuestos!B22)
  ```
- **Entradas (Col K):**
  - Mes 1: `=(J5*Supuestos!B5*Supuestos!B6)+(Supuestos!B49*Supuestos!B5*Supuestos!B7)`
  - Mes 2+: `=(J6*Supuestos!B5*Supuestos!B6)+(J5*Supuestos!B5*Supuestos!B7)`
- **Salidas (Col L):**
  ```excel
  =(J5*Supuestos!B5*Supuestos!B8)+(J5*Supuestos!B5*Supuestos!B10)+(VentasMesAnt*Supuestos!B5*Supuestos!B9)+(I5*Supuestos!B13)+D5+Supuestos!B48+(G5*Supuestos!B15)
  ```
- **Flujo Neto (Col M):** `=K5-L5`
- **Caja Final (Col N):**
  - Mes 1: `=Supuestos!B46+M5`
  - Mes 2+: `=N4+M5`
- **Alerta Piso $5.000 (Col O):** `=IF(N5<Supuestos!B47, "ALERTA: PISO VIOLADO", "OK")`
- **Regla Mes 19+ (Col P):** Meses 1-18: `"N/A"`, Meses 19-24: `=IF(D23>=D22, "OK", "ERROR: INVERSIÓN BAJÓ")`

---

## 8. Pestaña: `Planes`
- **Caja Mínima:** `=MIN('Simulador 24 meses'!N5:N28)`
- **Mes de Caja Mínima:** `=MATCH(C5,'Simulador 24 meses'!N5:N28,0)`
- **Caja Mes 24:** `='Simulador 24 meses'!N28`
- **Instalaciones Totales:** `=SUM('Simulador 24 meses'!J5:J28)`
- **Regla Cumplida:** `=IF(C5>=Supuestos!B47,"SI","NO")`

---

## 9. Pestaña: `Recomendación`
Fórmula de concatenación dinámica en celda `A7`:
```excel
="Recomendamos enfáticamente RECHAZAR la propuesta de Leadly de mover todo el presupuesto a Meta. Aunque la agencia argumenta que el lead de Meta es 5 veces más barato ($8 vs $40), la realidad del negocio demuestra la trampa: adquirir un cliente que efectivamente firma en Meta cuesta $" & TEXT(Resultados!B23, "#,##0.00") & " en CAC Real, mientras que en Google cuesta $" & TEXT(Resultados!C23, "#,##0.00") & " (un " & TEXT((Resultados!B23-Resultados!C23)/Resultados!C23, "0.0%") & " MÁS CARO en Meta)."
```
Fórmula de concatenación dinámica en celda `A10`:
```excel
="Si Andrés aceptara la propuesta de $8.000 en Meta, el historial empírico demuestra que llegarían solo 840 leads (no 1.000), resultando en únicamente " & TEXT(Resultados!E19, "0.0") & " ventas mensuales frente a las " & TEXT(Resultados!D19, "0.0") & " que se logran hoy con el reparto actual ($4k + $4k). Se perderían " & TEXT(Resultados!D19-Resultados!E19, "0.0") & " ventas cada mes (-21,8% en ingresos) quemando exactamente la misma plata."
```
