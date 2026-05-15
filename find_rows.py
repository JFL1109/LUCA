import openpyxl

wb = openpyxl.load_workbook(r"c:\Users\james\Documents\Code\LUCA\Land Use Change Assessor - LUCA (V3).xlsm", data_only=True)
ws = wb['LU-Baseline']

for r in range(1, 100):
    row_vals = [str(cell.value) for cell in ws[r]]
    if any("East Coast" in val for val in row_vals if val != "None"):
        print(f"Found 'East Coast' at Excel Row {r}")
        print(f"Row content: {row_vals[:15]}")
        break

ws_a = wb['Assumptions']
for r in range(1, 30):
    row_vals = [str(cell.value) for cell in ws_a[r]]
    if any("East Coast" in val for val in row_vals if val != "None"):
        print(f"Found 'East Coast' in Assumptions at Excel Row {r}")
        print(f"Row content: {row_vals[:15]}")
