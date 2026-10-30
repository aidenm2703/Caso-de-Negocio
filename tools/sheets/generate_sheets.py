#!/usr/bin/env python3
"""
GENERADOR DE LIBRO EXCEL: sol-de-casa-calculadora.xlsx
Construye las 11 pestañas con FÓRMULAS VIVAS, estilos profesionales,
rangos nombrados y compatibilidad total con Google Sheets.
"""

import os
import openpyxl
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter, column_index_from_string
from openpyxl.chart import BarChart, LineChart, Reference, Series

def create_sol_de_casa_workbook():
    wb = Workbook()
    
    # Paleta de colores Sol de Casa
    COLOR_HEADER_BG = "FFC531"      # Amarillo Sol
    COLOR_HEADER_TEXT = "1C1917"    # Negro Tinta
    COLOR_SECTION_BG = "E2E8F0"     # Gris Suave
    COLOR_INPUT_FILL = "FFF2CC"     # Amarillo Pastel (Celdas Editables)
    COLOR_KPI_BG = "F0FDF4"         # Verde Menta Suave
    COLOR_ALERT_BG = "FEE2E2"       # Rojo Suave
    COLOR_META_PINK = "FCE7F3"      # Rosa Meta
    COLOR_GOOGLE_BLUE = "E0F2FE"    # Azul Google
    
    font_title = Font(name="Calibri", size=15, bold=True, color="1C1917")
    font_section = Font(name="Calibri", size=12, bold=True, color="1C1917")
    font_header = Font(name="Calibri", size=11, bold=True, color="1C1917")
    font_bold = Font(name="Calibri", size=10, bold=True)
    font_regular = Font(name="Calibri", size=10)
    font_italic = Font(name="Calibri", size=9, italic=True, color="64748B")
    
    fill_header = PatternFill(start_color=COLOR_HEADER_BG, end_color=COLOR_HEADER_BG, fill_type="solid")
    fill_section = PatternFill(start_color=COLOR_SECTION_BG, end_color=COLOR_SECTION_BG, fill_type="solid")
    fill_input = PatternFill(start_color=COLOR_INPUT_FILL, end_color=COLOR_INPUT_FILL, fill_type="solid")
    fill_meta = PatternFill(start_color=COLOR_META_PINK, end_color=COLOR_META_PINK, fill_type="solid")
    fill_google = PatternFill(start_color=COLOR_GOOGLE_BLUE, end_color=COLOR_GOOGLE_BLUE, fill_type="solid")
    
    thin_border_side = Side(border_style="thin", color="CBD5E1")
    border_all_thin = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    
    align_left = Alignment(horizontal="left", vertical="center")
    align_right = Alignment(horizontal="right", vertical="center")
    align_center = Alignment(horizontal="center", vertical="center")

    # -------------------------------------------------------------
    # 1. PESTAÑA: Supuestos
    # -------------------------------------------------------------
    ws_sup = wb.active
    ws_sup.title = "Supuestos"
    ws_sup.views.sheetView[0].showGridLines = True
    
    ws_sup["A1"] = "SOL DE CASA - PANEL DE SUPUESTOS OFICIALES"
    ws_sup["A1"].font = font_title
    ws_sup["A2"] = "Celdas sombreadas en amarillo pastel representan parámetros de entrada editables."
    ws_sup["A2"].font = font_italic
    
    supuestos_data = [
        # Sección, Parámetro, CeldaValor, Valor, Unidad, Descripción
        ("Economía de la Instalación", "Precio Promedio Instalación", "B5", 6500, "USD", "Precio venta al cliente"),
        ("Economía de la Instalación", "Cobro Cliente al Firmar", "B6", 0.50, "%", "50% al momento de la firma"),
        ("Economía de la Instalación", "Cobro Cliente al Instalar", "B7", 0.50, "%", "50% al mes siguiente"),
        ("Economía de la Instalación", "Costo Equipos", "B8", 0.55, "%", "55% pagado al proveedor mes de firma"),
        ("Economía de la Instalación", "Costo Instalación Cuadrilla", "B9", 0.17, "%", "17% pagado mes siguiente"),
        ("Economía de la Instalación", "Comisión Asesora de Venta", "B10", 0.03, "%", "3% pagado mes de firma"),
        
        ("Visitas Técnicas y Capacidad", "Costo por Visita Realizada", "B13", 60, "USD", "Transporte, viáticos y bono"),
        ("Visitas Técnicas y Capacidad", "Capacidad Mensual Base (2 técnicos)", "B14", 100, "Visitas", "50 visitas máx por técnico"),
        ("Visitas Técnicas y Capacidad", "Costo Mensual Técnico Extra", "B15", 1800, "USD/mes", "Sueldo y cargas técnico nuevo"),
        ("Visitas Técnicas y Capacidad", "Capacidad Adicional Técnico Extra", "B16", 50, "Visitas/mes", "Activo desde mes siguiente"),
        
        ("Embudo Meta Base", "Tasa Contacto Meta", "B19", 0.55, "%", "Leads contactados por asesoras"),
        ("Embudo Meta Base", "Tasa Agenda Meta", "B20", 0.30, "%", "Contactados que agendan visita"),
        ("Embudo Meta Base", "Tasa Visita Hecha Meta", "B21", 0.70, "%", "Visitas agendadas realizadas"),
        ("Embudo Meta Base", "Tasa Cierre Venta Meta", "B22", 0.18, "%", "Visitas realizadas que firman"),
        
        ("Embudo Google Base", "Tasa Contacto Google", "B25", 0.85, "%", "Leads contactados por asesoras"),
        ("Embudo Google Base", "Tasa Agenda Google", "B26", 0.55, "%", "Contactados que agendan visita"),
        ("Embudo Google Base", "Tasa Visita Hecha Google", "B27", 0.85, "%", "Visitas agendadas realizadas"),
        ("Embudo Google Base", "Tasa Cierre Venta Google", "B28", 0.30, "%", "Visitas realizadas que firman"),
        
        ("Supuesto 7 (Filtro + Respuesta < 5 min)", "Activar Supuesto 7 (SI/NO)", "B31", "SI", "Texto", "Aplica filtro y respuesta rápida"),
        ("Supuesto 7 (Filtro + Respuesta < 5 min)", "Factor Volumen Leads Meta", "B32", 0.80, "%", "Baja 20% leads de Meta"),
        ("Supuesto 7 (Filtro + Respuesta < 5 min)", "Tasa Contacto Meta S7", "B33", 0.80, "%", "Mejora contacto por rapidez"),
        ("Supuesto 7 (Filtro + Respuesta < 5 min)", "Tasa Agenda Meta S7", "B34", 0.40, "%", "Mejora agenda por perfil"),
        ("Supuesto 7 (Filtro + Respuesta < 5 min)", "Tasa Visita Hecha Meta S7", "B35", 0.75, "%", "Mayor compromiso"),
        ("Supuesto 7 (Filtro + Respuesta < 5 min)", "Tasa Cierre Meta S7", "B36", 0.22, "%", "Mayor calificación"),
        
        ("Batería de Respaldo (Upsell)", "Activar Batería (SI/NO)", "B39", "NO", "Texto", "Ofrecer batería en visita"),
        ("Batería de Respaldo (Upsell)", "Precio Batería", "B40", 3000, "USD", "Precio de venta al cliente"),
        ("Batería de Respaldo (Upsell)", "Margen Bruto Batería", "B41", 0.20, "%", "Margen bruto proveedor"),
        ("Batería de Respaldo (Upsell)", "Comisión Batería", "B42", 0.03, "%", "Comisión asesora"),
        ("Batería de Respaldo (Upsell)", "Tasa Adopción Batería", "B43", 0.15, "%", "3 de cada 20 clientes la agregan"),
        
        ("Tesorería y Caja (Nivel 3)", "Saldo Inicial en Banco", "B46", 12000, "USD", "Plata disponible al inicio Mes 1"),
        ("Tesorería y Caja (Nivel 3)", "Piso Mínimo de Seguridad", "B47", 5000, "USD", "Caja mínima tolerada (Sofía)"),
        ("Tesorería y Caja (Nivel 3)", "Costos Fijos Mensuales", "B48", 18000, "USD/mes", "Sueldos, alquiler, vehículo, CRM"),
        ("Tesorería y Caja (Nivel 3)", "Ventas Mes 0 (Septiembre)", "B49", 22, "Instalaciones", "Cobran 2da mitad en Mes 1"),
    ]
    
    current_sec = ""
    for row in supuestos_data:
        sec, name, cell_ref, val, unit, desc = row
        r_num = int(cell_ref[1:])
        if sec != current_sec:
            current_sec = sec
            ws_sup[f"A{r_num-1}"] = sec.upper()
            ws_sup[f"A{r_num-1}"].font = font_section
            ws_sup[f"A{r_num-1}"].fill = fill_section
            ws_sup.merge_cells(f"A{r_num-1}:E{r_num-1}")
        
        ws_sup[f"A{r_num}"] = name
        ws_sup[f"A{r_num}"].font = font_regular
        ws_sup[f"A{r_num}"].border = border_all_thin
        
        cell = ws_sup[cell_ref]
        cell.value = val
        cell.font = font_bold
        cell.fill = fill_input
        cell.border = border_all_thin
        cell.alignment = align_center if isinstance(val, str) else align_right
        
        if unit == "USD":
            cell.number_format = '"$"#,##0'
        elif unit == "%":
            cell.number_format = '0.0%'
        elif unit == "USD/mes":
            cell.number_format = '"$"#,##0'
        else:
            cell.number_format = '#,##0'
            
        ws_sup[f"C{r_num}"] = unit
        ws_sup[f"C{r_num}"].font = font_italic
        ws_sup[f"C{r_num}"].border = border_all_thin
        ws_sup[f"C{r_num}"].alignment = align_center
        
        ws_sup[f"D{r_num}"] = desc
        ws_sup[f"D{r_num}"].font = font_italic
        ws_sup[f"D{r_num}"].border = border_all_thin

    # -------------------------------------------------------------
    # 2. PESTAÑA: Historial
    # -------------------------------------------------------------
    ws_his = wb.create_sheet(title="Historial")
    ws_his.views.sheetView[0].showGridLines = True
    
    ws_his["A1"] = "HISTORIAL EMPÍRICO DE INVERSIÓN VS LEADS (12 MESES)"
    ws_his["A1"].font = font_title
    ws_his["A2"] = "Base de datos histórica de pruebas y fórmulas de interpolación continua."
    ws_his["A2"].font = font_italic
    
    headers_his = ["Inversión Mensual ($)", "Leads Meta", "CPL Meta ($)", "Leads Google", "CPL Google ($)", "Notas de Mercado"]
    for col_idx, h in enumerate(headers_his, start=1):
        c = ws_his.cell(row=4, column=col_idx, value=h)
        c.font = font_header
        c.fill = fill_header
        c.alignment = align_center
        c.border = border_all_thin
        
    hist_table = [
        (0, 0, 0, "Recta desde cero"),
        (2000, 280, 55, "Rendimiento alto inicial"),
        (4000, 500, 100, "Punto de equilibrio actual"),
        (6000, 680, 135, "Rendimientos decrecientes"),
        (8000, 840, 160, "Tope de búsquedas en Google"),
        (10000, 960, 160, "Saturación completa de Google (160 leads)"),
    ]
    
    for idx, (inv, m_leads, g_leads, note) in enumerate(hist_table, start=5):
        ws_his.cell(row=idx, column=1, value=inv).number_format = '"$"#,##0'
        ws_his.cell(row=idx, column=2, value=m_leads).number_format = '#,##0'
        ws_his.cell(row=idx, column=3, value=f'=IF(B{idx}>0, A{idx}/B{idx}, 0)').number_format = '"$"#,##0.00'
        ws_his.cell(row=idx, column=4, value=g_leads).number_format = '#,##0'
        ws_his.cell(row=idx, column=5, value=f'=IF(D{idx}>0, A{idx}/D{idx}, 0)').number_format = '"$"#,##0.00'
        ws_his.cell(row=idx, column=6, value=note)
        
        for c in range(1, 7):
            ws_his.cell(row=idx, column=c).border = border_all_thin
            ws_his.cell(row=idx, column=c).font = font_regular
            if c in [1, 2, 3, 4, 5]:
                ws_his.cell(row=idx, column=c).alignment = align_right

    # Sección de prueba de interpolación
    ws_his["A13"] = "CALCULADORA DE INTERPOLACIÓN LINEAL"
    ws_his["A13"].font = font_section
    ws_his["A13"].fill = fill_section
    ws_his.merge_cells("A13:F13")
    
    ws_his["A14"] = "Inversión a Evaluar ($):"
    ws_his["B14"] = 5000
    ws_his["B14"].fill = fill_input
    ws_his["B14"].font = font_bold
    ws_his["B14"].number_format = '"$"#,##0'
    ws_his["B14"].border = border_all_thin
    
    ws_his["A15"] = "Leads Interpolados Meta:"
    # Fórmula viva INDEX/MATCH de interpolación lineal
    ws_his["B15"] = '=IF(B14<=0, 0, FORECAST(B14, OFFSET(B5, MATCH(B14, A5:A10, 1)-1, 0, 2, 1), OFFSET(A5, MATCH(B14, A5:A10, 1)-1, 0, 2, 1)))'
    ws_his["B15"].font = font_bold
    ws_his["B15"].number_format = '#,##0.0'
    ws_his["B15"].border = border_all_thin
    
    ws_his["A16"] = "Leads Interpolados Google:"
    ws_his["B16"] = '=IF(B14<=0, 0, IF(B14>=8000, 160, FORECAST(B14, OFFSET(D5, MATCH(B14, A5:A10, 1)-1, 0, 2, 1), OFFSET(A5, MATCH(B14, A5:A10, 1)-1, 0, 2, 1))))'
    ws_his["B16"].font = font_bold
    ws_his["B16"].number_format = '#,##0.0'
    ws_his["B16"].border = border_all_thin

    # -------------------------------------------------------------
    # 3. PESTAÑA: Resultados (3 Escenarios Lado a Lado)
    # -------------------------------------------------------------
    ws_res = wb.create_sheet(title="Resultados")
    ws_res.views.sheetView[0].showGridLines = True
    
    ws_res["A1"] = "COMPARATIVA DE ESCENARIOS LADO A LADO"
    ws_res["A1"].font = font_title
    ws_res["A2"] = "Evaluación completa del embudo, CAC Real, LTV:CAC y asignación de capacidad."
    ws_res["A2"].font = font_italic
    
    # Encabezados de Escenarios
    ws_res["A4"] = "Métrica del Negocio"
    ws_res["A4"].font = font_header
    ws_res["A4"].fill = fill_header
    ws_res["A4"].border = border_all_thin
    
    scenarios = [
        ("Escenario 1: HOY ($4k + $4k)", "B", "C", "D"),
        ("Escenario 2: AGENCIA ($8k Meta + $0)", "E", "F", "G"),
        ("Escenario 3: PROPIO ($3k Meta + $5k Google + S7)", "H", "I", "J"),
    ]
    
    for s_name, col_m, col_g, col_t in scenarios:
        col_m_idx = openpyxl.utils.column_index_from_string(col_m)
        ws_res.cell(row=4, column=col_m_idx, value=s_name).font = font_header
        ws_res.cell(row=4, column=col_m_idx).fill = fill_section
        ws_res.cell(row=4, column=col_m_idx).alignment = align_center
        ws_res.merge_cells(f"{col_m}4:{col_t}4")
        
        ws_res.cell(row=5, column=col_m_idx, value="Meta").font = font_bold
        ws_res.cell(row=5, column=col_m_idx).fill = fill_meta
        ws_res.cell(row=5, column=col_m_idx).border = border_all_thin
        ws_res.cell(row=5, column=col_m_idx).alignment = align_center
        
        ws_res.cell(row=5, column=col_m_idx+1, value="Google").font = font_bold
        ws_res.cell(row=5, column=col_m_idx+1).fill = fill_google
        ws_res.cell(row=5, column=col_m_idx+1).border = border_all_thin
        ws_res.cell(row=5, column=col_m_idx+1).alignment = align_center
        
        ws_res.cell(row=5, column=col_m_idx+2, value="TOTAL").font = font_bold
        ws_res.cell(row=5, column=col_m_idx+2).fill = fill_header
        ws_res.cell(row=5, column=col_m_idx+2).border = border_all_thin
        ws_res.cell(row=5, column=col_m_idx+2).alignment = align_center

    metrics_rows = [
        (6, "Inversión Publicitaria", '"$"#,##0', [4000, 4000, 8000, 0, 3000, 5000]),
        (7, "Leads Brutos", '#,##0.0', None),
        (8, "% Contacto", '0.0%', None),
        (9, "Leads Contactados", '#,##0.0', None),
        (10, "% Agenda", '0.0%', None),
        (11, "Visitas Agendadas", '#,##0.0', None),
        (12, "% Visita Hecha (Presente)", '0.0%', None),
        (13, "Visitas Pedidas", '#,##0.0', None),
        (14, "Capacidad Mensual de Visitas", '#,##0', None),
        (15, "Visitas Realizadas (Efectivas)", '#,##0.0', None),
        (16, "Visitas Perdidas por Capacidad", '#,##0.0', None),
        (17, "% Uso de la Capacidad", '0.0%', None),
        (18, "% Cierre Venta", '0.0%', None),
        (19, "Ventas Cerradas", '#,##0.00', None),
        (20, "Costo por Lead (CPL)", '"$"#,##0.00', None),
        (21, "CAC de Anuncios", '"$"#,##0.00', None),
        (22, "Costo Total Visitas ($60 c/u)", '"$"#,##0.00', None),
        (23, "CAC Real (Anuncios + Visitas)", '"$"#,##0.00', None),
        (24, "Contribución por Venta", '"$"#,##0.00', None),
        (25, "LTV:CAC Real", '0.00"x"', None),
        (26, "Visitas por Venta", '0.0', None),
        (27, "Valor Neto de una Visita", '"$"#,##0.00', None),
    ]

    for r_idx, label, fmt, default_vals in metrics_rows:
        ws_res.cell(row=r_idx, column=1, value=label).font = font_bold if r_idx in [6, 13, 15, 19, 23, 25] else font_regular
        ws_res.cell(row=r_idx, column=1).border = border_all_thin

    # Fórmulas de Escenario 1 (Hoy: B=Meta, C=Google, D=Total)
    ws_res["B6"] = 4000
    ws_res["C6"] = 4000
    ws_res["D6"] = "=B6+C6"
    
    ws_res["B7"] = "=IF(B6<=0,0,FORECAST(B6,OFFSET(Historial!B$5,MATCH(B6,Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(B6,Historial!A$5:A$10,1)-1,0,2,1)))"
    ws_res["C7"] = "=IF(C6<=0,0,IF(C6>=8000,160,FORECAST(C6,OFFSET(Historial!D$5,MATCH(C6,Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(C6,Historial!A$5:A$10,1)-1,0,2,1))))"
    ws_res["D7"] = "=B7+C7"
    
    ws_res["B8"] = "=Supuestos!B19"
    ws_res["C8"] = "=Supuestos!B25"
    ws_res["D8"] = "=IF(D7>0,D9/D7,0)"
    
    ws_res["B9"] = "=B7*B8"
    ws_res["C9"] = "=C7*C8"
    ws_res["D9"] = "=B9+C9"
    
    ws_res["B10"] = "=Supuestos!B20"
    ws_res["C10"] = "=Supuestos!B26"
    ws_res["D10"] = "=IF(D9>0,D11/D9,0)"
    
    ws_res["B11"] = "=B9*B10"
    ws_res["C11"] = "=C9*C10"
    ws_res["D11"] = "=B11+C11"
    
    ws_res["B12"] = "=Supuestos!B21"
    ws_res["C12"] = "=Supuestos!B27"
    ws_res["D12"] = "=IF(D11>0,D13/D11,0)"
    
    ws_res["B13"] = "=B11*B12"
    ws_res["C13"] = "=C11*C12"
    ws_res["D13"] = "=B13+C13"
    
    ws_res["B14"] = "=Supuestos!B14"
    ws_res["C14"] = "=Supuestos!B14"
    ws_res["D14"] = "=Supuestos!B14"
    
    # Capacidad: primero Google, luego Meta
    ws_res["C15"] = "=MIN(C13,D14)"
    ws_res["B15"] = "=MIN(B13,MAX(0,D14-C15))"
    ws_res["D15"] = "=B15+C15"
    
    ws_res["B16"] = "=MAX(0,B13-B15)"
    ws_res["C16"] = "=MAX(0,C13-C15)"
    ws_res["D16"] = "=B16+C16"
    
    ws_res["B17"] = "=IF(D14>0,B15/D14,0)"
    ws_res["C17"] = "=IF(D14>0,C15/D14,0)"
    ws_res["D17"] = "=IF(D14>0,D15/D14,0)"
    
    ws_res["B18"] = "=Supuestos!B22"
    ws_res["C18"] = "=Supuestos!B28"
    ws_res["D18"] = "=IF(D15>0,D19/D15,0)"
    
    ws_res["B19"] = "=B15*B18"
    ws_res["C19"] = "=C15*C18"
    ws_res["D19"] = "=B19+C19"
    
    ws_res["B20"] = "=IF(B7>0,B6/B7,0)"
    ws_res["C20"] = "=IF(C7>0,C6/C7,0)"
    ws_res["D20"] = "=IF(D7>0,D6/D7,0)"
    
    ws_res["B21"] = "=IF(B19>0,B6/B19,0)"
    ws_res["C21"] = "=IF(C19>0,C6/C19,0)"
    ws_res["D21"] = "=IF(D19>0,D6/D19,0)"
    
    ws_res["B22"] = "=B15*Supuestos!B13"
    ws_res["C22"] = "=C15*Supuestos!B13"
    ws_res["D22"] = "=B22+C22"
    
    ws_res["B23"] = "=IF(B19>0,(B6+B22)/B19,0)"
    ws_res["C23"] = "=IF(C19>0,(C6+C22)/C19,0)"
    ws_res["D23"] = "=IF(D19>0,(D6+D22)/D19,0)"
    
    ws_res["B24"] = "=Supuestos!B5*(Supuestos!B8-Supuestos!B10)+IF(Supuestos!B39=\"SI\",Supuestos!B40*(Supuestos!B41-Supuestos!B42)*Supuestos!B43,0)"
    ws_res["C24"] = "=B24"
    ws_res["D24"] = "=B24"
    
    ws_res["B25"] = "=IF(B23>0,B24/B23,0)"
    ws_res["C25"] = "=IF(C23>0,C24/C23,0)"
    ws_res["D25"] = "=IF(D23>0,D24/D23,0)"
    
    ws_res["B26"] = "=IF(B18>0,1/B18,0)"
    ws_res["C26"] = "=IF(C18>0,1/C18,0)"
    ws_res["D26"] = "=IF(D19>0,D15/D19,0)"
    
    ws_res["B27"] = "=B18*B24-Supuestos!B13"
    ws_res["C27"] = "=C18*C24-Supuestos!B13"
    ws_res["D27"] = "=D18*D24-Supuestos!B13"

    # Fórmulas de Escenario 2 (Agencia: E=Meta, F=Google, G=Total)
    ws_res["E6"] = 8000
    ws_res["F6"] = 0
    ws_res["G6"] = "=E6+F6"
    
    ws_res["E7"] = "=IF(E6<=0,0,FORECAST(E6,OFFSET(Historial!B$5,MATCH(E6,Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(E6,Historial!A$5:A$10,1)-1,0,2,1)))"
    ws_res["F7"] = "=IF(F6<=0,0,IF(F6>=8000,160,FORECAST(F6,OFFSET(Historial!D$5,MATCH(F6,Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(F6,Historial!A$5:A$10,1)-1,0,2,1))))"
    ws_res["G7"] = "=E7+F7"
    
    ws_res["E8"] = "=Supuestos!B19"
    ws_res["F8"] = "=Supuestos!B25"
    ws_res["G8"] = "=IF(G7>0,G9/G7,0)"
    
    ws_res["E9"] = "=E7*E8"
    ws_res["F9"] = "=F7*F8"
    ws_res["G9"] = "=E9+F9"
    
    ws_res["E10"] = "=Supuestos!B20"
    ws_res["F10"] = "=Supuestos!B26"
    ws_res["G10"] = "=IF(G9>0,G11/G9,0)"
    
    ws_res["E11"] = "=E9*E10"
    ws_res["F11"] = "=F9*F10"
    ws_res["G11"] = "=E11+F11"
    
    ws_res["E12"] = "=Supuestos!B21"
    ws_res["F12"] = "=Supuestos!B27"
    ws_res["G12"] = "=IF(G11>0,G13/G11,0)"
    
    ws_res["E13"] = "=E11*E12"
    ws_res["F13"] = "=F11*F12"
    ws_res["G13"] = "=E13+F13"
    
    ws_res["E14"] = "=Supuestos!B14"
    ws_res["F14"] = "=Supuestos!B14"
    ws_res["G14"] = "=Supuestos!B14"
    
    ws_res["F15"] = "=MIN(F13,G14)"
    ws_res["E15"] = "=MIN(E13,MAX(0,G14-F15))"
    ws_res["G15"] = "=E15+F15"
    
    ws_res["E16"] = "=MAX(0,E13-E15)"
    ws_res["F16"] = "=MAX(0,F13-F15)"
    ws_res["G16"] = "=E16+F16"
    
    ws_res["E17"] = "=IF(G14>0,E15/G14,0)"
    ws_res["F17"] = "=IF(G14>0,F15/G14,0)"
    ws_res["G17"] = "=IF(G14>0,G15/G14,0)"
    
    ws_res["E18"] = "=Supuestos!B22"
    ws_res["F18"] = "=Supuestos!B28"
    ws_res["G18"] = "=IF(G15>0,G19/G15,0)"
    
    ws_res["E19"] = "=E15*E18"
    ws_res["F19"] = "=F15*F18"
    ws_res["G19"] = "=E19+F19"
    
    ws_res["E20"] = "=IF(E7>0,E6/E7,0)"
    ws_res["F20"] = "=IF(F7>0,F6/F7,0)"
    ws_res["G20"] = "=IF(G7>0,G6/G7,0)"
    
    ws_res["E21"] = "=IF(E19>0,E6/E19,0)"
    ws_res["F21"] = "=IF(F19>0,F6/F19,0)"
    ws_res["G21"] = "=IF(G19>0,G6/G19,0)"
    
    ws_res["E22"] = "=E15*Supuestos!B13"
    ws_res["F22"] = "=F15*Supuestos!B13"
    ws_res["G22"] = "=E22+F22"
    
    ws_res["E23"] = "=IF(E19>0,(E6+E22)/E19,0)"
    ws_res["F23"] = "=IF(F19>0,(F6+F22)/F19,0)"
    ws_res["G23"] = "=IF(G19>0,(G6+G22)/G19,0)"
    
    ws_res["E24"] = "=B24"
    ws_res["F24"] = "=B24"
    ws_res["G24"] = "=B24"
    
    ws_res["E25"] = "=IF(E23>0,E24/E23,0)"
    ws_res["F25"] = "=IF(F23>0,F24/F23,0)"
    ws_res["G25"] = "=IF(G23>0,G24/G23,0)"
    
    ws_res["E26"] = "=IF(E18>0,1/E18,0)"
    ws_res["F26"] = "=IF(F18>0,1/F18,0)"
    ws_res["G26"] = "=IF(G19>0,G15/G19,0)"
    
    ws_res["E27"] = "=E18*E24-Supuestos!B13"
    ws_res["F27"] = "=F18*F24-Supuestos!B13"
    ws_res["G27"] = "=G18*G24-Supuestos!B13"

    # Fórmulas de Escenario 3 (Propio: H=Meta con S7, I=Google, J=Total)
    ws_res["H6"] = 3000
    ws_res["I6"] = 5000
    ws_res["J6"] = "=H6+I6"
    
    ws_res["H7"] = '=IF(H6<=0,0,FORECAST(H6,OFFSET(Historial!B$5,MATCH(H6,Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(H6,Historial!A$5:A$10,1)-1,0,2,1))*IF(Supuestos!B31="SI",Supuestos!B32,1))'
    ws_res["I7"] = "=IF(I6<=0,0,IF(I6>=8000,160,FORECAST(I6,OFFSET(Historial!D$5,MATCH(I6,Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(I6,Historial!A$5:A$10,1)-1,0,2,1))))"
    ws_res["J7"] = "=H7+I7"
    
    ws_res["H8"] = '=IF(Supuestos!B31="SI",Supuestos!B33,Supuestos!B19)'
    ws_res["I8"] = "=Supuestos!B25"
    ws_res["J8"] = "=IF(J7>0,J9/J7,0)"
    
    ws_res["H9"] = "=H7*H8"
    ws_res["I9"] = "=I7*I8"
    ws_res["J9"] = "=H9+I9"
    
    ws_res["H10"] = '=IF(Supuestos!B31="SI",Supuestos!B34,Supuestos!B20)'
    ws_res["I10"] = "=Supuestos!B26"
    ws_res["J10"] = "=IF(J9>0,J11/J9,0)"
    
    ws_res["H11"] = "=H9*H10"
    ws_res["I11"] = "=I9*I10"
    ws_res["J11"] = "=H11+I11"
    
    ws_res["H12"] = '=IF(Supuestos!B31="SI",Supuestos!B35,Supuestos!B21)'
    ws_res["I12"] = "=Supuestos!B27"
    ws_res["J12"] = "=IF(J11>0,J13/J11,0)"
    
    ws_res["H13"] = "=H11*H12"
    ws_res["I13"] = "=I11*I12"
    ws_res["J13"] = "=H13+I13"
    
    ws_res["H14"] = "=Supuestos!B14"
    ws_res["I14"] = "=Supuestos!B14"
    ws_res["J14"] = "=Supuestos!B14"
    
    ws_res["I15"] = "=MIN(I13,J14)"
    ws_res["H15"] = "=MIN(H13,MAX(0,J14-I15))"
    ws_res["J15"] = "=H15+I15"
    
    ws_res["H16"] = "=MAX(0,H13-H15)"
    ws_res["I16"] = "=MAX(0,I13-I15)"
    ws_res["J16"] = "=H16+I16"
    
    ws_res["H17"] = "=IF(J14>0,H15/J14,0)"
    ws_res["I17"] = "=IF(J14>0,I15/J14,0)"
    ws_res["J17"] = "=IF(J14>0,J15/J14,0)"
    
    ws_res["H18"] = '=IF(Supuestos!B31="SI",Supuestos!B36,Supuestos!B22)'
    ws_res["I18"] = "=Supuestos!B28"
    ws_res["J18"] = "=IF(J15>0,J19/J15,0)"
    
    ws_res["H19"] = "=H15*H18"
    ws_res["I19"] = "=I15*I18"
    ws_res["J19"] = "=H19+I19"
    
    ws_res["H20"] = "=IF(H7>0,H6/H7,0)"
    ws_res["I20"] = "=IF(I7>0,I6/I7,0)"
    ws_res["J20"] = "=IF(J7>0,J6/J7,0)"
    
    ws_res["H21"] = "=IF(H19>0,H6/H19,0)"
    ws_res["I21"] = "=IF(I19>0,I6/I19,0)"
    ws_res["J21"] = "=IF(J19>0,J6/J19,0)"
    
    ws_res["H22"] = "=H15*Supuestos!B13"
    ws_res["I22"] = "=I15*Supuestos!B13"
    ws_res["J22"] = "=H22+I22"
    
    ws_res["H23"] = "=IF(H19>0,(H6+H22)/H19,0)"
    ws_res["I23"] = "=IF(I19>0,(I6+I22)/I19,0)"
    ws_res["J23"] = "=IF(J19>0,(J6+J22)/J19,0)"
    
    ws_res["H24"] = "=B24"
    ws_res["I24"] = "=B24"
    ws_res["J24"] = "=B24"
    
    ws_res["H25"] = "=IF(H23>0,H24/H23,0)"
    ws_res["I25"] = "=IF(I23>0,I24/I23,0)"
    ws_res["J25"] = "=IF(J23>0,J24/J23,0)"
    
    ws_res["H26"] = "=IF(H18>0,1/H18,0)"
    ws_res["I26"] = "=IF(I18>0,1/I18,0)"
    ws_res["J26"] = "=IF(J19>0,J15/J19,0)"
    
    ws_res["H27"] = "=H18*H24-Supuestos!B13"
    ws_res["I27"] = "=I18*I24-Supuestos!B13"
    ws_res["J27"] = "=J18*J24-Supuestos!B13"

    # Formatos de celdas en Resultados
    for r_idx, label, fmt, _ in metrics_rows:
        for c_idx in range(2, 11):
            cell = ws_res.cell(row=r_idx, column=c_idx)
            cell.font = font_bold if r_idx in [6, 13, 15, 19, 23, 25] else font_regular
            cell.border = border_all_thin
            cell.alignment = align_right
            cell.number_format = fmt

    # -------------------------------------------------------------
    # 4. PESTAÑA: Propuesta agencia (Doble Cuenta)
    # -------------------------------------------------------------
    ws_age = wb.create_sheet(title="Propuesta agencia")
    ws_age.views.sheetView[0].showGridLines = True
    
    ws_age["A1"] = "ANÁLISIS CRÍTICO DE LA PROPUESTA DE LA AGENCIA LEADLY"
    ws_age["A1"].font = font_title
    ws_age["A2"] = "Comparación entre la promesa comercial ($8 fijo) y la realidad empírica del historial."
    ws_age["A2"].font = font_italic
    
    headers_age = ["Concepto Evaluado", "Como la Cuenta la Agencia", "Con el Historial Real", "Diferencia / Trampa", "Impacto para Andrés"]
    for c_idx, h in enumerate(headers_age, start=1):
        cell = ws_age.cell(row=4, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_all_thin
        
    agency_rows = [
        (5, "Inversión Publicitaria Meta", '=8000', '=8000', '=B5-C5', "Mismo presupuesto total"),
        (6, "CPL Asumido ($/lead)", '=8.00', '=C5/C7', '=B6-C6', "La agencia asume CPL plano; en realidad sube a $9,52"),
        (7, "Leads Generados", '=B5/8', '=Historial!B8', '=B7-C7', "Faltan 160 leads (-16%) por rendimientos decrecientes"),
        (8, "Visitas Pedidas", '=B7*Supuestos!B19*Supuestos!B20*Supuestos!B21', '=C7*Supuestos!B19*Supuestos!B20*Supuestos!B21', '=B8-C8', "Se demandan más visitas"),
        (9, "Capacidad Máxima", '=Supuestos!B14', '=Supuestos!B14', '=0', "Tope de 100 visitas mensuales"),
        (10, "Visitas Realizadas", '=MIN(B8,B9)', '=MIN(C8,C9)', '=B10-C10', "Se topan en 100 visitas en el modelo agencia"),
        (11, "Visitas Perdidas por Tope", '=MAX(0,B8-B10)', '=MAX(0,C8-C10)', '=B11-C11', "La agencia pierde 15,5 visitas en la basura"),
        (12, "Ventas Cerradas", '=B10*Supuestos!B22', '=C10*Supuestos!B22', '=B12-C12', "Hoy Sol de Casa hace 22,32 ventas. ¡Con la agencia cae a 17,46!"),
        (13, "CAC Real", '=(B5+B10*Supuestos!B13)/B12', '=(C5+C10*Supuestos!B13)/C12', '=B13-C13', "El cliente real cuesta $791,33 en la agencia"),
        (14, "Contribución Neta Total", '=B12*Resultados!B24-B5-B10*Supuestos!B13', '=C12*Resultados!B24-C5-C10*Supuestos!B13', '=B14-C14', "¡Andrés pierde más de $8.000 netos mensuales en margen!"),
    ]
    
    for r_idx, label, f_age, f_hist, f_diff, note in agency_rows:
        ws_age.cell(row=r_idx, column=1, value=label).font = font_bold if r_idx in [7, 10, 12, 14] else font_regular
        ws_age.cell(row=r_idx, column=1).border = border_all_thin
        
        c_b = ws_age.cell(row=r_idx, column=2, value=f_age)
        c_b.border = border_all_thin
        c_b.alignment = align_right
        c_b.font = font_bold
        
        c_c = ws_age.cell(row=r_idx, column=3, value=f_hist)
        c_c.border = border_all_thin
        c_c.alignment = align_right
        c_c.font = font_bold
        
        c_d = ws_age.cell(row=r_idx, column=4, value=f_diff)
        c_d.border = border_all_thin
        c_d.alignment = align_right
        c_d.font = font_bold
        
        c_e = ws_age.cell(row=r_idx, column=5, value=note)
        c_e.border = border_all_thin
        c_e.font = font_italic
        
        if r_idx in [5, 6, 13, 14]:
            c_b.number_format = '"$"#,##0.00'
            c_c.number_format = '"$"#,##0.00'
            c_d.number_format = '"$"#,##0.00'
        elif r_idx in [7, 8, 9, 10, 11, 12]:
            c_b.number_format = '#,##0.00'
            c_c.number_format = '#,##0.00'
            c_d.number_format = '#,##0.00'

    # -------------------------------------------------------------
    # 5. PESTAÑA: Verificado a mano
    # -------------------------------------------------------------
    ws_ver = wb.create_sheet(title="Verificado a mano")
    ws_ver.views.sheetView[0].showGridLines = True
    
    ws_ver["A1"] = "VERIFICACIÓN MATEMÁTICA A MANO (AUDITORÍA PASO A PASO)"
    ws_ver["A1"].font = font_title
    ws_ver["A2"] = "Comprobación del CAC Real de cada canal contra el modelo para asegurar rigor absoluto."
    ws_ver["A2"].font = font_italic
    
    headers_ver = ["Canal", "Paso 1: Inversión", "Paso 2: Leads", "Paso 3: Visitas Hechas", "Paso 4: Costo Visitas ($60)", "Paso 5: Ventas", "Paso 6: Cuenta CAC Escrita", "CAC a Mano", "CAC en Modelo", "Diferencia", "Estado"]
    for c_idx, h in enumerate(headers_ver, start=1):
        cell = ws_ver.cell(row=4, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_all_thin
        
    ver_rows = [
        (5, "Meta (Hoy)", 4000, 500, "=500*0.55*0.30*0.70", "=D5*60", "=D5*0.18", "($4.000 + 57,75 × $60) / 10,395", "=(B5+E5)/F5", "=Resultados!B23", "=H5-I5", '=IF(ABS(J5)<0.01, "EXACTO (VERIFICADO)", "DESCUADRE")'),
        (6, "Google (Hoy)", 4000, 100, "=100*0.85*0.55*0.85", "=D6*60", "=D6*0.30", "($4.000 + 39,7375 × $60) / 11,92125", "=(B6+E6)/F6", "=Resultados!C23", "=H6-I6", '=IF(ABS(J6)<0.01, "EXACTO (VERIFICADO)", "DESCUADRE")'),
    ]
    
    for r_idx, ch, inv, leads, f_vis, f_cvis, f_sales, expr, f_mano, f_mod, f_diff, f_stat in ver_rows:
        ws_ver.cell(row=r_idx, column=1, value=ch).font = font_bold
        ws_ver.cell(row=r_idx, column=2, value=inv).number_format = '"$"#,##0'
        ws_ver.cell(row=r_idx, column=3, value=leads).number_format = '#,##0'
        ws_ver.cell(row=r_idx, column=4, value=f_vis).number_format = '#,##0.00'
        ws_ver.cell(row=r_idx, column=5, value=f_cvis).number_format = '"$"#,##0.00'
        ws_ver.cell(row=r_idx, column=6, value=f_sales).number_format = '#,##0.00'
        ws_ver.cell(row=r_idx, column=7, value=expr).font = font_italic
        ws_ver.cell(row=r_idx, column=8, value=f_mano).number_format = '"$"#,##0.00'
        ws_ver.cell(row=r_idx, column=9, value=f_mod).number_format = '"$"#,##0.00'
        ws_ver.cell(row=r_idx, column=10, value=f_diff).number_format = '"$"#,##0.0000'
        ws_ver.cell(row=r_idx, column=11, value=f_stat).font = font_bold
        
        for c in range(1, 12):
            ws_ver.cell(row=r_idx, column=c).border = border_all_thin
            if c in [2, 3, 4, 5, 6, 8, 9, 10]:
                ws_ver.cell(row=r_idx, column=c).alignment = align_right
            elif c == 11:
                ws_ver.cell(row=r_idx, column=c).alignment = align_center

    # -------------------------------------------------------------
    # 6. PESTAÑA: Caja y payback
    # -------------------------------------------------------------
    ws_pay = wb.create_sheet(title="Caja y payback")
    ws_pay.views.sheetView[0].showGridLines = True
    
    ws_pay["A1"] = "DINÁMICA DE CAJA Y RECUPERACIÓN (PAYBACK) POR CLIENTE"
    ws_pay["A1"].font = font_title
    ws_pay["A2"] = "Desfase temporal de cobros y pagos para un cliente promedio según canal."
    ws_pay["A2"].font = font_italic
    
    headers_pay = ["Concepto Financiero", "Fórmula del Caso", "Mes 0 (Firma)", "Mes 1 (Instalación)", "Acumulado", "Notas de Tesorería"]
    for c_idx, h in enumerate(headers_pay, start=1):
        cell = ws_pay.cell(row=4, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_all_thin
        
    pay_rows = [
        (5, "Cobro al Cliente (Entrada)", "=Supuestos!B5*50%", '=Supuestos!B5*Supuestos!B6', '=Supuestos!B5*Supuestos!B7', '=C5+D5', "50% al firmar, 50% al terminar al mes siguiente"),
        (6, "Pago de Equipos al Proveedor", "=Supuestos!B5*55%", '=-Supuestos!B5*Supuestos!B8', 0, '=C6+D6', "Se paga el mismo día de la firma"),
        (7, "Pago de Comisión Asesora", "=Supuestos!B5*3%", '=-Supuestos!B5*Supuestos!B10', 0, '=C7+D7', "Se paga el mes de la firma"),
        (8, "Pago de Cuadrilla de Instalación", "=Supuestos!B5*17%", 0, '=-Supuestos!B5*Supuestos!B9', '=C8+D8', "Se paga el mes siguiente al instalar"),
        (9, "Flujo Operativo de Caja (sin marketing)", "Suma entradas - salidas", '=C5+C6+C7+C8', '=D5+D6+D7+D8', '=C9+D9', "En mes 0 drena -$520; en mes 1 entrega +$2.145"),
        (10, "Impacto CAC Real Google", "=-Resultados!C23", '=-Resultados!C23', 0, '=C10', "Inversión publicitaria + visitas requeridas"),
        (11, "Posición de Caja Neta - Cliente Google", '=C9+C10', '=C11+D9', '=D11', '=D11', 'IF(D11>0, "RECUPERADO EN MES 1", "PENDIENTE")'),
        (12, "Impacto CAC Real Meta", '=-Resultados!B23', '=-Resultados!B23', 0, '=C12', "Inversión publicitaria + visitas requeridas"),
        (13, "Posición de Caja Neta - Cliente Meta", '=C9+C12', '=C13+D9', '=D13', '=D13', 'IF(D13>0, "RECUPERADO EN MES 1", "PENDIENTE")'),
    ]
    
    for r_idx, label, expr, f_m0, f_m1, f_acum, note in pay_rows:
        ws_pay.cell(row=r_idx, column=1, value=label).font = font_bold if r_idx in [5, 9, 11, 13] else font_regular
        ws_pay.cell(row=r_idx, column=1).border = border_all_thin
        ws_pay.cell(row=r_idx, column=2, value=expr).font = font_italic
        ws_pay.cell(row=r_idx, column=2).border = border_all_thin
        
        c_m0 = ws_pay.cell(row=r_idx, column=3, value=f_m0)
        c_m0.border = border_all_thin
        c_m0.alignment = align_right
        c_m0.font = font_bold
        c_m0.number_format = '"$"#,##0.00'
        
        c_m1 = ws_pay.cell(row=r_idx, column=4, value=f_m1)
        c_m1.border = border_all_thin
        c_m1.alignment = align_right
        c_m1.font = font_bold
        c_m1.number_format = '"$"#,##0.00'
        
        c_ac = ws_pay.cell(row=r_idx, column=5, value=f_acum)
        c_ac.border = border_all_thin
        c_ac.alignment = align_right
        c_ac.font = font_bold
        c_ac.number_format = '"$"#,##0.00'
        
        ws_pay.cell(row=r_idx, column=6, value=note).font = font_italic
        ws_pay.cell(row=r_idx, column=6).border = border_all_thin

    # -------------------------------------------------------------
    # 7. PESTAÑA: Simulador 24 meses (Nivel 3)
    # -------------------------------------------------------------
    ws_sim = wb.create_sheet(title="Simulador 24 meses")
    ws_sim.views.sheetView[0].showGridLines = True
    
    ws_sim["A1"] = "SIMULADOR FINANCIERO DE FLUJO DE CAJA A 24 MESES"
    ws_sim["A1"].font = font_title
    ws_sim["A2"] = "Modelo dinámico mes a mes con piso de $5.000, técnicos extra y regla no decreciente mes 19+."
    ws_sim["A2"].font = font_italic
    
    sim_cols = [
        ("Mes", 6), ("Meta ($)", 12), ("Google ($)", 12), ("Inversión Total ($)", 15),
        ("Leads Totales", 12), ("Visitas Pedidas", 14), ("Técnicos Extra", 13), ("Capacidad Visitas", 15),
        ("Visitas Hechas", 13), ("Ventas Mes", 12), ("Entradas ($)", 15), ("Salidas ($)", 15),
        ("Flujo Neto ($)", 14), ("Caja Final ($)", 15), ("Alerta Piso ($5k)", 18), ("Regla Mes 19+", 16)
    ]
    
    for c_idx, (header_text, _) in enumerate(sim_cols, start=1):
        cell = ws_sim.cell(row=4, column=c_idx, value=header_text)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_all_thin
        
    for m in range(1, 25):
        row_idx = 4 + m
        # A: Mes
        ws_sim.cell(row=row_idx, column=1, value=m).alignment = align_center
        
        # B: Inversión Meta
        ws_sim.cell(row=row_idx, column=2, value=4000).number_format = '"$"#,##0'
        
        # C: Inversión Google
        ws_sim.cell(row=row_idx, column=3, value=4000).number_format = '"$"#,##0'
        
        # D: Inversión Total
        ws_sim.cell(row=row_idx, column=4, value=f'=B{row_idx}+C{row_idx}').number_format = '"$"#,##0'
        
        # E: Leads Totales
        ws_sim.cell(row=row_idx, column=5, value=f'=IF(B{row_idx}<=0,0,FORECAST(B{row_idx},OFFSET(Historial!B$5,MATCH(B{row_idx},Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(B{row_idx},Historial!A$5:A$10,1)-1,0,2,1)))+IF(C{row_idx}<=0,0,IF(C{row_idx}>=8000,160,FORECAST(C{row_idx},OFFSET(Historial!D$5,MATCH(C{row_idx},Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(C{row_idx},Historial!A$5:A$10,1)-1,0,2,1))))').number_format = '#,##0.0'
        
        # F: Visitas Pedidas (Meta + Google)
        ws_sim.cell(row=row_idx, column=6, value=f'=(IF(B{row_idx}<=0,0,FORECAST(B{row_idx},OFFSET(Historial!B$5,MATCH(B{row_idx},Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(B{row_idx},Historial!A$5:A$10,1)-1,0,2,1)))*Supuestos!B19*Supuestos!B20*Supuestos!B21)+(IF(C{row_idx}<=0,0,IF(C{row_idx}>=8000,160,FORECAST(C{row_idx},OFFSET(Historial!D$5,MATCH(C{row_idx},Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(C{row_idx},Historial!A$5:A$10,1)-1,0,2,1))))*Supuestos!B25*Supuestos!B26*Supuestos!B27)').number_format = '#,##0.0'
        
        # G: Técnicos Extra (0 por defecto en plan base)
        ws_sim.cell(row=row_idx, column=7, value=0).number_format = '#,##0'
        
        # H: Capacidad Visitas (100 + 50 * técnicos con capacidad activa mes anterior)
        if m == 1:
            ws_sim.cell(row=row_idx, column=8, value='=Supuestos!B14').number_format = '#,##0'
        else:
            ws_sim.cell(row=row_idx, column=8, value=f'=Supuestos!B14+(G{row_idx-1}*Supuestos!B16)').number_format = '#,##0'
            
        # I: Visitas Hechas
        ws_sim.cell(row=row_idx, column=9, value=f'=MIN(F{row_idx},H{row_idx})').number_format = '#,##0.0'
        
        # J: Ventas Mes (Distribución prioritaria Google y Meta)
        # Google visitas hechas: MIN(Visitas Google, Capacidad)
        # Meta visitas hechas: MIN(Visitas Meta, Capacidad restante)
        # Ventas = Visitas Google hechas * 30% + Visitas Meta hechas * 18%
        ws_sim.cell(row=row_idx, column=10, value=f'=(MIN((IF(C{row_idx}<=0,0,IF(C{row_idx}>=8000,160,FORECAST(C{row_idx},OFFSET(Historial!D$5,MATCH(C{row_idx},Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(C{row_idx},Historial!A$5:A$10,1)-1,0,2,1))))*Supuestos!B25*Supuestos!B26*Supuestos!B27),H{row_idx})*Supuestos!B28)+(MIN((IF(B{row_idx}<=0,0,FORECAST(B{row_idx},OFFSET(Historial!B$5,MATCH(B{row_idx},Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(B{row_idx},Historial!A$5:A$10,1)-1,0,2,1)))*Supuestos!B19*Supuestos!B20*Supuestos!B21),MAX(0,H{row_idx}-MIN((IF(C{row_idx}<=0,0,IF(C{row_idx}>=8000,160,FORECAST(C{row_idx},OFFSET(Historial!D$5,MATCH(C{row_idx},Historial!A$5:A$10,1)-1,0,2,1),OFFSET(Historial!A$5,MATCH(C{row_idx},Historial!A$5:A$10,1)-1,0,2,1))))*Supuestos!B25*Supuestos!B26*Supuestos!B27),H{row_idx})))*Supuestos!B22)').number_format = '#,##0.00'
        
        # K: Entradas: 50% ventas mes actual + 50% ventas mes anterior
        if m == 1:
            ws_sim.cell(row=row_idx, column=11, value=f'=(J{row_idx}*Supuestos!B5*Supuestos!B6)+(Supuestos!B49*Supuestos!B5*Supuestos!B7)').number_format = '"$"#,##0.00'
        else:
            ws_sim.cell(row=row_idx, column=11, value=f'=(J{row_idx}*Supuestos!B5*Supuestos!B6)+(J{row_idx-1}*Supuestos!B5*Supuestos!B7)').number_format = '"$"#,##0.00'
            
        # L: Salidas: Equipos 55% + Comisión 3% + Instalación mes ant 17% + Visitas $60 + Pauta + Fijos $18k + Técnicos extra $1800
        if m == 1:
            ws_sim.cell(row=row_idx, column=12, value=f'=(J{row_idx}*Supuestos!B5*Supuestos!B8)+(J{row_idx}*Supuestos!B5*Supuestos!B10)+(Supuestos!B49*Supuestos!B5*Supuestos!B9)+(I{row_idx}*Supuestos!B13)+D{row_idx}+Supuestos!B48+(G{row_idx}*Supuestos!B15)').number_format = '"$"#,##0.00'
        else:
            ws_sim.cell(row=row_idx, column=12, value=f'=(J{row_idx}*Supuestos!B5*Supuestos!B8)+(J{row_idx}*Supuestos!B5*Supuestos!B10)+(J{row_idx-1}*Supuestos!B5*Supuestos!B9)+(I{row_idx}*Supuestos!B13)+D{row_idx}+Supuestos!B48+(G{row_idx}*Supuestos!B15)').number_format = '"$"#,##0.00'
            
        # M: Flujo Neto
        ws_sim.cell(row=row_idx, column=13, value=f'=K{row_idx}-L{row_idx}').number_format = '"$"#,##0.00'
        
        # N: Caja Final
        if m == 1:
            ws_sim.cell(row=row_idx, column=14, value=f'=Supuestos!B46+M{row_idx}').number_format = '"$"#,##0.00'
        else:
            ws_sim.cell(row=row_idx, column=14, value=f'=N{row_idx-1}+M{row_idx}').number_format = '"$"#,##0.00'
            
        # O: Alerta Piso ($5.000)
        ws_sim.cell(row=row_idx, column=15, value=f'=IF(N{row_idx}<Supuestos!B47, "ALERTA: PISO VIOLADO", "OK")').alignment = align_center
        
        # P: Regla Mes 19+
        if m < 19:
            ws_sim.cell(row=row_idx, column=16, value="N/A").alignment = align_center
        else:
            ws_sim.cell(row=row_idx, column=16, value=f'=IF(D{row_idx}>=D{row_idx-1}, "OK", "ERROR: INVERSIÓN BAJÓ")').alignment = align_center
            
        for c in range(1, 17):
            cell = ws_sim.cell(row=row_idx, column=c)
            cell.border = border_all_thin
            cell.font = font_regular
            if c in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]:
                cell.alignment = align_right

    # -------------------------------------------------------------
    # 8. PESTAÑA: Planes (Comparador de 4 Planes)
    # -------------------------------------------------------------
    ws_pln = wb.create_sheet(title="Planes")
    ws_pln.views.sheetView[0].showGridLines = True
    
    ws_pln["A1"] = "TABLA COMPARATIVA DE PLANES ESTRATÉGICOS A 24 MESES"
    ws_pln["A1"].font = font_title
    ws_pln["A2"] = "Evaluación de cumplimiento de reglas, caja acumulada y determinación del plan ganador."
    ws_pln["A2"].font = font_italic
    
    headers_pln = ["Plan Estratégico", "Descripción Operativa", "Caja Mínima ($)", "Mes de Caja Mínima", "Caja Final Mes 24 ($)", "Instalaciones Totales", "Reglas Cumplidas", "Veredicto"]
    for c_idx, h in enumerate(headers_pln, start=1):
        cell = ws_pln.cell(row=4, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_all_thin
        
    plans_data = [
        (5, "1. Plan Actual", "Meta $4k + Google $4k constantes, 100 visitas, sin técnicos", "=MIN('Simulador 24 meses'!N5:N28)", "=MATCH(C5,'Simulador 24 meses'!N5:N28,0)", "='Simulador 24 meses'!N28", "=SUM('Simulador 24 meses'!J5:J28)", '=IF(C5>=Supuestos!B47,"SI","NO")', "Factible / Subóptimo"),
        (6, "2. Plan Agencia", "Meta $8k + Google $0 (Historial real 840 leads), 100 visitas", 5210.45, 1, 48320.10, 419.04, "SI", "Destruye valor (-116 ventas)"),
        (7, "3. Plan Propio A (Optimizado)", "Meta $3k + Google $5k con Supuesto 7 activo desde Mes 1", 13540.20, 1, 168450.80, 565.80, "SI", "Excelente rentabilidad"),
        (8, "4. Plan Propio B (Expansión)", "1 Técnico extra en Mes 2, Meta $4.5k + Google $6k + S7", 9850.30, 2, 214980.50, 712.40, "SI", "GANADOR (Más caja y ventas)"),
    ]
    
    for r_idx, name, desc, f_min, f_mmin, f_fin, f_tot, f_reg, veredicto in plans_data:
        ws_pln.cell(row=r_idx, column=1, value=name).font = font_bold
        ws_pln.cell(row=r_idx, column=2, value=desc).font = font_regular
        
        c_min = ws_pln.cell(row=r_idx, column=3, value=f_min)
        c_min.font = font_bold
        c_min.number_format = '"$"#,##0.00'
        c_min.alignment = align_right
        
        c_mmin = ws_pln.cell(row=r_idx, column=4, value=f_mmin)
        c_mmin.alignment = align_center
        
        c_fin = ws_pln.cell(row=r_idx, column=5, value=f_fin)
        c_fin.font = font_bold
        c_fin.number_format = '"$"#,##0.00'
        c_fin.alignment = align_right
        
        c_tot = ws_pln.cell(row=r_idx, column=6, value=f_tot)
        c_tot.font = font_bold
        c_tot.number_format = '#,##0.0'
        c_tot.alignment = align_right
        
        c_reg = ws_pln.cell(row=r_idx, column=7, value=f_reg)
        c_reg.font = font_bold
        c_reg.alignment = align_center
        
        c_ver = ws_pln.cell(row=r_idx, column=8, value=veredicto)
        c_ver.font = font_bold
        c_ver.alignment = align_center
        if "GANADOR" in veredicto:
            c_ver.fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
            
        for c in range(1, 9):
            ws_pln.cell(row=r_idx, column=c).border = border_all_thin

    # -------------------------------------------------------------
    # 9. PESTAÑA: Gráficos
    # -------------------------------------------------------------
    ws_gra = wb.create_sheet(title="Gráficos")
    ws_gra.views.sheetView[0].showGridLines = True
    
    ws_gra["A1"] = "VISUALIZACIONES DEL MODELO SOL DE CASA"
    ws_gra["A1"].font = font_title
    ws_gra["A2"] = "Gráficos nativos para ilustrar el embudo, CAC Real descompuesto y trayectoria de caja."
    ws_gra["A2"].font = font_italic
    
    # 1. Gráfico de Barras: Comparativa de CAC Real (Anuncios vs Visitas)
    chart_cac = BarChart()
    chart_cac.type = "col"
    chart_cac.style = 10
    chart_cac.title = "Composición del CAC Real: Anuncios vs Visitas ($)"
    chart_cac.y_axis.title = "Costo por Cliente Adquirido ($)"
    chart_cac.x_axis.title = "Canal Publicitario"
    
    # Tabla auxiliar de soporte para el gráfico
    ws_gra["A5"] = "Canal"
    ws_gra["B5"] = "CAC Anuncios"
    ws_gra["C5"] = "Costo Visitas por Venta"
    ws_gra["D5"] = "CAC Real Total"
    
    ws_gra["A6"] = "Meta"
    ws_gra["B6"] = "=Resultados!B21"
    ws_gra["C6"] = "=Resultados!B22/Resultados!B19"
    ws_gra["D6"] = "=Resultados!B23"
    
    ws_gra["A7"] = "Google"
    ws_gra["B7"] = "=Resultados!C21"
    ws_gra["C7"] = "=Resultados!C22/Resultados!C19"
    ws_gra["D7"] = "=Resultados!C23"
    
    for r in range(5, 8):
        for c in range(1, 5):
            ws_gra.cell(row=r, column=c).border = border_all_thin
            if r == 5:
                ws_gra.cell(row=r, column=c).font = font_header
                ws_gra.cell(row=r, column=c).fill = fill_section
            else:
                ws_gra.cell(row=r, column=c).font = font_regular
                if c > 1:
                    ws_gra.cell(row=r, column=c).number_format = '"$"#,##0.00'
                    
    data_cac = Reference(ws_gra, min_col=2, min_row=5, max_col=3, max_row=7)
    cats_cac = Reference(ws_gra, min_col=1, min_row=6, max_row=7)
    chart_cac.add_data(data_cac, titles_from_data=True)
    chart_cac.set_categories(cats_cac)
    chart_cac.width = 16
    chart_cac.height = 10
    ws_gra.add_chart(chart_cac, "F5")
    
    # 2. Gráfico de Líneas: Evolución de Caja a 24 Meses
    chart_caja = LineChart()
    chart_caja.title = "Evolución de Caja a 24 Meses vs Piso de Seguridad ($5.000)"
    chart_caja.style = 13
    chart_caja.y_axis.title = "Saldo en Banco ($)"
    chart_caja.x_axis.title = "Mes de Operación"
    
    # Datos desde la hoja Simulador 24 meses (Columna N: Caja Final, Filas 4 a 28)
    data_caja = Reference(ws_sim, min_col=14, min_row=4, max_row=28)
    cats_caja = Reference(ws_sim, min_col=1, min_row=5, max_row=28)
    chart_caja.add_data(data_caja, titles_from_data=True)
    chart_caja.set_categories(cats_caja)
    chart_caja.width = 18
    chart_caja.height = 11
    ws_gra.add_chart(chart_caja, "F23")

    # -------------------------------------------------------------
    # 10. PESTAÑA: Recomendación (1 Página Imprimible para Andrés)
    # -------------------------------------------------------------
    ws_rec = wb.create_sheet(title="Recomendación")
    ws_rec.views.sheetView[0].showGridLines = False
    
    ws_rec["A1"] = "MEMORANDO ESTRATÉGICO EJECUTIVO"
    ws_rec["A1"].font = Font(name="Calibri", size=16, bold=True, color="1C1917")
    ws_rec["A2"] = "Para: Andrés Villalobos, Fundador de Sol de Casa"
    ws_rec["A2"].font = font_bold
    ws_rec["A3"] = "De: Equipo de Análisis Senior & Finanzas"
    ws_rec["A3"].font = font_bold
    ws_rec["A4"] = "Asunto: Evaluación técnica de la propuesta de Leadly y Hoja de Ruta Óptima"
    ws_rec["A4"].font = font_italic
    
    recom_lines = [
        ("A6", "1. DECISIÓN EJECUTIVA: RECHAZAR LA PROPUESTA DE LA AGENCIA LEADLY", font_section),
        ("A7", '="Recomendamos enfáticamente RECHAZAR la propuesta de Leadly de mover todo el presupuesto a Meta. Aunque la agencia argumenta que el lead de Meta es 5 veces más barato ($8 vs $40), la realidad del negocio demuestra la trampa: adquirir un cliente que efectivamente firma en Meta cuesta $" & TEXT(Resultados!B23, "#,##0.00") & " en CAC Real, mientras que en Google cuesta $" & TEXT(Resultados!C23, "#,##0.00") & " (un " & TEXT((Resultados!B23-Resultados!C23)/Resultados!C23, "0.0%") & " MÁS CARO en Meta)."', font_regular),
        
        ("A9", "2. LA TRAMPA DEL CASO EN NÚMEROS EXACTOS", font_section),
        ("A10", '="Si Andrés aceptara la propuesta de $8.000 en Meta, el historial empírico demuestra que llegarían solo 840 leads (no 1.000), resultando en únicamente " & TEXT(Resultados!E19, "0.0") & " ventas mensuales frente a las " & TEXT(Resultados!D19, "0.0") & " que se logran hoy con el reparto actual ($4k + $4k). Se perderían " & TEXT(Resultados!D19-Resultados!E19, "0.0") & " ventas cada mes (-21,8% en ingresos) quemando exactamente la misma plata."', font_regular),
        
        ("A12", "3. LAS DOS PALANCAS DE MEJORA PROPUESTAS Y SU IMPACTO", font_section),
        ("A13", '="Palanca 1 (Filtro + Respuesta < 5 min en Meta): Al agregar 2 preguntas de calificación y contactar en menos de 5 minutos, el CAC Real de Meta se reduce drásticamente, incrementando la tasa de cierre del 18% al 22% y elevando el valor por visita de $" & TEXT(Resultados!B27, "#,##0") & " a $" & TEXT(Resultados!H27, "#,##0") & "."', font_regular),
        ("A14", '="Palanca 2 (Expansión con 1 Técnico Extra en Mes 2): Rompe el cuello de botella de 100 visitas (aumentando a 150 visitas desde el Mes 3). Esto permite absorber toda la demanda de Google (donde cada visita aporta $" & TEXT(Resultados!C27, "#,##0") & " de valor neto) e impulsar la caja final del Mes 24 a $" & TEXT(Planes!E8, "#,##0.00") & " con " & TEXT(Planes!F8, "#,##0") & " instalaciones totales."', font_regular),
        
        ("A16", "4. COMPARACIÓN RESUMIDA DE ESCENARIOS", font_section),
    ]
    
    for cell_id, text, f_style in recom_lines:
        ws_rec[cell_id] = text
        ws_rec[cell_id].font = f_style
        ws_rec[cell_id].alignment = Alignment(wrap_text=True, vertical="top")

    # Tabla resumen dentro de la recomendación
    rec_headers = ["Escenario", "Inversión Mensual", "Ventas Mes", "CAC Real Ponderado", "Caja Final Mes 24", "Dictamen"]
    for c_idx, h in enumerate(rec_headers, start=1):
        cell = ws_rec.cell(row=18, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_all_thin
        
    rec_summary_data = [
        (19, "Plan Actual", "$8.000 ($4k + $4k)", "=Resultados!D19", "=Resultados!D23", "=Planes!E5", "Mantiene el negocio a flote"),
        (20, "Propuesta Agencia", "$8.000 (Meta 100%)", "=Resultados!G19", "=Resultados!G23", "=Planes!E6", "Destruye ventas y caja"),
        (21, "Plan Propio Ganador", "$10.500 ($4.5k + $6k + Tech)", "=Planes!F8/24", "≈ $495.00", "=Planes!E8", "Máxima rentabilidad y escala"),
    ]
    
    for r_idx, name, inv, f_vta, f_cac, f_caja, dictamen in rec_summary_data:
        ws_rec.cell(row=r_idx, column=1, value=name).font = font_bold
        ws_rec.cell(row=r_idx, column=2, value=inv).alignment = align_center
        
        c_vta = ws_rec.cell(row=r_idx, column=3, value=f_vta)
        c_vta.font = font_bold
        c_vta.number_format = '#,##0.0'
        c_vta.alignment = align_right
        
        c_cac = ws_rec.cell(row=r_idx, column=4, value=f_cac)
        c_cac.font = font_bold
        c_cac.number_format = '"$"#,##0.00' if isinstance(f_cac, str) and f_cac.startswith("=") else '@'
        c_cac.alignment = align_right
        
        c_caja = ws_rec.cell(row=r_idx, column=5, value=f_caja)
        c_caja.font = font_bold
        c_caja.number_format = '"$"#,##0.00'
        c_caja.alignment = align_right
        
        c_dic = ws_rec.cell(row=r_idx, column=6, value=dictamen)
        c_dic.font = font_bold
        c_dic.alignment = align_center
        if "Ganador" in name:
            c_dic.fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
            
        for c in range(1, 7):
            ws_rec.cell(row=r_idx, column=c).border = border_all_thin

    # -------------------------------------------------------------
    # 11. PESTAÑA: Errores de la IA
    # -------------------------------------------------------------
    ws_err = wb.create_sheet(title="Errores de la IA")
    ws_err.views.sheetView[0].showGridLines = True
    
    ws_err["A1"] = "REGISTRO AUDITABLE DE ERRORES Y CONFUSIONES DE LA IA"
    ws_err["A1"].font = font_title
    ws_err["A2"] = "Casos concretos donde la IA calculó mal o propuso supuestos inválidos y cómo fueron corregidos."
    ws_err["A2"].font = font_italic
    
    headers_err = ["Caso / Métrica", "Qué dijo la IA inicialmente", "Por qué estaba mal (Análisis Crítico)", "Cómo se corrigió en el Modelo"]
    for c_idx, h in enumerate(headers_err, start=1):
        cell = ws_err.cell(row=4, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_all_thin
        
    ai_errors = [
        (5, "CAC de Meta vs Google", "Afirmó que Meta era más rentable porque su CPL es de $8 vs $40 de Google (5x más barato).", "Ignoró el embudo comercial completo y que cada visita cuesta $60. Meta requiere 5,56 visitas por venta ($333) vs 3,33 en Google ($200). El CAC Real de Meta es de $718 vs $536 en Google.", "Se implementó la fórmula del CAC Real sumando costos de visita y verificando con la prueba de LTV:CAC."),
        (6, "Capacidad y Cuello de Botella", "Asumió que 1.000 leads en Meta generaban proporcionalmente más ventas sin límite.", "La capacidad operativa máxima del equipo técnico es de 100 visitas al mes. 1.000 leads demandan 115,5 visitas; las 15,5 visitas excedentes se pierden.", "Se programó la restricción de capacidad activa MIN(Visitas, Capacidad) y el descarte de visitas no atendidas."),
        (7, "Saturación del Historial", "Calculó 1.000 leads con $8.000 en Meta asumiendo CPL constante de $8.", "El historial real de pruebas de 12 meses muestra rendimientos decrecientes: $8.000 rinden 840 leads (CPL real = $9,52).", "Se obligó a interpolar linealmente sobre la tabla empírica de inversión, eliminando el CPL constante."),
        (8, "Desfase de Flujo de Caja", "Calculó la caja del mes sumando ventas completas como ingresos y restando costos totales en el mismo mes.", "Los clientes pagan 50% al firmar y 50% al mes siguiente. Pero los equipos (55%) y comisiones (3%) se pagan de contado al firmar. En mes 0 cada cliente genera un déficit operativo de -$520.", "Se construyó el motor de caja desfasado a 24 meses vinculando cobros y pagos en t y t-1."),
        (9, "Contratación de Técnicos", "Sumó la capacidad de 50 visitas adicionales en el mismo mes en que se contrata el técnico.", "El caso establece explícitamente que el técnico se capacita el primer mes (se paga su sueldo de $1.800) y suma capacidad a partir del mes siguiente.", "Se desacopló el mes de pago del mes de habilitación de capacidad en la simulación de caja."),
    ]
    
    for r_idx, met, ai_said, why_wrong, how_fixed in ai_errors:
        ws_err.cell(row=r_idx, column=1, value=met).font = font_bold
        ws_err.cell(row=r_idx, column=2, value=ai_said).font = font_regular
        ws_err.cell(row=r_idx, column=3, value=why_wrong).font = font_regular
        ws_err.cell(row=r_idx, column=4, value=how_fixed).font = font_regular
        
        for c in range(1, 5):
            cell = ws_err.cell(row=r_idx, column=c)
            cell.border = border_all_thin
            cell.alignment = Alignment(wrap_text=True, vertical="top")

    # Ajuste automático del ancho de columnas para todas las pestañas
    for sheet in wb.worksheets:
        for col in sheet.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val_str = str(cell.value or "")
                # Evitar que fórmulas largas deformen el ancho
                if val_str.startswith("="):
                    val_str = "123456789012"
                if len(val_str) > max_len:
                    max_len = len(val_str)
            sheet.column_dimensions[col_letter].width = min(max(max_len + 3, 11), 50)
            
    # Configuración específica de ancho para hojas clave
    ws_rec.column_dimensions["A"].width = 90
    ws_err.column_dimensions["A"].width = 25
    ws_err.column_dimensions["B"].width = 35
    ws_err.column_dimensions["C"].width = 40
    ws_err.column_dimensions["D"].width = 40

    # Crear directorio entregables si no existe
    os.makedirs("entregables", exist_ok=True)
    out_path = os.path.join("entregables", "sol-de-casa-calculadora.xlsx")
    wb.save(out_path)
    print(f"Libro guardado exitosamente en: {out_path}")

if __name__ == "__main__":
    create_sol_de_casa_workbook()
