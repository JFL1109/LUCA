import openpyxl

wb = openpyxl.load_workbook(r"c:\Users\james\Documents\Code\LUCA\Land Use Change Assessor - LUCA (V3).xlsm", data_only=True)
ws = wb['LU-Baseline']

found = False
for r in range(1, 10):
    vals = [str(cell.value) for cell in ws[r]]
    print(f"Row {r}: {vals[:15]}")
    if "Land Use" in vals:
        print(f"Found 'Land Use' at Row {r}")
        found = True

ws_a = wb['Assumptions']
for r in range(11, 14):
    vals = [str(cell.value) for cell in ws_a[r]]
    print(f"Assumptions Row {r}: {vals[:15]}")
