import openpyxl

wb = openpyxl.load_workbook(r"c:\Users\james\Documents\Code\LUCA\Land Use Change Assessor - LUCA (V3).xlsm", data_only=True)
ws_a = wb['Assumptions']

for r in range(10, 45):
    ind = ws_a.cell(row=r, column=3).value
    print(f"Assumptions Row {r}: {ind}")
