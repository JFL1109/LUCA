import openpyxl

wb = openpyxl.load_workbook(r"c:\Users\james\Documents\Code\LUCA\Land Use Change Assessor - LUCA (V3).xlsm", data_only=True)
ws_a = wb['Assumptions']

for r in range(1, 15):
    vals = [str(cell.value) for cell in ws_a[r]]
    if any("East Coast" in val for val in vals):
        print(f"Assumptions: Found 'East Coast' at Row {r}")
        print(f"Row {r} content: {vals[:15]}")
